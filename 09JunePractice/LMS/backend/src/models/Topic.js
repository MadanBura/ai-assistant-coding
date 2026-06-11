const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: [true, 'Module ID is required'],
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

module.exports = mongoose.model('Topic', topicSchema);
