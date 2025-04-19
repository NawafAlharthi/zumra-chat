const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./users');

// Get ad configuration
router.get('/config', async (req, res) => {
  try {
    // Check if user is premium (no ads for premium users)
    const isPremium = req.headers.authorization ? 
      await checkUserPremium(req.headers.authorization) : false;
    
    if (isPremium) {
      return res.json({
        success: true,
        config: {
          interstitialEnabled: false,
          bannerEnabled: false
        }
      });
    }
    
    // Regular user ad configuration
    res.json({
      success: true,
      config: {
        interstitialEnabled: true,
        interstitialDuration: 5, // seconds
        skipAfter: 3, // seconds
        bannerEnabled: true,
        adProviders: ['adsense'],
        adFrequency: {
          roomEntry: 1, // Show ad every 1 room entry
          timeBased: 30 // Show ad every 30 minutes
        }
      }
    });
  } catch (error) {
    console.error('Error getting ad config:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Record ad impression
router.post('/impression', async (req, res) => {
  try {
    const { adId, userId, roomId, adType } = req.body;
    
    // In a real app, this would store the impression in a database
    console.log(`Ad impression recorded: ${adId} for user ${userId || 'anonymous'} in room ${roomId}`);
    
    res.json({
      success: true,
      message: 'Impression recorded'
    });
  } catch (error) {
    console.error('Error recording ad impression:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Record ad click
router.post('/click', async (req, res) => {
  try {
    const { adId, userId, roomId, adType } = req.body;
    
    // In a real app, this would store the click in a database
    console.log(`Ad click recorded: ${adId} for user ${userId || 'anonymous'} in room ${roomId}`);
    
    res.json({
      success: true,
      message: 'Click recorded'
    });
  } catch (error) {
    console.error('Error recording ad click:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to check if a user is premium
async function checkUserPremium(authHeader) {
  try {
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const User = require('../models/User');
      const user = await User.findById(decoded.id);
      
      return user && user.isPremium;
    }
    return false;
  } catch (error) {
    return false;
  }
}

module.exports = router;
