const rateLimit = require('express-rate-limit');

// Strict rate limiter for critical mutation endpoints (submissions, exams)
const submitLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 submit requests per windowMs
  message: {
    success: false,
    message: 'Too many submissions from this IP, please try again after a minute.'
  }
});

module.exports = {
  submitLimiter
};
