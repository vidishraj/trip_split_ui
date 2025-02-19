// BackgroundAnimation.tsx
import { Box } from '@mui/material';
import Lottie from 'lottie-react';
import animationData from '../../Assets/tripAnimation.json';

interface BackgroundAnimationProps {
  isMobile: boolean;
}

export const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({ isMobile }) => {
  return (
    <Box
      position="absolute"
      top="0"
      left="0"
      right="0"
      bottom="0"
      zIndex={-1}
      display={isMobile ? 'flex' : 'relative'}
      alignItems={isMobile ? 'center' : undefined}
      justifyContent={isMobile ? 'center' : undefined}
      sx={{ opacity: 0.6 }}
    >
      <Lottie
        loop={true}
        autoplay={true}
        animationData={animationData}
        rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
        height={isMobile ? 300 : 500}
        width={isMobile ? 300 : 500}
      />
    </Box>
  );
};