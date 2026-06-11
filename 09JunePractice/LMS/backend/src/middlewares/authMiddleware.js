const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/environment');
const AppError = require('../utils/AppError');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Access token is missing or expired.', 401));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new AppError('Access token is missing or expired.', 401));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    next();
  } catch (err) {
    return next(new AppError('Access token is missing or expired.', 401));
  }
};

const verifyRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Access restricted.', 403));
    }
    next();
  };
};

module.exports = {
  verifyToken,
  verifyRole
};
