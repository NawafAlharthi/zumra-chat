import React from 'react';
import { useResponsiveContext } from '../utils/responsive';

const MobileMenu = ({ isOpen, onClose }) => {
  const { isMobile } = useResponsiveContext();
  
  if (!isMobile) return null;
  
  return (
    <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
      <div className="mobile-menu-header">
        <button className="mobile-menu-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      <div className="mobile-menu-content">
        <nav className="mobile-nav">
          <ul>
            <li><a href="/">Features</a></li>
            <li><a href="/">Pricing</a></li>
            <li><a href="/">About</a></li>
            <li><a href="/">Contact</a></li>
            <li className="mobile-nav-buttons">
              <a href="/" className="btn btn-outline btn-block mb-2">Sign In</a>
              <a href="/" className="btn btn-primary btn-block">Sign Up</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
