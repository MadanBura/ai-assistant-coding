const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
    index: true
  },
  progressPercent: {
    type: Number,
    required: [true, 'Progress percent is required'],
    default: 0,
    min: 0,
    max: 100
  },
  completedTopics: [{
    type: String,
    ref: 'Topic'
  }],
  completedQuizzes: [{
    type: String,
    ref: 'Topic'
  }],
  finalExamPassed: {
    type: Boolean,
    required: [true, 'Final exam passed status is required'],
    default: false
  }
}, { timestamps: true });

// Unique compound index on userId + courseId
progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
