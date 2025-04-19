import React from 'react';
import { Link } from 'react-router-dom';

const EmptyRoom = () => {
  return (
    <div className="room-empty">
      <div className="room-empty-icon">
        <i className="fas fa-user"></i>
      </div>
      <h2>Be the first one to join this room!</h2>
      <p className="text-center">1/5</p>
      <div className="social-share mt-4">
        <p>
          <span role="img" aria-label="fire">🔥</span> Your friends are missing this room. Share the link!
        </p>
        <div className="share-buttons mt-3">
          <button className="btn btn-outline btn-sm me-2">
            <i className="fab fa-twitter"></i>
          </button>
          <button className="btn btn-outline btn-sm me-2">
            <i className="fab fa-facebook"></i>
          </button>
          <button className="btn btn-outline btn-sm me-2">
            <i className="fab fa-linkedin"></i>
          </button>
          <button className="btn btn-outline btn-sm">
            <i className="fas fa-link"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmptyRoom;
