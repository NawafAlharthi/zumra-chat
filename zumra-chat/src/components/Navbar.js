import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useResponsiveContext } from '../utils/responsive';
import MobileMenu from './MobileMenu';

const Navbar = ({ transparent = false }) => {
  const { isMobile } = useResponsiveContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  return (
    <>
      <nav className={`navbar ${transparent ? 'navbar-transparent' : ''}`}>
        <div className="navbar-logo">
          <Link to="/">
            <img src={logo} alt="Zumra Logo" />
          </Link>
        </div>
        <div className="navbar-menu">
          {!isMobile && (
            <>
              <div className="navbar-menu-item">
                <Link to="/">Features</Link>
              </div>
              <div className="navbar-menu-item">
                <Link to="/">Pricing</Link>
              </div>
              <div className="navbar-menu-item">
                <Link to="/">About</Link>
              </div>
              <div className="navbar-menu-item">
                <Link to="/">Contact</Link>
              </div>
            </>
          )}
          <div className="navbar-menu-item">
            <Link to="/" className="btn btn-outline btn-sm">Sign In</Link>
          </div>
          <div className="navbar-menu-item">
            <Link to="/" className="btn btn-primary btn-sm">Sign Up</Link>
          </div>
          {isMobile && (
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              <i className="fas fa-bars"></i>
            </button>
          )}
        </div>
      </nav>
      
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
};

export default Navbar;
