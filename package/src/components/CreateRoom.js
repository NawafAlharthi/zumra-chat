import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/main.scss';

const CreateRoom = () => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [capacity, setCapacity] = useState(10);
  const [isCreating, setIsCreating] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      alert('Please enter a room name');
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Call API to create room
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: roomName,
          capacity
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Navigate to the new room
        navigate(`/room/${data.room._id}`);
      } else {
        alert(`Error creating room: ${data.message}`);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="create-room-container">
      <h1>Create a New Chat Room</h1>
      <p className="subtitle">Set up your chat room in seconds</p>
      
      <form className="create-room-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="roomName">Room Name</label>
          <input
            type="text"
            id="roomName"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter a name for your chat room"
            required
            maxLength={50}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="capacity">
            Room Capacity: <span className="capacity-value">{capacity}</span>
          </label>
          <input
            type="range"
            id="capacity"
            min="2"
            max="50"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value))}
            className="capacity-slider"
          />
          <div className="capacity-range">
            <span>2</span>
            <span>50</span>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="create-button"
          disabled={isCreating}
        >
          {isCreating ? 'Creating...' : 'Create Chat Room'}
        </button>
      </form>
      
      <div className="create-room-info">
        <h2>How it works</h2>
        <ul>
          <li>Create a room with your chosen name and capacity</li>
          <li>Share the room link with friends</li>
          <li>Chat instantly without registration</li>
          <li>Rooms automatically expire after 24 hours of inactivity</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateRoom;
