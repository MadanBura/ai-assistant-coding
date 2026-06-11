const mongoose = require('mongoose');

const finalExamSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
    unique: true,
    index: true
  },
  passingThreshold: {
    type: Number,
    required: [true, 'Passing threshold is required'],
    default: 75,
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
      required: [true, 'Options are required']
    },
    correctOptionIndex: {
      type: Number,
      required: [true, 'Correct option index is required'],
      min: 0
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('FinalExam', finalExamSchema);
