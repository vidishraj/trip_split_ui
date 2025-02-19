// ExpenseComponents/EmptyState.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const EmptyState: React.FC = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
        },
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'rgba(0, 0, 0, 0.7)',
          textShadow: '1px 1px 5px rgba(0, 0, 0, 0.2)',
        }}
      >
        Nothing to see!
      </Typography>
    </Box>
  );
};

export default EmptyState;
