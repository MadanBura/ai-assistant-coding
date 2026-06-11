const Course = require('../models/Course');
const Module = require('../models/Module');
const Topic = require('../models/Topic');
const Resource = require('../models/Resource');
const Progress = require('../models/Progress');
const Certificate = require('../models/Certificate');
const AppError = require('../utils/AppError');

// Ownership checks
const checkCourseOwnership = async (courseId, instructorId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }
  if (course.instructorId.toString() !== instructorId) {
    throw new AppError('Only the owning instructor can modify this course.', 403);
  }
  return course;
};

const checkModuleOwnership = async (moduleId, instructorId) => {
  const moduleObj = await Module.findById(moduleId);
  if (!moduleObj) {
    throw new AppError('Module not found', 404);
  }
  await checkCourseOwnership(moduleObj.courseId, instructorId);
  return moduleObj;
};

const checkTopicOwnership = async (topicId, instructorId) => {
  const topicObj = await Topic.findById(topicId);
  if (!topicObj) {
    throw new AppError('Topic not found', 404);
  }
  await checkModuleOwnership(topicObj.moduleId, instructorId);
  return topicObj;
};

const checkResourceOwnership = async (resourceId, instructorId) => {
  const resourceObj = await Resource.findById(resourceId);
  if (!resourceObj) {
    throw new AppError('Resource not found', 404);
  }
  await checkTopicOwnership(resourceObj.topicId, instructorId);
  return resourceObj;
};

// Course CRUD
const createCourse = async ({ title, description, category }, instructorId) => {
  if (!title || !description || !category) {
    throw new AppError('Title, description, and category are required.', 400);
  }
  const course = new Course({ title, description, category, instructorId });
  await course.save();
  return {
    id: course._id.toString(),
    title: course.title,
    description: course.description,
    category: course.category,
    instructorId: course.instructorId.toString()
  };
};

const getAllCourses = async () => {
  const courses = await Course.find();
  return courses.map(c => ({
    id: c._id.toString(),
    title: c.title,
    description: c.description,
    category: c.category,
    instructorId: c.instructorId.toString()
  }));
};

const getCourseById = async (courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const modules = await Module.find({ courseId }).sort({ sequenceIndex: 1 });

  const nestedModules = await Promise.all(
    modules.map(async (mod) => {
      const topics = await Topic.find({ moduleId: mod._id }).sort({ sequenceIndex: 1 });
      return {
        id: mod._id.toString(),
        title: mod.title,
        sequenceIndex: mod.sequenceIndex,
        topics: topics.map(t => ({
          id: t._id.toString(),
          title: t.title,
          sequenceIndex: t.sequenceIndex
        }))
      };
    })
  );

  return {
    id: course._id.toString(),
    title: course.title,
    description: course.description,
    category: course.category,
    instructorId: course.instructorId.toString(),
    modules: nestedModules
  };
};

const updateCourse = async (courseId, updates, instructorId) => {
  await checkCourseOwnership(courseId, instructorId);

  const course = await Course.findByIdAndUpdate(
    courseId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return {
    id: course._id.toString(),
    title: course.title,
    description: course.description,
    category: course.category,
    instructorId: course.instructorId.toString()
  };
};

const deleteCourse = async (courseId, instructorId) => {
  await checkCourseOwnership(courseId, instructorId);

  await Course.findByIdAndDelete(courseId);
  await Progress.deleteMany({ courseId });
  await Certificate.deleteMany({ courseId });

  const modules = await Module.find({ courseId });
  const moduleIds = modules.map(m => m._id);
  await Module.deleteMany({ courseId });

  const topics = await Topic.find({ moduleId: { $in: moduleIds } });
  const topicIds = topics.map(t => t._id);
  await Topic.deleteMany({ moduleId: { $in: moduleIds } });

  await Resource.deleteMany({ topicId: { $in: topicIds } });
};

// Module & Topic Design
const addModule = async (courseId, { title, sequenceIndex }, instructorId) => {
  if (!title || sequenceIndex === undefined) {
    throw new AppError('Title and sequence index are required.', 400);
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError('Course not found', 404);
  }
  if (course.instructorId.toString() !== instructorId) {
    throw new AppError('Only the owning instructor can modify this course.', 403);
  }

  const mod = new Module({ courseId, title, sequenceIndex });
  await mod.save();

  return {
    id: mod._id.toString(),
    courseId: mod.courseId.toString(),
    title: mod.title,
    sequenceIndex: mod.sequenceIndex
  };
};

const addTopic = async (moduleId, { title, sequenceIndex }, instructorId) => {
  if (!title || sequenceIndex === undefined) {
    throw new AppError('Title and sequence index are required.', 400);
  }
  await checkModuleOwnership(moduleId, instructorId);

  const topic = new Topic({ moduleId, title, sequenceIndex });
  await topic.save();

  return {
    id: topic._id.toString(),
    moduleId: topic.moduleId.toString(),
    title: topic.title,
    sequenceIndex: topic.sequenceIndex
  };
};

const reorderModules = async (courseId, modulesList, instructorId) => {
  await checkCourseOwnership(courseId, instructorId);

  if (!modulesList || !Array.isArray(modulesList)) {
    throw new AppError('Modules list is required.', 400);
  }

  for (const item of modulesList) {
    await Module.findByIdAndUpdate(item.id, { sequenceIndex: item.sequenceIndex });
  }
};

// Resource Management
const addResource = async (topicId, { type, url, content }, instructorId) => {
  if (!type) {
    throw new AppError('Resource type is required.', 400);
  }
  await checkTopicOwnership(topicId, instructorId);

  if (type === 'Notes') {
    if (!content) {
      throw new AppError('Content is required for notes.', 400);
    }
  } else {
    if (!url) {
      throw new AppError('URL is required for this resource type.', 400);
    }
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error();
      }
    } catch (e) {
      throw new AppError('Invalid URL format.', 400);
    }
  }

  const resource = new Resource({ topicId, type, url, content });
  await resource.save();

  return {
    id: resource._id.toString(),
    topicId: resource.topicId.toString(),
    type: resource.type,
    url: resource.url,
    content: resource.content
  };
};

const updateResource = async (resourceId, { type, url, content }, instructorId) => {
  await checkResourceOwnership(resourceId, instructorId);

  const updates = {};
  if (type !== undefined) updates.type = type;
  if (url !== undefined) {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error();
      }
    } catch (e) {
      throw new AppError('Invalid URL format.', 400);
    }
    updates.url = url;
  }
  if (content !== undefined) updates.content = content;

  const resource = await Resource.findByIdAndUpdate(
    resourceId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return {
    id: resource._id.toString(),
    topicId: resource.topicId.toString(),
    type: resource.type,
    url: resource.url,
    content: resource.content
  };
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addModule,
  addTopic,
  reorderModules,
  addResource,
  updateResource
};
