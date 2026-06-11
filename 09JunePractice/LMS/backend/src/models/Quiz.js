const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: [true, 'Topic ID is required'],
    unique: true,
    index: true
  },
  passingThreshold: {
    type: Number,
    required: [true, 'Passing threshold is required'],
    default: 70,
    min: 0,
    max: 100
  },
  questions: [{
    questionText: {
      type: String,
      required: [true, 'Question text is required']
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: [arr => arr.length >= 2, 'Minimum 2 options are required']
    },
    correctOptionIndex: {
      type: Number,
      required: [true, 'Correct option index is required'],
      min: 0
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
