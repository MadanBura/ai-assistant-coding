const AppError = require('../utils/AppError');

const noSqlRegex = /^\$/;

const hasNoSqlOperator = (obj) => {
  if (!obj || typeof obj !== 'object') return false;
  for (const key in obj) {
    if (noSqlRegex.test(key)) return true;
    if (typeof obj[key] === 'object' && hasNoSqlOperator(obj[key])) return true;
  }
  return false;
};

const validateRegister = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new AppError('Name, email, password, and role are required.', 400));
  }

  if (hasNoSqlOperator(req.body)) {
    return next(new AppError('Invalid input payload.', 400));
  }

  const { name, email, password, role } = req.body;

  if (name === undefined || email === undefined || password === undefined || role === undefined) {
    return next(new AppError('Name, email, password, and role are required.', 400));
  }

  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string' || typeof role !== 'string') {
    return next(new AppError('All fields must be strings.', 400));
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedPassword = password;
  const trimmedRole = role.trim();

  if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedRole) {
    return next(new AppError('Name, email, password, and role are required.', 400));
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return next(new AppError('Invalid email format.', 400));
  }

  if (trimmedPassword.length < 8) {
    return next(new AppError('Password must be at least 8 characters.', 400));
  }

  if (trimmedRole !== 'Learner' && trimmedRole !== 'Instructor') {
    return next(new AppError(`${trimmedRole} is not a valid role.`, 400));
  }

  req.body.name = trimmedName;
  req.body.email = trimmedEmail;
  req.body.role = trimmedRole;

  next();
};

const validateLogin = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new AppError('Email and password are required.', 400));
  }

  if (hasNoSqlOperator(req.body)) {
    return next(new AppError('Invalid input payload.', 400));
  }

  const { email, password } = req.body;

  if (email === undefined || password === undefined) {
    return next(new AppError('Email and password are required.', 400));
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    return next(new AppError('Email and password must be strings.', 400));
  }

  const trimmedEmail = email.trim();
  const trimmedPassword = password;

  if (!trimmedEmail || !trimmedPassword) {
    return next(new AppError('Email and password are required.', 400));
  }

  req.body.email = trimmedEmail;
  next();
};

const validateProfileUpdate = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next();
  }

  if (hasNoSqlOperator(req.body)) {
    return next(new AppError('Invalid input payload.', 400));
  }

  const { name, email, role } = req.body;

  if (role !== undefined) {
    if (role !== req.user.role) {
      return next(new AppError('Modifying user role is prohibited.', 403));
    }
  }

  if (name !== undefined) {
    if (typeof name !== 'string') {
      return next(new AppError('Name must be a string.', 400));
    }
    req.body.name = name.trim();
    if (!req.body.name) {
      return next(new AppError('Name cannot be empty.', 400));
    }
  }

  if (email !== undefined) {
    if (typeof email !== 'string') {
      return next(new AppError('Email must be a string.', 400));
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      return next(new AppError('Invalid email format.', 400));
    }
    req.body.email = email.trim();
  }

  // Strip password parameter
  delete req.body.password;

  next();
};

const validateQuizSubmit = (req, res, next) => {
  if (!req.body || !req.body.answers || !Array.isArray(req.body.answers)) {
    return next(new AppError('Answers are required.', 400));
  }

  for (const ans of req.body.answers) {
    if (!ans.questionId || ans.selectedOptionIndex === undefined) {
      return next(new AppError('Each answer must have a questionId and selectedOptionIndex.', 400));
    }
  }

  next();
};

const validateAnnouncementCreate = (req, res, next) => {
  const courseId = req.body.courseId || req.params.id;
  const { title, content, priority } = req.body;

  if (!courseId || !title || !content || !priority) {
    return next(new AppError('Title, content, and valid priority level are required.', 400));
  }

  if (hasNoSqlOperator(req.body)) {
    return next(new AppError('Invalid input payload.', 400));
  }

  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return next(new AppError('Invalid course ID.', 400));
  }

  if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 100) {
    return next(new AppError('Title must be between 3 and 100 characters.', 400));
  }

  if (typeof content !== 'string' || content.trim().length < 10 || content.trim().length > 1000) {
    return next(new AppError('Content must be between 10 and 1000 characters.', 400));
  }

  if (!['Info', 'Warning', 'Urgent'].includes(priority)) {
    return next(new AppError('Invalid priority level.', 400));
  }

  next();
};

const validateAnnouncementGet = (req, res, next) => {
  const courseId = req.query.courseId || req.params.id;
  if (!courseId) {
    return next(new AppError('Course ID is required.', 400));
  }

  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return next(new AppError('Invalid course ID.', 400));
  }

  next();
};

const validateAssignmentCreate = (req, res, next) => {
  const { topicId, title, description, maxScore, dueDate } = req.body;
  if (!topicId || !title) {
    return next(new AppError('Title is required.', 400));
  }

  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    return next(new AppError('Invalid topic ID.', 400));
  }

  if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 100) {
    return next(new AppError('Title must be between 3 and 100 characters.', 400));
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim().length < 10 || description.trim().length > 1000) {
      return next(new AppError('Description must be between 10 and 1000 characters.', 400));
    }
  }

  if (maxScore !== undefined) {
    const scoreNum = Number(maxScore);
    if (!Number.isInteger(scoreNum) || scoreNum < 1 || scoreNum > 1000) {
      return next(new AppError('Max score must be an integer between 1 and 1000.', 400));
    }
  }

  next();
};

const validateGradeSubmission = (req, res, next) => {
  const { grade, feedback } = req.body;
  if (grade === undefined || !feedback) {
    return next(new AppError('Grade and feedback comments are required.', 400));
  }
  const gradeNum = Number(grade);
  if (isNaN(gradeNum) || gradeNum < 0) {
    return next(new AppError('Grade must be between 0 and assignment maximum score.', 400));
  }
  if (typeof feedback !== 'string' || !feedback.trim()) {
    return next(new AppError('Grade and feedback comments are required.', 400));
  }
  next();
};

const validateDoubtCreate = (req, res, next) => {
  const { topicId, question } = req.body;
  if (!topicId || !question) {
    return next(new AppError('Question content cannot be empty.', 400));
  }

  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    return next(new AppError('Invalid topic ID.', 400));
  }

  if (typeof question !== 'string' || question.trim().length < 5 || question.trim().length > 500) {
    return next(new AppError('Question must be between 5 and 500 characters.', 400));
  }

  next();
};

const validateAnswerCreate = (req, res, next) => {
  const { content } = req.body;
  if (!content) {
    return next(new AppError('Answer text cannot be empty.', 400));
  }

  if (typeof content !== 'string' || content.trim().length < 5 || content.trim().length > 1000) {
    return next(new AppError('Answer must be between 5 and 1000 characters.', 400));
  }

  next();
};

const validateQuizFeedbackSetup = (req, res, next) => {
  const { topicId, questions } = req.body;
  if (!topicId || !questions) {
    return next(new AppError('Question text is required.', 400));
  }

  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    return next(new AppError('Invalid topic ID.', 400));
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return next(new AppError('Question text is required.', 400));
  }

  next();
};

const validateBadgeCreate = (req, res, next) => {
  const courseId = req.body.courseId || req.params.id;
  const { title, iconUrl, triggerType } = req.body;

  if (!courseId || !title || !iconUrl || !triggerType) {
    return next(new AppError('Title and Icon URL are required.', 400));
  }

  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return next(new AppError('Invalid course ID.', 400));
  }

  if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 50) {
    return next(new AppError('Title must be between 3 and 50 characters.', 400));
  }

  try {
    const parsedUrl = new URL(iconUrl);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error();
    }
  } catch (e) {
    return next(new AppError('Must be a valid HTTP/HTTPS image URL', 400));
  }

  if (!['CourseCompletion', 'PerfectQuizzes', 'FastTrack'].includes(triggerType)) {
    return next(new AppError('Invalid trigger type.', 400));
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateQuizSubmit,
  validateAnnouncementCreate,
  validateAnnouncementGet,
  validateAssignmentCreate,
  validateGradeSubmission,
  validateDoubtCreate,
  validateAnswerCreate,
  validateQuizFeedbackSetup,
  validateBadgeCreate
};




