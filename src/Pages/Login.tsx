// src/Login.tsx
import React, { useEffect, useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/system';
import Lottie from 'lottie-react';
import loginAnimation from '../Assets/loginAnimation.json';
import { useUser } from '../Contexts/GlobalContext';
import { auth } from '../Api/FirebaseConfig';
import SignupDialog from '../Components/Signup';
import { useAuth } from '../Contexts/AuthContext';
import { useMessage } from '../Contexts/NotifContext';

const LoginContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  padding: '16px',
  backgroundColor: '#f5f5f5',
}));

const LoginBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  padding: '32px',
  maxWidth: '400px',
  [theme.breakpoints.down('sm')]: {
    boxShadow: 'none',
  },
}));

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  const { setUser } = useUser();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const notif = useMessage();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser(userCredential.user);
      navigate('/trip');
    } catch (error) {
      notif.setPayload({
        type: 'error',
        message: 'Error occurred while logging in.',
      });
      console.error('Error logging in:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSignup = () => {
    setOpenSignup(true);
  };

  const handleCloseSignup = () => {
    setOpenSignup(false);
  };
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      navigate('/trip');
    } // eslint-disable-next-line
  }, [currentUser]);
  return (
    <LoginContainer>
      <Container maxWidth="sm">
        <Lottie animationData={loginAnimation} style={{ height: 200 }} />
        <LoginBox>
          <form onSubmit={handleLogin} style={{}}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              style={{ marginTop: '16px' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>
          <Button
            variant="text"
            color="secondary"
            fullWidth
            onClick={handleOpenSignup}
            style={{ marginTop: '8px' }}
          >
            Don’t have an account? Sign Up
          </Button>
        </LoginBox>
      </Container>
      <SignupDialog open={openSignup} onClose={handleCloseSignup} />
    </LoginContainer>
  );
};

export default Login;
