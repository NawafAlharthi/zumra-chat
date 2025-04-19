const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnalyticsSchema = new Schema({
  roomId: {
    type: String,
    required: true,
    index: true
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

// Indexes for faster queries
AnalyticsSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
