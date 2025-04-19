const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const { authMiddleware } = require('./users');

// Get analytics for a room
router.get('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const analytics = await Analytics.findOne({ roomId });
    
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

// Get user analytics (premium feature)
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is premium or requesting their own analytics
    if (!req.user.isPremium && req.user.id !== userId) {
      return res.status(403).json({ message: 'Premium subscription required for this feature' });
    }
    
    // In a real app, this would fetch user analytics from the database
    // For now, we'll return mock data
    res.json({
      success: true,
      analytics: {
        roomsCreated: 12,
        roomsJoined: 28,
        totalTimeSpent: 345, // minutes
        messagesExchanged: 156,
        favoriteRoomTypes: ['video', 'chat', 'audio']
      }
    });
  } catch (error) {
    console.error('Error getting user analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update analytics for a room
router.put('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const updates = req.body;
    
    const analytics = await Analytics.findOneAndUpdate(
      { roomId },
      updates,
      { new: true, runValidators: true, upsert: true }
    );
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error updating analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
