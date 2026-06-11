const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

// Connect to MongoDB
connectDB();

// Security and standard middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging configuration (skip during tests)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Route mapping
app.use('/api', routes);

// Global operational error handler
app.use(errorMiddleware);

module.exports = app;
