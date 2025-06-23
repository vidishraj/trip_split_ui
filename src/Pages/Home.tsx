import React from 'react';
import { Box, Container, Typography, Button, useTheme, useMediaQuery, Stack, Paper } from '@mui/material';
import { styled } from '@mui/system';
import Lottie from 'lottie-react';
import { useNavigate } from 'react-router-dom';
import dashboardAnimation from '../Assets/heroAnimation1.json';
import tripAnimation from '../Assets/heroAnimation2.json';
import './Home.scss';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import CalculateIcon from '@mui/icons-material/Calculate';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LaunchIcon from '@mui/icons-material/Launch';
import NewspaperIcon from '@mui/icons-material/Newspaper';
const HeroContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5f5f5 0%, #e3f2fd 100%)',
  position: 'relative',
  overflow: 'hidden',
//   color: '#fff',
}));

const BackgroundAnimation = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  opacity: 0.25,
  pointerEvents: 'none',
  zIndex: 1,
  '& > div': {
    width: '100%',
    height: '100%',
  },
  [theme.breakpoints.down('sm')]: {
    // display: 'none',
  },
}));

const ContentContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 3,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  textAlign: 'center',
  padding: theme.spacing(4),
}));

const AnimationWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  zIndex: 2,
  pointerEvents: 'none',
}));

const FeatureGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: theme.spacing(4),
  width: '100%',
  marginTop: theme.spacing(8),
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(3),
  },
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  borderRadius: theme.spacing(3),
  padding: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.12)',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
  borderRadius: '50%',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(1),
  transition: 'transform 0.3s ease',
  '& svg': {
    fontSize: '2rem',
    color: '#fff',
  },
  '.feature-card:hover &': {
    transform: 'scale(1.1) rotate(5deg)',
  },
}));

const ButtonGroup = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(2),
  marginTop: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    width: '100%',
    maxWidth: '300px',
  },
}));

const Home: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const features = [
    {
      title: 'Multi-Currency Support',
      description: 'Select up to 3 currencies per trip with real-time conversion rates',
      icon: <CurrencyExchangeIcon />,
    },
    {
      title: 'Smart Expense Splitting',
      description: 'Split expenses between specific users with automatic calculations',
      icon: <CalculateIcon />,
    },
    {
      title: 'Trip Management',
      description: 'Create and manage multiple trips with different groups of friends',
      icon: <GroupsIcon />,
    },
    {
      title: 'Balance Tracking',
      description: 'Keep track of who owes what with detailed balance summaries',
      icon: <AccountBalanceWalletIcon />,
    },
    {
      title: 'Other Features',
      description: 'Add notes for a trip and use the embedded calculator for added convenience',
      icon: <NewspaperIcon />,
    }
  ];

  return (
    <HeroContainer className="hero-container">
      <BackgroundAnimation>
        <Lottie 
          animationData={dashboardAnimation}
          className="background-animation"
        />
      </BackgroundAnimation>

      <AnimationWrapper className="animation-wrapper">
        {isMobile ? (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: '14%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
            }}
          >
            <Lottie 
              animationData={tripAnimation} 
              className="lottie-animation"
            />
          </Box>
        ):(<Box 
          sx={{ 
            position: 'absolute', 
            bottom: isMobile ? '5%' : '70%',
            right: isMobile ? '50%' : '5%',
            transform: isMobile ? 'translate(50%, 0)' : 'translate(0, 50%)',
            width: isMobile ? '90%' : '30%',
            display: isMobile ? 'none' : 'block',
            zIndex: 2,
          }}
        >
          <Lottie 
            animationData={tripAnimation} 
            className="lottie-animation"
          />
        </Box>
        )}
      </AnimationWrapper>

      <ContentContainer maxWidth="lg">
        <Typography
          variant={isMobile ? 'h3' : 'h2'}
          component="h1"
          className="gradient-text"
          sx={{
            fontWeight: 800,
            mb: 2,
            letterSpacing: '-0.02em',
          }}
        >
          TripSplit
        </Typography>

        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          sx={{
            mb: 3,
            maxWidth: '800px',
            color: 'text.secondary',
            px: isMobile ? 2 : 0,
            fontWeight: 500,
          }}
        >
          Split expenses effortlessly with friends while traveling
        </Typography>

        <ButtonGroup>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/login')}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: 3,
              fontSize: '1.1rem',
              fontWeight: 600,
              marginTop: isMobile ? '100px' : '0px',
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0, #1976d2)',
              },
            }}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            endIcon={<LaunchIcon />}
            onClick={() => window.open('https://docs.vidish.space/search/?q=tripsplit', '_blank')}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: 3,
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                background: 'rgba(25, 118, 210, 0.04)',
              },
            }}
          >
            Learn More
          </Button>
        </ButtonGroup>

        <FeatureGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index} className="feature-card" elevation={0}>
              <IconWrapper>
                {feature.icon}
              </IconWrapper>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'primary.main',
                  fontSize: isMobile ? '1.2rem' : '1.3rem',
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                {feature.title}
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{
                  fontSize: isMobile ? '0.95rem' : '1rem',
                  lineHeight: 1.6,
                }}
              >
                {feature.description}
              </Typography>
            </FeatureCard>
          ))}
        </FeatureGrid>
      </ContentContainer>
    </HeroContainer>
  );
};

export default Home; 