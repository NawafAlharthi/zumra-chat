import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-container text-center">
      <div className="container">
        <h1 className="mt-5">404</h1>
        <h2 className="mb-4">Page Not Found</h2>
        <p className="mb-4">The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
