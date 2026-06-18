const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  repliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Replied by user ID is required']
  },
  content: {
    type: String,
    required: [true, 'Answer content is required'],
    trim: true,
    minlength: [5, 'Answer must be at least 5 characters'],
    maxlength: [1000, 'Answer cannot exceed 1000 characters']
  },
  isOfficial: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const doubtSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: [true, 'Topic ID is required'],
    index: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required'],
    index: true
  },
  question: {
    type: String,
    required: [true, 'Question content is required'],
    trim: true,
    minlength: [5, 'Question must be at least 5 characters'],
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  answers: [answerSchema],
  isResolved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Doubt', doubtSchema);
