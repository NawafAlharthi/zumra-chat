const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [50, 'Room name cannot be more than 50 characters']
  },
  capacity: {
    type: Number,
    default: 10,
    min: [2, 'Room capacity must be at least 2'],
    max: [50, 'Room capacity cannot exceed 50']
  },
  participants: [{
    socketId: String,
    username: String,
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isOnline: {
      type: Boolean,
      default: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    select: false
  }
});

// Index for faster queries
RoomSchema.index({ createdAt: 1 });
RoomSchema.index({ expiresAt: 1 });
RoomSchema.index({ 'participants.socketId': 1 });

module.exports = mongoose.model('Room', RoomSchema);
