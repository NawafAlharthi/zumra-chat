const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const socketIo = require('socket.io');
const path = require('path');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const performanceConfig = require('./config/performance');

// Import models
const Room = require('./models/Room');
const Message = require('./models/Message');
const User = require('./models/User');
const Analytics = require('./models/Analytics');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet()); // Set security headers
app.use(mongoSanitize()); // Sanitize data against NoSQL injection
app.use(xss()); // Sanitize data against XSS attacks
app.use(hpp()); // Protect against HTTP Parameter Pollution

// Rate limiting
const apiLimiter = rateLimit(performanceConfig.rateLimiting.api);
const authLimiter = rateLimit(performanceConfig.rateLimiting.auth);

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

// Enable compression
app.use(compression(performanceConfig.expressOptions.compression));

// Configure CORS
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit JSON body size

// Set up Socket.io with performance optimizations
const io = socketIo(server, performanceConfig.socketOptions);

// Make io available globally for other modules
global.io = io;

// Socket connection rate limiter
const socketConnections = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  // Apply connection rate limiting
  const clientIp = socket.handshake.address;
  const now = Date.now();
  const connectionWindow = performanceConfig.rateLimiting.socket.windowMs;
  
  if (!socketConnections.has(clientIp)) {
    socketConnections.set(clientIp, []);
  }
  
  // Get recent connections and clean up old ones
  const connections = socketConnections.get(clientIp).filter(
    time => now - time < connectionWindow
  );
  
  // Add current connection
  connections.push(now);
  socketConnections.set(clientIp, connections);
  
  // Check if rate limit exceeded
  if (connections.length > performanceConfig.rateLimiting.socket.max) {
    console.log(`Rate limit exceeded for ${clientIp}`);
    socket.disconnect();
    return;
  }
  
  console.log(`New client connected: ${socket.id}`);
  
  // Join room
  socket.on('join_room', async ({ roomId, username }) => {
    try {
      // Find room in database
      let room = await Room.findById(roomId);
      
      // If room doesn't exist, create it
      if (!room) {
        room = await Room.create({
          _id: roomId,
          name: `Room ${roomId}`,
          participants: []
        });
        
        // Initialize analytics for the room
        await Analytics.create({
          roomId: room._id,
          hourlyActivity: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }))
        });
      }
      
      // Check if room is full
      if (room.participants.length >= room.capacity) {
        socket.emit('room_full');
        return;
      }
      
      // Check if room has expired
      if (room.expiresAt && new Date() > room.expiresAt) {
        socket.emit('room_expired');
        return;
      }
      
      // Add participant to room
      const newParticipant = {
        socketId: socket.id,
        username,
        joinedAt: new Date(),
        isOnline: true
      };
      
      room.participants.push(newParticipant);
      await room.save();
      
      // Join the socket room
      socket.join(roomId);
      
      // Notify everyone in the room about the new participant
      io.to(roomId).emit('participant_joined', {
        id: socket.id,
        username,
        participantCount: room.participants.length
      });
      
      // Get room messages from database (with pagination for performance)
      const messages = await Message.find({ roomId })
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();
      
      // Send room history to the new participant
      socket.emit('room_history', {
        messages: messages.reverse(),
        participants: room.participants
      });
      
      // Update analytics
      const analytics = await Analytics.findOne({ roomId });
      if (analytics) {
        analytics.totalParticipants += 1;
        
        // Update peak concurrent users if needed
        if (room.participants.length > analytics.peakConcurrentUsers) {
          analytics.peakConcurrentUsers = room.participants.length;
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
      
      console.log(`${username} joined room ${roomId}`);
    } catch (error) {
      console.error(`Error joining room: ${error.message}`);
      socket.emit('error', { message: 'Error joining room' });
    }
  });
  
  // Leave room
  socket.on('leave_room', async ({ roomId }) => {
    try {
      await handleLeaveRoom(socket, roomId);
    } catch (error) {
      console.error(`Error leaving room: ${error.message}`);
    }
  });
  
  // Send message
  socket.on('send_message', async ({ roomId, message }) => {
    try {
      // Find room in database
      const room = await Room.findById(roomId);
      
      if (!room) return;
      
      // Find participant in room
      const participant = room.participants.find(p => p.socketId === socket.id);
      
      if (!participant) return;
      
      // Create new message
      const newMessage = await Message.create({
        roomId,
        sender: participant.username,
        senderId: socket.id,
        content: message,
        timestamp: new Date()
      });
      
      // Broadcast message to everyone in the room
      io.to(roomId).emit('new_message', newMessage);
      
      // Update analytics
      const analytics = await Analytics.findOne({ roomId });
      if (analytics) {
        analytics.messagesExchanged += 1;
        analytics.updatedAt = new Date();
        await analytics.save();
      }
    } catch (error) {
      console.error(`Error sending message: ${error.message}`);
    }
  });
  
  // Update room settings
  socket.on('update_room_settings', async ({ roomId, settings }) => {
    try {
      // Find room in database
      const room = await Room.findById(roomId);
      
      if (!room) return;
      
      // Update room settings
      Object.keys(settings).forEach(key => {
        if (!['_id', 'participants', 'createdAt'].includes(key)) {
          room[key] = settings[key];
        }
      });
      
      await room.save();
      
      // Notify everyone in the room about the updated settings
      io.to(roomId).emit('room_settings_updated', settings);
    } catch (error) {
      console.error(`Error updating room settings: ${error.message}`);
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', async () => {
    try {
      console.log(`Client disconnected: ${socket.id}`);
      
      // Find all rooms the user was in
      const rooms = await Room.find({ 'participants.socketId': socket.id });
      
      // Remove user from all rooms
      for (const room of rooms) {
        await handleLeaveRoom(socket, room._id);
      }
    } catch (error) {
      console.error(`Error handling disconnect: ${error.message}`);
    }
  });
  
  // Helper function to handle leaving a room
  async function handleLeaveRoom(socket, roomId) {
    // Find room in database
    const room = await Room.findById(roomId);
    
    if (!room) return;
    
    // Find participant in room
    const participantIndex = room.participants.findIndex(p => p.socketId === socket.id);
    
    if (participantIndex === -1) return;
    
    const participant = room.participants[participantIndex];
    
    // Remove participant from room
    room.participants.splice(participantIndex, 1);
    await room.save();
    
    // Leave the socket room
    socket.leave(roomId);
    
    // Notify everyone in the room about the participant leaving
    io.to(roomId).emit('participant_left', {
      id: socket.id,
      username: participant.username,
      participantCount: room.participants.length
    });
    
    console.log(`${participant.username} left room ${roomId}`);
    
    // Clean up empty rooms after a delay
    if (room.participants.length === 0) {
      setTimeout(async () => {
        try {
          const currentRoom = await Room.findById(roomId);
          
          if (currentRoom && currentRoom.participants.length === 0) {
            // Don't delete the room, just mark it as expired
            currentRoom.expiresAt = new Date();
            await currentRoom.save();
            
            console.log(`Room ${roomId} marked as expired due to inactivity`);
          }
        } catch (error) {
          console.error(`Error cleaning up room: ${error.message}`);
        }
      }, 60000); // 1 minute delay
    }
  }
});

// API Routes
const { router: userRoutes } = require('./routes/users');
const roomRoutes = require('./routes/rooms');
const adRoutes = require('./routes/ads');
const analyticsRoutes = require('./routes/analytics');
const healthRoutes = require('./routes/health');

app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/health', healthRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set cache control for static assets
  app.use(express.static(path.join(__dirname, '../dist'), performanceConfig.expressOptions.static));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };
