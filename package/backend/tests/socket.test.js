const io = require('socket.io-client');
const http = require('http');
const { app } = require('../server');
const Room = require('../models/Room');
const Message = require('../models/Message');
const mongoose = require('mongoose');

describe('Socket.io Functionality', () => {
  let server;
  let clientSocket1;
  let clientSocket2;
  let port;
  let roomId;
  
  // Set up server and clients before tests
  beforeAll((done) => {
    // Create HTTP server
    server = http.createServer(app);
    
    // Start server on random port
    server.listen(0, () => {
      port = server.address().port;
      
      // Connect to test database
      mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/zumra_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }).then(() => {
        // Clear test collections
        return Promise.all([
          Room.deleteMany({}),
          Message.deleteMany({})
        ]);
      }).then(() => {
        // Create test room
        return Room.create({
          name: 'Test Socket Room',
          capacity: 10
        });
      }).then((room) => {
        roomId = room._id.toString();
        done();
      }).catch(done);
    });
  });
  
  // Clean up after tests
  afterAll((done) => {
    // Disconnect clients
    if (clientSocket1) {
      clientSocket1.disconnect();
    }
    if (clientSocket2) {
      clientSocket2.disconnect();
    }
    
    // Close server and database connection
    server.close(() => {
      mongoose.connection.close()
        .then(() => done())
        .catch(done);
    });
  });
  
  // Set up clients before each test
  beforeEach((done) => {
    // Create client sockets
    clientSocket1 = io(`http://localhost:${port}`, {
      transports: ['websocket'],
      forceNew: true
    });
    
    clientSocket2 = io(`http://localhost:${port}`, {
      transports: ['websocket'],
      forceNew: true
    });
    
    // Wait for connections
    let connected = 0;
    const onConnect = () => {
      connected++;
      if (connected === 2) {
        done();
      }
    };
    
    clientSocket1.on('connect', onConnect);
    clientSocket2.on('connect', onConnect);
  });
  
  // Clean up after each test
  afterEach(() => {
    // Disconnect clients
    if (clientSocket1) {
      clientSocket1.disconnect();
    }
    if (clientSocket2) {
      clientSocket2.disconnect();
    }
  });
  
  // Test joining a room
  test('should join a room and receive room history', (done) => {
    // Set up event handlers
    clientSocket1.on('room_history', (data) => {
      expect(data).toBeDefined();
      expect(data).toHaveProperty('messages');
      expect(data).toHaveProperty('participants');
      expect(data.participants).toHaveLength(1);
      expect(data.participants[0].username).toBe('User 1');
      done();
    });
    
    // Join room
    clientSocket1.emit('join_room', {
      roomId,
      username: 'User 1'
    });
  });
  
  // Test sending and receiving messages
  test('should send and receive messages', (done) => {
    // Join room with first client
    clientSocket1.emit('join_room', {
      roomId,
      username: 'User 1'
    });
    
    // Wait for room history
    clientSocket1.on('room_history', () => {
      // Join room with second client
      clientSocket2.emit('join_room', {
        roomId,
        username: 'User 2'
      });
    });
    
    // Wait for second client to join
    clientSocket2.on('room_history', () => {
      // Send message from first client
      clientSocket1.emit('send_message', {
        roomId,
        message: 'Hello from User 1'
      });
    });
    
    // Check if second client receives the message
    clientSocket2.on('new_message', (message) => {
      expect(message).toBeDefined();
      expect(message).toHaveProperty('content', 'Hello from User 1');
      expect(message).toHaveProperty('sender', 'User 1');
      done();
    });
  });
  
  // Test participant joined notification
  test('should notify when a participant joins', (done) => {
    // Join room with first client
    clientSocket1.emit('join_room', {
      roomId,
      username: 'User 1'
    });
    
    // Wait for room history
    clientSocket1.on('room_history', () => {
      // Set up event handler for participant joined
      clientSocket1.on('participant_joined', (data) => {
        expect(data).toBeDefined();
        expect(data).toHaveProperty('username', 'User 2');
        expect(data).toHaveProperty('participantCount', 2);
        done();
      });
      
      // Join room with second client
      clientSocket2.emit('join_room', {
        roomId,
        username: 'User 2'
      });
    });
  });
  
  // Test participant left notification
  test('should notify when a participant leaves', (done) => {
    // Join room with both clients
    clientSocket1.emit('join_room', {
      roomId,
      username: 'User 1'
    });
    
    clientSocket1.on('room_history', () => {
      clientSocket2.emit('join_room', {
        roomId,
        username: 'User 2'
      });
    });
    
    clientSocket2.on('room_history', () => {
      // Set up event handler for participant left
      clientSocket1.on('participant_left', (data) => {
        expect(data).toBeDefined();
        expect(data).toHaveProperty('username', 'User 2');
        expect(data).toHaveProperty('participantCount', 1);
        done();
      });
      
      // Disconnect second client
      clientSocket2.emit('leave_room', { roomId });
      clientSocket2.disconnect();
    });
  });
  
  // Test room capacity limit
  test('should reject join when room is full', (done) => {
    // Create a room with capacity 1
    Room.create({
      name: 'Full Room',
      capacity: 1
    }).then((room) => {
      const fullRoomId = room._id.toString();
      
      // Join room with first client
      clientSocket1.emit('join_room', {
        roomId: fullRoomId,
        username: 'User 1'
      });
      
      // Wait for room history
      clientSocket1.on('room_history', () => {
        // Try to join with second client
        clientSocket2.emit('join_room', {
          roomId: fullRoomId,
          username: 'User 2'
        });
      });
      
      // Check if second client receives room full notification
      clientSocket2.on('room_full', () => {
        done();
      });
    });
  });
  
  // Test room expiry
  test('should reject join when room is expired', (done) => {
    // Create an expired room
    Room.create({
      name: 'Expired Room',
      capacity: 10,
      expiresAt: new Date(Date.now() - 86400000) // 1 day ago
    }).then((room) => {
      const expiredRoomId = room._id.toString();
      
      // Try to join expired room
      clientSocket1.emit('join_room', {
        roomId: expiredRoomId,
        username: 'User 1'
      });
      
      // Check if client receives room expired notification
      clientSocket1.on('room_expired', () => {
        done();
      });
    });
  });
  
  // Test concurrent connections
  test('should handle multiple concurrent connections', (done) => {
    const numClients = 10;
    const clients = [];
    let joinedCount = 0;
    
    // Create multiple clients
    for (let i = 0; i < numClients; i++) {
      const client = io(`http://localhost:${port}`, {
        transports: ['websocket'],
        forceNew: true
      });
      
      clients.push(client);
      
      // Join room when connected
      client.on('connect', () => {
        client.emit('join_room', {
          roomId,
          username: `User ${i + 1}`
        });
      });
      
      // Count room history events
      client.on('room_history', () => {
        joinedCount++;
        
        // All clients have joined
        if (joinedCount === numClients) {
          // Check room participants
          Room.findById(roomId).then((room) => {
            expect(room.participants).toHaveLength(numClients);
            
            // Disconnect all clients
            clients.forEach(c => c.disconnect());
            done();
          });
        }
      });
    }
  }, 10000); // Increase timeout for this test
});
