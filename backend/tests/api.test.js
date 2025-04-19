const request = require('supertest');
const { app } = require('../server');
const mongoose = require('mongoose');

// Test suite for API endpoints
describe('API Endpoints', () => {
  // Test health endpoint
  describe('GET /api/health', () => {
    it('should return 200 OK with status information', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('timestamp');
    });
  });
  
  // Test room creation
  describe('POST /api/rooms', () => {
    it('should create a new room', async () => {
      const roomData = {
        name: 'Test Room',
        capacity: 10,
        type: 'video'
      };
      
      const res = await request(app)
        .post('/api/rooms')
        .send(roomData);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('room');
      expect(res.body.room).toHaveProperty('name', roomData.name);
      expect(res.body.room).toHaveProperty('capacity', roomData.capacity);
      expect(res.body.room).toHaveProperty('type', roomData.type);
    });
    
    it('should return 400 if room name is missing', async () => {
      const roomData = {
        capacity: 10,
        type: 'video'
      };
      
      const res = await request(app)
        .post('/api/rooms')
        .send(roomData);
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
    });
  });
  
  // Test getting room by ID
  describe('GET /api/rooms/:id', () => {
    let roomId;
    
    // Create a room before testing
    beforeAll(async () => {
      const roomData = {
        name: 'Test Room for Get',
        capacity: 15,
        type: 'audio'
      };
      
      const res = await request(app)
        .post('/api/rooms')
        .send(roomData);
      
      roomId = res.body.room._id;
    });
    
    it('should get a room by ID', async () => {
      const res = await request(app).get(`/api/rooms/${roomId}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('room');
      expect(res.body.room).toHaveProperty('_id', roomId);
    });
    
    it('should return 404 for non-existent room', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/rooms/${fakeId}`);
      
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message');
    });
  });
  
  // Test user registration
  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const userData = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'password123'
      };
      
      const res = await request(app)
        .post('/api/users/register')
        .send(userData);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('username', userData.username);
      expect(res.body.user).toHaveProperty('email', userData.email);
    });
    
    it('should return 400 for duplicate user', async () => {
      const userData = {
        username: 'duplicate_user',
        email: 'duplicate@example.com',
        password: 'password123'
      };
      
      // First registration
      await request(app)
        .post('/api/users/register')
        .send(userData);
      
      // Duplicate registration
      const res = await request(app)
        .post('/api/users/register')
        .send(userData);
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
    });
  });
  
  // Clean up after all tests
  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });
});
