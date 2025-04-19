import React from 'react';
import { Link } from 'react-router-dom';

const RoomFull = () => {
  return (
    <div className="room-full">
      <div className="room-full-icon">
        <i className="fas fa-door-closed"></i>
      </div>
      <h2>Room is Full</h2>
      <p>This room has reached its maximum capacity of participants.</p>
      <Link to="/" className="btn btn-primary">
        Start Your Own Room
      </Link>
      <div className="mt-3">
        <p className="text-secondary">Current participants: 10/10</p>
      </div>
    </div>
  );
};

export default RoomFull;
