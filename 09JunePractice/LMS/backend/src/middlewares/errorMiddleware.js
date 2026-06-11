const AppError = require('../utils/AppError');

module.exports = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Handle Mongoose duplicate key (code 11000)
  if (err.code === 11000) {
    const message = 'Email already in use.';
    error = new AppError(message, 400);
  }

  // Handle Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join('. ');
    error = new AppError(message, 400);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = new AppError('Access token is missing or expired.', 401);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error.'
  });
};
