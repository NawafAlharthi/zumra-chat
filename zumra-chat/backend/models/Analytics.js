const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Room',
    required: true
  },
  totalParticipants: {
    type: Number,
    default: 0
  },
  peakConcurrentUsers: {
    type: Number,
    default: 0
  },
  messagesExchanged: {
    type: Number,
    default: 0
  },
  deviceBreakdown: {
    mobile: {
      type: Number,
      default: 0
    },
    desktop: {
      type: Number,
      default: 0
    },
    tablet: {
      type: Number,
      default: 0
    }
  },
  hourlyActivity: [{
    hour: Number,
    count: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
