const Doubt = require('../models/Doubt');
const Topic = require('../models/Topic');
const Module = require('../models/Module');
const Progress = require('../models/Progress');
const AppError = require('../utils/AppError');
const { checkCourseOwnership } = require('./courseService');

const createDoubt = async ({ topicId, question }, studentId) => {
  const topic = await Topic.findById(topicId);
  if (!topic) {
    throw new AppError('Topic not found', 404);
  }

  const moduleObj = await Module.findById(topic.moduleId);
  const courseId = moduleObj.courseId;

  // Enrollment check
  const progress = await Progress.findOne({ userId: studentId, courseId });
  if (!progress) {
    throw new AppError('Access denied. You must enroll in this course to view announcements.', 403);
  }

  // Sequential lock check
  const modules = await Module.find({ courseId }).sort({ sequenceIndex: 1 });
  const moduleIds = modules.map(m => m._id);
  const allTopics = await Topic.find({ moduleId: { $in: moduleIds } }).sort({ sequenceIndex: 1 });

  const currentTopicIndex = allTopics.findIndex(t => t._id.toString() === topic._id.toString());
  const completedTopics = progress.completedTopics || [];

  for (let i = 0; i < currentTopicIndex; i++) {
    if (!completedTopics.includes(allTopics[i]._id.toString())) {
      throw new AppError('Topic is locked.', 403);
    }
  }

  const doubt = new Doubt({
    topicId,
    studentId,
    question,
    answers: []
  });

  await doubt.save();
  return doubt;
};

const postAnswer = async (doubtId, { content, isOfficial }, user) => {
  const doubt = await Doubt.findById(doubtId);
  if (!doubt) {
    throw new AppError('Doubt thread not found.', 404);
  }

  const topic = await Topic.findById(doubt.topicId);
  const moduleObj = await Module.findById(topic.moduleId);

  if (isOfficial) {
    if (user.role !== 'Instructor') {
      throw new AppError('Only Instructors can set to true', 403);
    }
    // Verify instructor ownership of the course
    try {
      await checkCourseOwnership(moduleObj.courseId, user.id);
    } catch (e) {
      throw new AppError('Only the course instructor can mark official responses.', 403);
    }
  }

  doubt.answers.push({
    repliedBy: user.id,
    content,
    isOfficial: !!isOfficial
  });

  if (isOfficial) {
    doubt.isResolved = true;
  }

  // Sort answers so isOfficial: true comes first
  doubt.answers.sort((a, b) => (b.isOfficial ? 1 : 0) - (a.isOfficial ? 1 : 0));

  await doubt.save();
  return doubt;
};

const getDoubts = async (topicId, user) => {
  const topic = await Topic.findById(topicId);
  if (!topic) {
    throw new AppError('Topic not found', 404);
  }

  const moduleObj = await Module.findById(topic.moduleId);
  const courseId = moduleObj.courseId;

  // Enrollment check for Learner
  if (user.role === 'Learner') {
    const progress = await Progress.findOne({ userId: user.id, courseId });
    if (!progress) {
      throw new AppError('Access denied. You must enroll in this course to view announcements.', 403);
    }
  }

  const doubts = await Doubt.find({ topicId }).populate('answers.repliedBy', 'name role');
  
  // Sort answers inside each doubt
  for (const d of doubts) {
    d.answers.sort((a, b) => (b.isOfficial ? 1 : 0) - (a.isOfficial ? 1 : 0));
  }

  return doubts;
};

module.exports = {
  createDoubt,
  postAnswer,
  getDoubts
};
