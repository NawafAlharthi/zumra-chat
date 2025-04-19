# Zumra Chat Platform

A production-ready instant chat platform that supports video conferencing, audio-only, and text chat rooms without requiring sign-ups.

## Features

- Create instant chat rooms without registration
- Support for video, audio, and text-only communication
- Customizable room capacity
- Mobile-responsive design optimized for phone users
- Support for 1000 concurrent users
- Real-time messaging and participant tracking
- Room states (full, expired, empty)
- Social sharing capabilities
- Monetization through ads and premium plans

## Technology Stack

- **Frontend**: React, SCSS, Webpack
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB
- **Deployment**: Docker, Nginx
- **Performance**: Clustering, Caching, Rate Limiting

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- MongoDB
- Docker and Docker Compose (for production deployment)

### Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/zumra-chat.git
   cd zumra-chat
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/zumra
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. The application will be available at:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:5000

### Testing

Run the comprehensive test suite:

```
./run-tests.sh
```

Or run specific tests:

```
npm run test:api      # API endpoint tests
npm run test:socket   # Socket.io functionality tests
npm run test:ui       # UI and responsive design tests
npm run test:load     # Load testing for 1000 concurrent users
```

### Production Deployment

1. Update the `.env.production` file with your production settings

2. Build the Docker images and start the containers:
   ```
   docker-compose up -d
   ```

3. The application will be available at your configured domain with SSL support

## Architecture

### Frontend

The frontend is built with React and uses a responsive design approach with mobile-first principles. Key components include:

- **HomePage**: Landing page with room creation form
- **CreateRoom**: Room configuration page
- **ChatRoom**: Main chat interface with real-time communication
- **RoomStates**: Components for different room states (full, expired, empty)

### Backend

The backend uses Node.js with Express and Socket.io for real-time communication. Key features include:

- **API Endpoints**: RESTful API for room management
- **WebSockets**: Real-time messaging and participant tracking
- **Authentication**: JWT-based authentication for premium features
- **Database**: MongoDB for data persistence
- **Performance**: Clustering, caching, and rate limiting for high concurrency

### Deployment

The application is containerized using Docker and uses Nginx as a reverse proxy with the following features:

- **Load Balancing**: Distribute traffic across multiple Node.js instances
- **SSL Termination**: HTTPS support with Let's Encrypt certificates
- **Static File Serving**: Optimized delivery of frontend assets
- **WebSocket Proxy**: Efficient handling of WebSocket connections

## Performance Optimizations

The platform is optimized to handle 1000 concurrent users with the following features:

- **Horizontal Scaling**: Node.js clustering to utilize multiple CPU cores
- **Caching**: In-memory caching for API responses and database queries
- **Database Indexing**: Optimized MongoDB indexes for efficient queries
- **Rate Limiting**: Protection against abuse and DoS attacks
- **Compression**: Gzip compression for HTTP responses
- **Asset Optimization**: Minification and bundling of frontend assets

## Mobile Responsiveness

The UI is designed to be fully responsive with special focus on mobile devices:

- **Mobile-First Design**: Optimized for small screens
- **Touch-Friendly UI**: Large tap targets and intuitive gestures
- **Adaptive Layouts**: Flexible components that adjust to screen size
- **Performance Optimizations**: Fast loading and minimal data usage
- **Offline Support**: Basic functionality when connection is unstable

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Design inspiration from UXPilot.ai
- Icons and graphics from various open-source projects
