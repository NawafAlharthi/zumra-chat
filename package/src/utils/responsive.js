import React from 'react';
import { useMediaQuery } from 'react-responsive';

// Custom hook for responsive design
export const useResponsive = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });
  const isDesktop = useMediaQuery({ minWidth: 992 });
  const isLandscape = useMediaQuery({ query: '(orientation: landscape)' });
  const isPortrait = useMediaQuery({ query: '(orientation: portrait)' });
  const isRetina = useMediaQuery({ query: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)' });
  const prefersReducedMotion = useMediaQuery({ query: '(prefers-reduced-motion: reduce)' });
  const prefersDarkMode = useMediaQuery({ query: '(prefers-color-scheme: dark)' });
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    isPortrait,
    isRetina,
    prefersReducedMotion,
    prefersDarkMode
  };
};

// Responsive context provider
export const ResponsiveContext = React.createContext({
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isLandscape: false,
  isPortrait: true,
  isRetina: false,
  prefersReducedMotion: false,
  prefersDarkMode: false,
  toggleDarkMode: () => {}
});

export const ResponsiveProvider = ({ children }) => {
  const responsive = useResponsive();
  const [isDarkMode, setIsDarkMode] = React.useState(responsive.prefersDarkMode);
  
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };
  
  React.useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode-enabled');
    } else {
      document.body.classList.remove('dark-mode-enabled');
    }
  }, [isDarkMode]);
  
  const value = {
    ...responsive,
    isDarkMode,
    toggleDarkMode
  };
  
  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
};

// Hook to use responsive context
export const useResponsiveContext = () => React.useContext(ResponsiveContext);
