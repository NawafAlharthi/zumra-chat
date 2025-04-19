import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import AdInterstitial from './AdInterstitial';
import { useResponsiveContext } from '../utils/responsive';

const ChatRoom = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useResponsiveContext();
  const { roomName, roomCapacity, roomType, showAd } = location.state || {};
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [showAdModal, setShowAdModal] = useState(showAd || false);
  const [isRoomFull, setIsRoomFull] = useState(false);
  
  // Simulate participants
  useEffect(() => {
    const mockParticipants = [
      { id: 1, name: 'Sarah Chen', status: 'online', isHost: true },
      { id: 2, name: 'Alex Morgan', status: 'away' },
      { id: 3, name: 'Mike Wilson', status: 'online' }
    ];
    
    setParticipants(mockParticipants);
    
    // Check if room is full (for demo purposes)
    if (mockParticipants.length >= roomCapacity) {
      setIsRoomFull(true);
      navigate('/room-full');
    }
    
    // Simulate receiving messages
    const mockMessages = [
      { id: 1, sender: 'Sarah Chen', content: 'Hey team, how\'s the new design system coming along?', time: '10:23 AM', isSelf: false },
      { id: 2, sender: 'You', content: 'Making good progress! Just finished the component library.', time: '10:25 AM', isSelf: true }
    ];
    
    setMessages(mockMessages);
  }, [roomCapacity, navigate]);
  
  // Close sidebar when switching to mobile view
  useEffect(() => {
    if (isMobile) {
      setShowSidebar(false);
    }
  }, [isMobile]);
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        sender: 'You',
        content: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: true
      };
      
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };
  
  const handleLeaveRoom = () => {
    navigate('/');
  };
  
  if (showAdModal) {
    return <AdInterstitial onClose={() => setShowAdModal(false)} />;
  }
  
  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="d-flex align-items-center">
          <h2 className="mb-0">{roomName || 'Design Team'}</h2>
          <span className="ms-3 text-secondary">
            <i className="fas fa-user"></i> {participants.length} online
          </span>
        </div>
        <button className="btn btn-outline" onClick={handleLeaveRoom}>
          {isMobile ? <i className="fas fa-sign-out-alt"></i> : 'Leave Room'}
        </button>
      </div>
      
      <div className="chat-content d-flex">
        <div className="chat-messages flex-grow-1">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`chat-message ${message.isSelf ? 'chat-message-self' : 'chat-message-sender'}`}
            >
              {!message.isSelf && <div className="chat-message-name">{message.sender}</div>}
              <div className="chat-message-content">{message.content}</div>
              <div className="chat-message-time">{message.time}</div>
            </div>
          ))}
        </div>
        
        {showSidebar && (
          <div className={`sidebar ${showSidebar ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h3>Room Settings</h3>
              {isMobile && (
                <button 
                  className="btn btn-sm" 
                  onClick={() => setShowSidebar(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            
            <div className="sidebar-content">
              <div className="form-group">
                <label className="form-label d-flex justify-content-between">
                  Lock Room
                  <div className="form-switch">
                    <input type="checkbox" className="form-check-input" />
                  </div>
                </label>
              </div>
              
              <div className="form-group">
                <label className="form-label d-flex justify-content-between">
                  Notifications
                  <div className="form-switch">
                    <input type="checkbox" className="form-check-input" defaultChecked />
                  </div>
                </label>
              </div>
              
              <h3 className="mt-4 mb-3">Participants</h3>
              
              <div className="participants-list">
                {participants.map(participant => (
                  <div key={participant.id} className="participant-item d-flex align-items-center mb-3">
                    <div className="participant-avatar">
                      <div className={`avatar-status ${participant.status}`}></div>
                    </div>
                    <div className="participant-info ms-2">
                      <div className="participant-name">
                        {participant.name} {participant.isHost && <span className="badge">Host</span>}
                      </div>
                      <div className="participant-status text-secondary">
                        {participant.status === 'online' ? 'Online' : 'Away'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="chat-input">
        <form onSubmit={handleSendMessage} className="d-flex w-100">
          {isMobile && (
            <button 
              type="button" 
              className="btn btn-outline btn-icon me-2"
              onClick={() => setShowSidebar(true)}
            >
              <i className="fas fa-users"></i>
            </button>
          )}
          
          <input
            type="text"
            className="form-input"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          
          <button type="submit" className="btn btn-primary ms-2">
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>
      
      {isMobile && !showSidebar && (
        <button 
          className="floating-action-btn"
          onClick={() => setShowSidebar(true)}
        >
          <i className="fas fa-users"></i>
        </button>
      )}
    </div>
  );
};

export default ChatRoom;
