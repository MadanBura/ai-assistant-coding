const courseService = require('../services/courseService');

const createCourse = async (req, res, next) => {
  try {
    const course = await courseService.createCourse(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: course
    });
  } catch (err) {
    next(err);
  }
};

const getAllCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getAllCourses();
    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (err) {
    next(err);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (err) {
    next(err);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const course = await courseService.updateCourse(req.params.id, req.body, req.user.id);
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (err) {
    next(err);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    await courseService.deleteCourse(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Course and associated progress records deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

const addModule = async (req, res, next) => {
  try {
    const moduleObj = await courseService.addModule(req.params.id, req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: moduleObj
    });
  } catch (err) {
    next(err);
  }
};

const addTopic = async (req, res, next) => {
  try {
    const topic = await courseService.addTopic(req.params.moduleId, req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: topic
    });
  } catch (err) {
    next(err);
  }
};

const reorderModules = async (req, res, next) => {
  try {
    await courseService.reorderModules(req.params.id, req.body.modules, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Curriculum sequence updated successfully.'
    });
  } catch (err) {
    next(err);
  }
};

const addResource = async (req, res, next) => {
  try {
    const resource = await courseService.addResource(req.params.topicId, req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (err) {
    next(err);
  }
};

const updateResource = async (req, res, next) => {
  try {
    const resource = await courseService.updateResource(req.params.id, req.body, req.user.id);
    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (err) {
    next(err);
  }
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
