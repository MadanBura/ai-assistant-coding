const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: [true, 'Topic ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  maxScore: {
    type: Number,
    required: [true, 'Max score is required'],
    default: 100,
    min: [1, 'Max score must be at least 1'],
    max: [1000, 'Max score cannot exceed 1000']
  },
  dueDate: {
    type: Date
  },
  referenceFileUrl: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
