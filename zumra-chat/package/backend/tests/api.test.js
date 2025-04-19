const request = require('supertest');
const { app } = require('../server');
const mongoose = require('mongoose');
const Room = require('../models/Room');
const Message = require('../models/Message');

describe('API Endpoints', () => {
  // Connect to test database before tests
  beforeAll(async () => {
    // Use a separate test database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/zumra_test';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Clear test collections
    await Room.deleteMany({});
    await Message.deleteMany({});
  });
  
  // Disconnect after tests
  afterAll(async () => {
    await mongoose.connection.close();
  });
  
  // Test room creation
  describe('POST /api/rooms', () => {
    it('should create a new room', async () => {
      const res = await request(app)
        .post('/api/rooms')
        .send({
          name: 'Test Room',
          capacity: 10
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('room');
      expect(res.body.room).toHaveProperty('name', 'Test Room');
      expect(res.body.room).toHaveProperty('capacity', 10);
    });
    
    it('should return 400 if room name is missing', async () => {
      const res = await request(app)
        .post('/api/rooms')
        .send({
          capacity: 10
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
    });
  });
  
  // Test getting rooms
  describe('GET /api/rooms', () => {
    beforeEach(async () => {
      // Create test rooms
      await Room.create([
        { name: 'Room 1', capacity: 5 },
        { name: 'Room 2', capacity: 10 },
        { name: 'Room 3', capacity: 15 }
      ]);
    });
    
    afterEach(async () => {
      await Room.deleteMany({});
    });
    
    it('should get all rooms with pagination', async () => {
      const res = await request(app)
        .get('/api/rooms')
        .query({ page: 1, limit: 2 });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('rooms');
      expect(res.body.rooms).toHaveLength(2);
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toHaveProperty('total', 3);
      expect(res.body.pagination).toHaveProperty('pages', 2);
    });
  });
  
  // Test getting a single room
  describe('GET /api/rooms/:id', () => {
    let roomId;
    
    beforeEach(async () => {
      // Create a test room
      const room = await Room.create({
        name: 'Test Room',
        capacity: 10
      });
      roomId = room._id;
    });
    
    afterEach(async () => {
      await Room.deleteMany({});
    });
    
    it('should get a single room by ID', async () => {
      const res = await request(app)
        .get(`/api/rooms/${roomId}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('room');
      expect(res.body.room).toHaveProperty('name', 'Test Room');
    });
    
    it('should return 404 for non-existent room', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/rooms/${fakeId}`);
      
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message');
    });
  });
  
  // Test updating room settings
  describe('PUT /api/rooms/:id', () => {
    let roomId;
    
    beforeEach(async () => {
      // Create a test room
      const room = await Room.create({
        name: 'Test Room',
        capacity: 10
      });
      roomId = room._id;
    });
    
    afterEach(async () => {
      await Room.deleteMany({});
    });
    
    it('should update room settings', async () => {
      const res = await request(app)
        .put(`/api/rooms/${roomId}`)
        .send({
          name: 'Updated Room',
          capacity: 20
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('room');
      expect(res.body.room).toHaveProperty('name', 'Updated Room');
      expect(res.body.room).toHaveProperty('capacity', 20);
    });
  });
  
  // Test getting room messages
  describe('GET /api/rooms/:id/messages', () => {
    let roomId;
    
    beforeEach(async () => {
      // Create a test room
      const room = await Room.create({
        name: 'Test Room',
        capacity: 10
      });
      roomId = room._id;
      
      // Create test messages
      await Message.create([
        {
          roomId: roomId.toString(),
          sender: 'User 1',
          senderId: 'user1',
          content: 'Message 1',
          timestamp: new Date()
        },
        {
          roomId: roomId.toString(),
          sender: 'User 2',
          senderId: 'user2',
          content: 'Message 2',
          timestamp: new Date()
        }
      ]);
    });
    
    afterEach(async () => {
      await Room.deleteMany({});
      await Message.deleteMany({});
    });
    
    it('should get room messages with pagination', async () => {
      const res = await request(app)
        .get(`/api/rooms/${roomId}/messages`)
        .query({ page: 1, limit: 10 });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('messages');
      expect(res.body.messages).toHaveLength(2);
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toHaveProperty('total', 2);
    });
  });
  
  // Test adding a message to a room
  describe('POST /api/rooms/:id/messages', () => {
    let roomId;
    
    beforeEach(async () => {
      // Create a test room
      const room = await Room.create({
        name: 'Test Room',
        capacity: 10
      });
      roomId = room._id;
    });
    
    afterEach(async () => {
      await Room.deleteMany({});
      await Message.deleteMany({});
    });
    
    it('should add a message to a room', async () => {
      const res = await request(app)
        .post(`/api/rooms/${roomId}/messages`)
        .send({
          content: 'Test message',
          sender: 'Test User',
          senderId: 'test-user'
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toHaveProperty('content', 'Test message');
      expect(res.body.message).toHaveProperty('sender', 'Test User');
      
      // Verify message was saved to database
      const messages = await Message.find({ roomId: roomId.toString() });
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toEqual('Test message');
    });
    
    it('should return 400 if message content is missing', async () => {
      const res = await request(app)
        .post(`/api/rooms/${roomId}/messages`)
        .send({
          sender: 'Test User',
          senderId: 'test-user'
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
    });
  });
});
