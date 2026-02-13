import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import splashGif from '../assets/Splash.gif'; // Update with your GIF path

const SplashScreen = () => {
  // Prevent scrolling when splash screen is showing
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%', // Changed from 100vw for better responsiveness
        height: '100%', // Changed from 100vh for better responsiveness
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0A0C12',
        zIndex: 9999,
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        backgroundColor: 'white',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <img 
          src={splashGif} 
          alt="Splash Screen" 
          style={{ 
            width: '100%',
            height: '100%',
            objectFit: 'contain', // Changed from 'cover' to 'contain' for better visibility on all devices
            display: 'block',
            maxWidth: '100%',
            maxHeight: '100%',
            mixBlendMode: 'multiply'
          }} 
        />
      </Box>


    </Box>
  );
};

export default SplashScreen;