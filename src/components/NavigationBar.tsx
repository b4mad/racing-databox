import { Box, IconButton, Fade } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

export const NavigationBar = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  // Hide navigation after 3 seconds of inactivity
  let timeoutId: number;
  const resetTimeout = () => {
    window.clearTimeout(timeoutId);
    setIsVisible(true);
    timeoutId = window.setTimeout(() => setIsVisible(false), 3000);
  };

  return (
    <Box
      onMouseMove={resetTimeout}
      onMouseEnter={() => setIsVisible(true)}
      onTouchStart={resetTimeout}
      onTouchMove={resetTimeout}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        padding: 2,
        zIndex: 1000,
      }}
    >
      <Fade in={isVisible}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={() => navigate('/sessions')}
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              transition: 'background-color 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
              color: 'white',
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <ThemeToggle />
        </Box>
      </Fade>
    </Box>
  );
};
