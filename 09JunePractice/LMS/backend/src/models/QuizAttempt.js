const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: [true, 'Topic ID is required'],
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

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
