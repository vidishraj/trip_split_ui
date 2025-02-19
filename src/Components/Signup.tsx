import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Person } from '@mui/icons-material';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { useUser } from '../Contexts/GlobalContext';
import { auth } from '../Api/FirebaseConfig';
import { insertUser } from '../Api/Api';
import { useMessage } from '../Contexts/NotifContext';
import HowToRegIcon from '@mui/icons-material/HowToReg';

interface SignupDialogProps {
  open: boolean;
  onClose: () => void;
}

const SignupDialog: React.FC<SignupDialogProps> = ({ open, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useUser();
  const notif = useMessage();

  const handleSignup = async () => {
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (userName.length < 5) {
      setError('UserName must be at least 5 characters long');
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password)
        .then((response) => {
          const body = {
            userName: userName,
            email: email,
          };
          insertUser(body)
            .then(() => setUser(response.user))
            .catch(() => {
              notif.setPayload({ type: 'error', payload: 'Error occurred while inserting user after sign up.' +
                  ' Try again later!' });
              deleteUser(response.user);
            });
        })
        .catch(() => {
          notif.setPayload({ type: 'error', payload: 'Error occurred while signing up. Try again later!' });
          setError('Error signing up. Try again.');
        });
      onClose();
    } catch (error) {
      notif.setPayload({ type: 'error', payload: 'Error occurred while signing up. Try again later!' });
      setError('Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>
        <HowToRegIcon color="primary" /> Create New Trip
      </DialogTitle>
      <DialogContent sx={{ padding: '20px' }}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="User Name"
          type="text"
          fullWidth
          margin="normal"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {error && (
          <Typography color="error" variant="body2" margin="dense" textAlign="center">
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', padding: '20px' }}>
        <Button onClick={onClose} sx={{ color: 'grey.600', fontWeight: 'bold' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSignup}
          color="primary"
          disabled={loading}
          variant="contained"
          sx={{ borderRadius: '8px', padding: '8px 20px', fontWeight: 'bold' }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign Up'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignupDialog;