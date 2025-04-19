const io = require('socket.io-client');
const { server } = require('../server');
const mongoose = require('mongoose');

// Test suite for Socket.io functionality
describe('Socket.io Real-time Communication', () => {
  let clientSocket1, clientSocket2;
  const PORT = process.env.PORT || 5000;
  const SOCKET_URL = `http://localhost:${PORT}`;
  
  // Set up server and clients before tests
  beforeAll((done) => {
    // Start server
    server.listen(PORT, '0.0.0.0', () => {
      // Create client sockets
      clientSocket1 = io(SOCKET_URL, {
        transports: ['websocket'],
        forceNew: true
      });
      
      clientSocket2 = io(SOCKET_URL, {
        transports: ['websocket'],
        forceNew: true
      });
      
      // Wait for connections
      let connectedCount = 0;
      const onConnect = () => {
        connectedCount++;
        if (connectedCount === 2) {
          done();
        }
      };
      
      clientSocket1.on('connect', onConnect);
      clientSocket2.on('connect', onConnect);
    });
  });
  
  // Test joining a room
  test('should join a room and receive confirmation', (done) => {
    const roomId = 'test-room-' + Date.now();
    const username = 'test-user-1';
    
    // Listen for room history event
    clientSocket1.on('room_history', (data) => {
      expect(data).toHaveProperty('messages');
      expect(data).toHaveProperty('participants');
      expect(data.participants.length).toBe(1);
      expect(data.participants[0].username).toBe(username);
      done();
    });
    
    // Join room
    clientSocket1.emit('join_room', { roomId, username });
  });
  
  // Test sending and receiving messages
  test('should send and receive messages in a room', (done) => {
    const roomId = 'test-room-' + Date.now();
    const username1 = 'test-user-1';
    const username2 = 'test-user-2';
    const testMessage = 'Hello, this is a test message';
    
    // Set up second client to receive messages
    clientSocket2.on('room_history', () => {
      // Send a message from first client
      clientSocket1.emit('send_message', { roomId, message: testMessage });
    });
    
    // Listen for new message on second client
    clientSocket2.on('new_message', (data) => {
      expect(data).toHaveProperty('content', testMessage);
      expect(data).toHaveProperty('sender', username1);
      done();
    });
    
    // Join room with both clients
    clientSocket1.emit('join_room', { roomId, username: username1 });
    clientSocket2.emit('join_room', { roomId, username: username2 });
  });
  
  // Test participant joining notification
  test('should notify when a participant joins', (done) => {
    const roomId = 'test-room-' + Date.now();
    const username1 = 'test-user-1';
    const username2 = 'test-user-2';
    
    // Set up first client to receive join notification
    clientSocket1.on('room_history', () => {
      // Second user joins after first is in
      clientSocket2.emit('join_room', { roomId, username: username2 });
    });
    
    // Listen for participant joined event
    clientSocket1.on('participant_joined', (data) => {
      expect(data).toHaveProperty('username', username2);
      expect(data).toHaveProperty('participantCount', 2);
      done();
    });
    
    // First user joins
    clientSocket1.emit('join_room', { roomId, username: username1 });
  });
  
  // Test participant leaving notification
  test('should notify when a participant leaves', (done) => {
    const roomId = 'test-room-' + Date.now();
    const username1 = 'test-user-1';
    const username2 = 'test-user-2';
    
    // Set up sequence of events
    clientSocket1.on('room_history', () => {
      // Second user joins after first is in
      clientSocket2.emit('join_room', { roomId, username: username2 });
    });
    
    clientSocket1.on('participant_joined', () => {
      // Second user leaves after joining
      clientSocket2.emit('leave_room', { roomId });
    });
    
    // Listen for participant left event
    clientSocket1.on('participant_left', (data) => {
      expect(data).toHaveProperty('username', username2);
      expect(data).toHaveProperty('participantCount', 1);
      done();
    });
    
    // First user joins
    clientSocket1.emit('join_room', { roomId, username: username1 });
  });
  
  // Clean up after tests
  afterAll((done) => {
    // Disconnect clients
    if (clientSocket1.connected) {
      clientSocket1.disconnect();
    }
    
    if (clientSocket2.connected) {
      clientSocket2.disconnect();
    }
    
    // Close server and database connection
    server.close(() => {
      mongoose.connection.close();
      done();
    });
  });
});
