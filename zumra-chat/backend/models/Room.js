const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a room name'],
    trim: true,
    maxlength: [100, 'Room name cannot be more than 100 characters']
  },
  type: {
    type: String,
    enum: ['video', 'audio', 'chat'],
    default: 'video'
  },
  capacity: {
    type: Number,
    default: 50,
    max: [100, 'Room capacity cannot exceed 100 participants']
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false // Optional since we allow anonymous room creation
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default room expiration is 24 hours after creation
      const date = new Date();
      date.setHours(date.getHours() + 24);
      return date;
    }
  },
  participants: [{
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: false // Optional for anonymous users
    },
    username: {
      type: String,
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isOnline: {
      type: Boolean,
      default: true
    },
    socketId: {
      type: String,
      required: true
    }
  }]
});

// Create room URL (slug) from name
RoomSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next();
    return;
  }
  
  // Generate a random string to append to the URL for uniqueness
  const randomString = Math.random().toString(36).substring(2, 8);
  this.slug = `${this.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${randomString}`;
  next();
});

module.exports = mongoose.model('Room', RoomSchema);
