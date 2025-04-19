import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useResponsiveContext } from '../utils/responsive';

const HomePage = () => {
  const [roomName, setRoomName] = useState('');
  const navigate = useNavigate();
  const { isMobile } = useResponsiveContext();

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (roomName.trim()) {
      navigate('/create', { state: { roomName } });
    }
  };

  return (
    <div className="home-container">
      <Navbar />
      <div className="container">
        <div className="hero-section text-center">
          <h1 className="mb-3">Instant Video Meetings Made Simple</h1>
          <p className="mb-4">Connect with anyone, anywhere. No downloads required. Just create a room and start talking.</p>
          
          <div className="room-creation-form">
            <form onSubmit={handleCreateRoom} className={`d-flex ${isMobile ? 'flex-column' : 'flex-md-row'} align-items-center justify-content-center`}>
              <input 
                type="text" 
                className={`form-input ${isMobile ? 'mb-3' : 'mb-md-0 me-md-2'}`}
                placeholder="Enter room name" 
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary">
                Start a Room
                <span className="btn-icon">→</span>
              </button>
            </form>
          </div>
          
          <p className="mt-3 text-secondary">No sign up required. Free for up to 50 participants.</p>
          
          <div className="quick-use-cases mt-5">
            <div className={`${isMobile ? 'quick-use-cases-mobile' : 'row'}`}>
              <div className={`${isMobile ? 'mb-4' : 'col-md-4 mb-4 mb-md-0'}`}>
                <div className="use-case-card">
                  <div className="use-case-icon">🎤</div>
                  <h3>AMA Sessions</h3>
                  <p>Host "Ask Me Anything" sessions with your audience or team.</p>
                </div>
              </div>
              <div className={`${isMobile ? 'mb-4' : 'col-md-4 mb-4 mb-md-0'}`}>
                <div className="use-case-card">
                  <div className="use-case-icon">📚</div>
                  <h3>Study Groups</h3>
                  <p>Collaborate with classmates on projects and assignments.</p>
                </div>
              </div>
              <div className={`${isMobile ? '' : 'col-md-4'}`}>
                <div className="use-case-card">
                  <div className="use-case-icon">💼</div>
                  <h3>Team Meetings</h3>
                  <p>Quick team huddles without scheduling or complex setup.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="footer mt-5">
        <div className="container">
          <div className={`d-flex ${isMobile ? 'flex-column text-center' : 'flex-md-row'} justify-content-between align-items-center`}>
            <div className={`footer-logo ${isMobile ? 'mb-3' : 'mb-md-0'}`}>
              <img src={require('../assets/logo.png')} alt="Zumra Logo" height="30" />
            </div>
            <div className={`footer-links ${isMobile ? 'mb-3' : ''}`}>
              <Link to="/" className="me-3">Terms</Link>
              <Link to="/" className="me-3">Privacy</Link>
              <Link to="/">Contact</Link>
            </div>
            <div className="footer-copyright text-secondary">
              © 2025 Zumra. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
