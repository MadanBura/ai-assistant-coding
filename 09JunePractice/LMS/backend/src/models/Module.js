const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  sequenceIndex: {
    type: Number,
    required: [true, 'Sequence index is required']
  }
}, { timestamps: true });

module.exports = mongoose.model('Module', moduleSchema);
