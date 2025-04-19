const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Message = require('../models/Message');
const Analytics = require('../models/Analytics');

// Create a new room
router.post('/', async (req, res) => {
  try {
    const { name, capacity = 50, type = 'video', createdBy } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Room name is required' });
    }
    
    const newRoom = await Room.create({
      name,
      capacity: parseInt(capacity),
      type,
      createdBy,
      participants: []
    });
    
    // Initialize analytics for the room
    await Analytics.create({
      roomId: newRoom._id,
      hourlyActivity: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }))
    });
    
    res.status(201).json({
      success: true,
      room: newRoom
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get room by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const room = await Room.findById(id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Error getting room:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update room settings
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Don't allow updating certain properties
    delete updates.participants;
    delete updates._id;
    delete updates.createdAt;
    
    const room = await Room.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a room
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const room = await Room.findById(id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Delete room and all associated messages
    await Promise.all([
      room.remove(),
      Message.deleteMany({ roomId: id }),
      Analytics.deleteMany({ roomId: id })
    ]);
    
    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get room messages
router.get('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 100, before } = req.query;
    
    const query = { roomId: id };
    
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }
    
    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json({
      success: true,
      messages: messages.reverse()
    });
  } catch (error) {
    console.error('Error getting room messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add participant to room
router.post('/:id/participants', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, username, socketId } = req.body;
    
    const room = await Room.findById(id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if room is full
    if (room.participants.length >= room.capacity) {
      return res.status(400).json({ message: 'Room is full' });
    }
    
    // Check if participant already exists
    const existingParticipant = room.participants.find(
      p => (userId && p.userId && p.userId.toString() === userId) || 
           (p.socketId === socketId)
    );
    
    if (existingParticipant) {
      // Update existing participant
      existingParticipant.isOnline = true;
      existingParticipant.socketId = socketId;
    } else {
      // Add new participant
      room.participants.push({
        userId,
        username,
        socketId,
        joinedAt: new Date(),
        isOnline: true
      });
      
      // Update analytics
      const analytics = await Analytics.findOne({ roomId: id });
      if (analytics) {
        analytics.totalParticipants += 1;
        
        // Update peak concurrent users if needed
        const onlineCount = room.participants.filter(p => p.isOnline).length;
        if (onlineCount > analytics.peakConcurrentUsers) {
          analytics.peakConcurrentUsers = onlineCount;
        }
        
        // Update hourly activity
        const hour = new Date().getHours();
        const hourlyActivity = analytics.hourlyActivity.find(h => h.hour === hour);
        if (hourlyActivity) {
          hourlyActivity.count += 1;
        } else {
          analytics.hourlyActivity.push({ hour, count: 1 });
        }
        
        analytics.updatedAt = new Date();
        await analytics.save();
      }
    }
    
    await room.save();
    
    res.json({
      success: true,
      participant: room.participants[room.participants.length - 1]
    });
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove participant from room
router.delete('/:id/participants/:socketId', async (req, res) => {
  try {
    const { id, socketId } = req.params;
    
    const room = await Room.findById(id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Find participant index
    const participantIndex = room.participants.findIndex(p => p.socketId === socketId);
    
    if (participantIndex === -1) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    
    // Remove participant
    room.participants.splice(participantIndex, 1);
    await room.save();
    
    res.json({
      success: true,
      message: 'Participant removed successfully'
    });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
