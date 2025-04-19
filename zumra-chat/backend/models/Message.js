const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Room',
    required: true
  },
  sender: {
    type: String,
    required: true
  },
  senderId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [2000, 'Message cannot be more than 2000 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isSystemMessage: {
    type: Boolean,
    default: false
  }
});

// Index for efficient querying
MessageSchema.index({ roomId: 1, timestamp: 1 });

module.exports = mongoose.model('Message', MessageSchema);
