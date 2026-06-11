require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/lms',
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
