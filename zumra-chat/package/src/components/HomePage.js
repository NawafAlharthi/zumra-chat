import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/main.scss';

const HomePage = () => {
  const [roomName, setRoomName] = useState('');
  const [capacity, setCapacity] = useState(10);
  
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Instant Chat Rooms Without Sign-Up</h1>
        <p className="hero-subtitle">
          Create a chat room in seconds. No registration required, just instant text communication.
        </p>
        
        <div className="quick-create">
          <h2>Create a New Chat Room</h2>
          <div className="quick-create-form">
            <div className="form-group">
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                aria-label="Room name"
              />
            </div>
            
            <div className="form-group capacity-group">
              <label htmlFor="quick-capacity">
                Capacity: <span>{capacity}</span>
              </label>
              <input
                type="range"
                id="quick-capacity"
                min="2"
                max="50"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value))}
                className="capacity-slider"
              />
            </div>
            
            <Link 
              to={roomName.trim() ? "/create" : "#"}
              onClick={(e) => {
                if (!roomName.trim()) {
                  e.preventDefault();
                  alert('Please enter a room name');
                }
              }}
              className="create-button"
            >
              Create Room
            </Link>
          </div>
        </div>
      </div>
      
      <div className="features-section">
        <h2>Why Choose Zumra Chat?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Instant Setup</h3>
            <p>No registration required. Create a chat room and share the link in seconds.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Private & Secure</h3>
            <p>Your conversations stay private with end-to-end encryption.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile Friendly</h3>
            <p>Works perfectly on all devices, especially optimized for phones.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Group Chats</h3>
            <p>Support for up to 50 participants in a single chat room.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>No Downloads</h3>
            <p>Works directly in your browser, no plugins or apps needed.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>High Performance</h3>
            <p>Optimized for smooth experience even with 1000+ concurrent users.</p>
          </div>
        </div>
      </div>
      
      <div className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create a Room</h3>
            <p>Enter a room name and set your desired capacity.</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>Share the Link</h3>
            <p>Invite others by sharing your unique room link.</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Start Chatting</h3>
            <p>Begin your conversation instantly with no registration.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
