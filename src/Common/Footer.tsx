import React from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { useTravel } from '../Contexts/TravelContext';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line
  const [searchParams, setSearchParams] = useSearchParams();
  const travelCtx = useTravel();

  const handleTripsPage = () => {
    setSearchParams({});
    navigate('/trip');
    travelCtx.dispatch({
      type: 'SET_CHOSEN_TRIP',
      payload: undefined,
    });
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 10,
        left: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
      }}
    >
      <Button
        variant="contained"
        onClick={handleTripsPage}
        sx={{
          marginRight: '8px',
          backgroundColor: '#1976d2',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#1565c0',
          },
          borderRadius: '20px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        Trips Page
      </Button>

      <Button
        variant="contained"
        onClick={handleLogout}
        sx={{
          backgroundColor: '#d32f2f',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#c62828',
          },
          borderRadius: '20px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default Footer;
