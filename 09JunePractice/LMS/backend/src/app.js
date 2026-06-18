const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const customMongoSanitize = require('./middlewares/mongoSanitize');
const connectDB = require('./config/db');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

const rateLimit = require('express-rate-limit');
if (process.env.NODE_ENV !== 'test') {
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again after a minute.'
    }
  });
  app.use('/api', limiter);
}

// Connect to MongoDB
connectDB();

// Trigger Node.js course seeding (non-test envs)
if (process.env.NODE_ENV !== 'test') {
  require('./seedNodejsCourseStartup');
}

// Security and standard middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Data sanitization against NoSQL query injection
app.use(customMongoSanitize);

// Request logging configuration (skip during tests)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Route mapping
app.use('/api', routes);

// Global operational error handler
app.use(errorMiddleware);

module.exports = app;
