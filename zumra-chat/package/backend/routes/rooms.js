const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Message = require('../models/Message');
const { authMiddleware } = require('./users');

// Create a new room
router.post('/', async (req, res) => {
  try {
    const { name, capacity } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ message: 'Room name is required' });
    }
    
    // Create room
    const room = await Room.create({
      name,
      capacity: capacity || 10
    });
    
    res.status(201).json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all rooms (with pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get rooms that haven't expired
    const rooms = await Room.find({ 
      expiresAt: { $gt: new Date() } 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('name capacity participants createdAt');
    
    // Get total count for pagination
    const total = await Room.countDocuments({ 
      expiresAt: { $gt: new Date() } 
    });
    
    res.json({
      success: true,
      count: rooms.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      rooms
    });
  } catch (error) {
    console.error('Error getting rooms:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a single room
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
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
    const { name, capacity, isPrivate, password } = req.body;
    
    // Find room
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Update fields
    if (name) room.name = name;
    if (capacity) room.capacity = capacity;
    if (isPrivate !== undefined) room.isPrivate = isPrivate;
    if (password) room.password = password;
    
    await room.save();
    
    res.json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get room messages
router.get('/:id/messages', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Get messages for room
    const messages = await Message.find({ roomId: req.params.id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Message.countDocuments({ roomId: req.params.id });
    
    res.json({
      success: true,
      count: messages.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      messages: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    console.error('Error getting room messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add message to room (API endpoint for non-socket clients)
router.post('/:id/messages', async (req, res) => {
  try {
    const { content, sender, senderId } = req.body;
    
    // Validate input
    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    if (!sender) {
      return res.status(400).json({ message: 'Sender name is required' });
    }
    
    // Create message
    const message = await Message.create({
      roomId: req.params.id,
      content,
      sender,
      senderId: senderId || 'api-user',
      timestamp: new Date()
    });
    
    // Emit to socket clients if available
    if (global.io) {
      global.io.to(req.params.id).emit('new_message', message);
    }
    
    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
