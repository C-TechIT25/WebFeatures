import React from 'react';
import { Box, LinearProgress, Typography, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';

const ProgressContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const ProgressBar = ({ 
  value, 
  show = true, 
  message = 'Processing...', 
  variant = 'determinate' 
}) => {
  return (
    <Fade in={show}>
      <ProgressContainer>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
            {variant === 'determinate' && (
              <Typography variant="body2" color="text.secondary">
                {Math.round(value)}%
              </Typography>
            )}
          </Box>
          <LinearProgress
            variant={variant}
            value={value}
            sx={{
              height: 8,
              borderRadius: 4,
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                borderRadius: 4,
              },
            }}
          />
        </Box>
      </ProgressContainer>
    </Fade>
  );
};

export default ProgressBar;