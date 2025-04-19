const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const { authMiddleware } = require('./users');

// Get analytics for all rooms (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to access analytics' });
    }
    
    // Get analytics with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const analytics = await Analytics.find()
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Analytics.countDocuments();
    
    // Calculate platform-wide statistics
    const totalParticipants = await Analytics.aggregate([
      { $group: { _id: null, total: { $sum: '$totalParticipants' } } }
    ]);
    
    const totalMessages = await Analytics.aggregate([
      { $group: { _id: null, total: { $sum: '$messagesExchanged' } } }
    ]);
    
    const peakConcurrent = await Analytics.aggregate([
      { $group: { _id: null, max: { $max: '$peakConcurrentUsers' } } }
    ]);
    
    res.json({
      success: true,
      count: analytics.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      platformStats: {
        totalParticipants: totalParticipants.length > 0 ? totalParticipants[0].total : 0,
        totalMessages: totalMessages.length > 0 ? totalMessages[0].total : 0,
        peakConcurrentUsers: peakConcurrent.length > 0 ? peakConcurrent[0].max : 0
      },
      analytics
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get analytics for a specific room
router.get('/room/:roomId', async (req, res) => {
  try {
    const analytics = await Analytics.findOne({ roomId: req.params.roomId });
    
    if (!analytics) {
      return res.status(404).json({ message: 'Analytics not found for this room' });
    }
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error getting room analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get hourly activity data for all rooms (for charts)
router.get('/hourly', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to access analytics' });
    }
    
    // Aggregate hourly data across all rooms
    const hourlyData = await Analytics.aggregate([
      { $unwind: '$hourlyActivity' },
      { $group: { 
        _id: '$hourlyActivity.hour', 
        totalCount: { $sum: '$hourlyActivity.count' } 
      }},
      { $sort: { _id: 1 } }
    ]);
    
    // Format for chart display
    const formattedData = hourlyData.map(item => ({
      hour: item._id,
      count: item.totalCount
    }));
    
    res.json({
      success: true,
      hourlyActivity: formattedData
    });
  } catch (error) {
    console.error('Error getting hourly analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
