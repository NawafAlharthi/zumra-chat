import React from 'react';
import { Link } from 'react-router-dom';

const RoomExpired = () => {
  return (
    <div className="room-expired">
      <div className="room-expired-icon">
        <i className="fas fa-clock"></i>
      </div>
      <h2>Room Expired</h2>
      <p>This room has expired or been closed by the host.</p>
      <Link to="/" className="btn btn-primary">
        Restart Room
      </Link>
      <div className="mt-3">
        <p className="text-secondary">Expired on April 18, 2025</p>
      </div>
    </div>
  );
};

export default RoomExpired;
