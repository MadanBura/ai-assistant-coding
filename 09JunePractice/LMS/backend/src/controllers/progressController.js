const progressService = require('../services/progressService');
const certificateService = require('../services/certificateService');

const enroll = async (req, res, next) => {
  try {
    const enrollment = await progressService.enrollInCourse(req.params.id, req.user.id);
    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (err) {
    next(err);
  }
};

const getProgress = async (req, res, next) => {
  try {
    const progress = await progressService.getCourseProgress(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (err) {
    next(err);
  }
};

const completeTopic = async (req, res, next) => {
  try {
    const result = await progressService.markTopicComplete(req.params.topicId, req.user.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

const getTopicDetails = async (req, res, next) => {
  try {
    const topicDetails = await progressService.getTopicDetails(req.params.id, req.params.topicId, req.user.id);
    res.status(200).json({
      success: true,
      data: topicDetails
    });
  } catch (err) {
    next(err);
  }
};

const getFinalExam = async (req, res, next) => {
  try {
    const exam = await progressService.getFinalExam(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: exam
    });
  } catch (err) {
    next(err);
  }
};

const getTopicAssessment = async (req, res, next) => {
  try {
    const assessment = await progressService.getTopicAssessment(req.params.topicId, req.user.id);
    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (err) {
    next(err);
  }
};

const submitQuizAssessment = async (req, res, next) => {
  try {
    const result = await progressService.submitQuizAssessment(req.params.topicId, req.body.answers, req.user.id);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
};

const submitFinalExam = async (req, res, next) => {
  try {
    const result = await progressService.submitFinalExam(req.params.id, req.body.answers, req.user.id);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
};

const getCertificate = async (req, res, next) => {
  try {
    const { pdfBuffer, filename } = await certificateService.generateCertificatePDF(req.params.id, req.user.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

const getEnrolledCourses = async (req, res, next) => {
  try {
    const enrollments = await progressService.getEnrolledCourses(req.user.id);
    res.status(200).json({
      success: true,
      data: enrollments
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  enroll,
  getProgress,
  completeTopic,
  getTopicDetails,
  getFinalExam,
  getTopicAssessment,
  submitQuizAssessment,
  submitFinalExam,
  getCertificate,
  getEnrolledCourses
};

