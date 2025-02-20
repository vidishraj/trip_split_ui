import React from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { useTravel } from '../Contexts/TravelContext';
import { Logout, FlightTakeoff } from '@mui/icons-material'; // Icons

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
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        display: 'flex',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        background: 'whitesmoke', // Soft background
        backdropFilter: 'blur(12px)', // Glassmorphism effect
        padding: '12px 20px',
        borderRadius: '15px',
        boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
      }}
    >
      {/* Trips Page Button */}
      <Button
        variant="contained"
        onClick={handleTripsPage}
        startIcon={<FlightTakeoff />} // ✈️ Icon
        sx={{
          backgroundColor: '#1565c0',
          color: '#fff',
          '&:hover': { backgroundColor: '#0d47a1' },
          borderRadius: '25px',
          padding: '10px 20px',
          fontWeight: 'bold',
          transition: 'all 0.3s ease',
        }}
      >
        Trips
      </Button>

      {/* Logout Button */}
      <Button
        variant="contained"
        onClick={handleLogout}
        startIcon={<Logout />} // 🚪 Icon
        sx={{
          backgroundColor: '#d32f2f',
          color: '#fff',
          '&:hover': { backgroundColor: '#b71c1c' },
          borderRadius: '25px',
          padding: '10px 20px',
          fontWeight: 'bold',
          transition: 'all 0.3s ease',
        }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default Footer;
