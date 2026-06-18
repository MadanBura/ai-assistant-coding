const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    minlength: [10, 'Content must be at least 10 characters'],
    maxlength: [1000, 'Content cannot exceed 1000 characters']
  },
  priority: {
    type: String,
    required: [true, 'Priority level is required'],
    enum: {
      values: ['Info', 'Warning', 'Urgent'],
      message: '{VALUE} is not a valid priority level'
    }
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required'],
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
