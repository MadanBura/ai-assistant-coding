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

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateQuizSubmit
};
