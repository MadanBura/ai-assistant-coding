const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: [true, 'Topic ID is required'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'Resource type is required'],
    enum: {
      values: ['Video', 'Notes', 'Document', 'Reference'],
      message: '{VALUE} is not a valid resource type'
    }
  },
  url: {
    type: String,
    required: [
      function() { return this.type !== 'Notes'; },
      'URL is required for this resource type'
    ],
    trim: true
  },
  content: {
    type: String,
    required: [
      function() { return this.type === 'Notes'; },
      'Content is required for notes'
    ]
  }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
