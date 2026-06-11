const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  issuedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
}, { timestamps: true });

// Prevent duplicate certificates for the same learner/course
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
