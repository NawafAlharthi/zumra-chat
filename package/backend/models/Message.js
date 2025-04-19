const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  roomId: {
    type: String,
    required: true,
    index: true
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
    required: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
MessageSchema.index({ timestamp: -1 });
MessageSchema.index({ roomId: 1, timestamp: -1 });

module.exports = mongoose.model('Message', MessageSchema);
