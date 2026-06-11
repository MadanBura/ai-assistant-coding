const mongoose = require('mongoose');

const finalExamAttemptSchema = new mongoose.Schema({
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
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    required: [true, 'Passed status is required']
  }
}, { timestamps: true });

module.exports = mongoose.model('FinalExamAttempt', finalExamAttemptSchema);
