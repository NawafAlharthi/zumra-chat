import React from 'react';
import { Link } from 'react-router-dom';

const AdInterstitial = ({ onClose }) => {
  const [timeLeft, setTimeLeft] = React.useState(5);
  const [canSkip, setCanSkip] = React.useState(false);
  
  React.useEffect(() => {
    // Set timer to allow skipping after 3 seconds
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 3000);
    
    // Set countdown timer
    const countdownInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(countdownInterval);
          onClose();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => {
      clearTimeout(skipTimer);
      clearInterval(countdownInterval);
    };
  }, [onClose]);
  
  return (
    <div className="ad-interstitial">
      <div className="ad-interstitial-content">
        <h3>🎉 Your room is being set up...</h3>
        <p>Hang tight! We're preparing your meeting space.</p>
        
        <div className="ad-interstitial-timer">
          {timeLeft} seconds remaining...
        </div>
        
        <div className="ad-banner">
          {/* Ad content would go here */}
          <div style={{ 
            backgroundColor: '#f0f0f0', 
            padding: '20px', 
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <h4>Try Zumra Premium</h4>
            <p>Unlock larger rooms, custom branding, and no ads!</p>
            <Link to="/" className="btn btn-outline">Learn More</Link>
          </div>
        </div>
        
        {canSkip && (
          <button 
            className="btn btn-primary ad-interstitial-skip"
            onClick={onClose}
          >
            Skip Now
          </button>
        )}
      </div>
    </div>
  );
};

export default AdInterstitial;
