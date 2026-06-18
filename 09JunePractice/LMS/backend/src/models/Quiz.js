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
  releaseRule: {
    type: String,
    required: [true, 'Release rule is required'],
    enum: {
      values: ['Always', 'OnPassing', 'AfterDeadline'],
      message: '{VALUE} is not a valid release rule'
    },
    default: 'Always'
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
    },
    explanation: {
      type: String,
      trim: true
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);

