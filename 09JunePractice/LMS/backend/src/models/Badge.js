const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Badge title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [50, 'Title cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true
  },
  iconUrl: {
    type: String,
    required: [true, 'Icon URL is required'],
    trim: true
  },
  triggerType: {
    type: String,
    required: [true, 'Trigger type is required'],
    enum: {
      values: ['CourseCompletion', 'PerfectQuizzes', 'FastTrack'],
      message: '{VALUE} is not a valid trigger type'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);
