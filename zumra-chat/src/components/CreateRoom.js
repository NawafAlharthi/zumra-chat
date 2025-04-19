import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useResponsiveContext } from '../utils/responsive';

const CreateRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useResponsiveContext();
  const initialRoomName = location.state?.roomName || '';
  
  const [roomName, setRoomName] = useState(initialRoomName);
  const [roomCapacity, setRoomCapacity] = useState(10);
  const [roomType, setRoomType] = useState('video');
  
  const handleCreateRoom = (e) => {
    e.preventDefault();
    
    // In a real app, we would make an API call to create the room
    // For now, we'll simulate room creation and redirect to the room
    const roomId = Math.random().toString(36).substring(2, 9);
    
    // Show ad interstitial before entering room (for free users)
    navigate(`/room/${roomId}`, { 
      state: { 
        roomName, 
        roomCapacity, 
        roomType,
        showAd: true 
      } 
    });
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className={`card mt-5 mx-auto ${isMobile ? 'w-100' : ''}`} style={{ maxWidth: '600px' }}>
          <div className="card-body">
            <h2 className="text-center mb-4">Create New Room</h2>
            <p className="text-center mb-4">Set up your virtual meeting space</p>
            
            <form onSubmit={handleCreateRoom}>
              <div className="form-group">
                <label htmlFor="roomName" className="form-label">Room Name</label>
                <input
                  type="text"
                  id="roomName"
                  className="form-input"
                  placeholder="Enter room name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="roomCapacity" className="form-label">Room Capacity</label>
                <div className="d-flex align-items-center">
                  <input
                    type="range"
                    id="roomCapacity"
                    min="2"
                    max="50"
                    value={roomCapacity}
                    onChange={(e) => setRoomCapacity(parseInt(e.target.value))}
                    className="flex-grow-1 me-3"
                  />
                  <span className="room-capacity-value">{roomCapacity} participants</span>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Room Type</label>
                <div className={`room-type-options ${isMobile ? 'room-type-options-mobile' : ''}`}>
                  <div className="room-type-option">
                    <input
                      type="radio"
                      id="videoConference"
                      name="roomType"
                      value="video"
                      checked={roomType === 'video'}
                      onChange={() => setRoomType('video')}
                    />
                    <label htmlFor="videoConference" className={isMobile ? 'w-100' : ''}>Video Conference</label>
                  </div>
                  
                  <div className="room-type-option">
                    <input
                      type="radio"
                      id="audioOnly"
                      name="roomType"
                      value="audio"
                      checked={roomType === 'audio'}
                      onChange={() => setRoomType('audio')}
                    />
                    <label htmlFor="audioOnly" className={isMobile ? 'w-100' : ''}>Audio Only</label>
                  </div>
                  
                  <div className="room-type-option">
                    <input
                      type="radio"
                      id="chatRoom"
                      name="roomType"
                      value="chat"
                      checked={roomType === 'chat'}
                      onChange={() => setRoomType('chat')}
                    />
                    <label htmlFor="chatRoom" className={isMobile ? 'w-100' : ''}>Chat Room</label>
                  </div>
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary btn-lg w-100 mt-4">
                Create Room
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
