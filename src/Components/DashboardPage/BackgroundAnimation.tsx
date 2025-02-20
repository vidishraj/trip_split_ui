// DashboardComponents/BackgroundAnimation.tsx
import React from 'react';
import { Box } from '@mui/material';
import Lottie from 'lottie-react';

interface BackgroundAnimationProps {
  animationData: any;
  isMobile: boolean;
}

const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({
                                                                   animationData,
                                                                   isMobile
                                                                 }) => {
  return (
    <Box
      position="absolute"
      zIndex={-1}
      display={isMobile ? 'flex' : 'relative'}
      alignItems={isMobile ? 'center' : 'start'}
      justifyContent={isMobile ? 'center' : 'flex-start'}
      sx={{ opacity: 0.5 }}
    >
      <Lottie
        loop
        autoplay
        animationData={animationData}
        style={{ opacity: 0.4, height: '100%' }}
        height={isMobile ? 300 : 500}
        width={isMobile ? 300 : 500}
      />
    </Box>
  );
};

export default BackgroundAnimation;