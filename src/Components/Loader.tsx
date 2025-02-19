import React from 'react';
import { Box } from '@mui/material';
import { useLoading } from '../Contexts/LoadingContext';
import Lottie from 'lottie-react';
import loginAnimation from '../Assets/loaderAnimation.json';
const Loader: React.FC = () => {
  const { loading } = useLoading();

  return loading ? (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 9999,
      }}
    >
      <Lottie animationData={loginAnimation} style={{ height: 200 }} />
    </Box>
  ) : null;
};

export default Loader;
