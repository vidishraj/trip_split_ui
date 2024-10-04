// src/SignupDialog.tsx
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
} from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useUser } from '../Contexts/GlobalContext';
import { auth } from './FirebaseConfig';

interface SignupDialogProps {
  open: boolean;
  onClose: () => void;
}

const SignupDialog: React.FC<SignupDialogProps> = ({ open, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useUser();

  const handleSignup = async () => {
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser(userCredential.user);
      onClose();
    } catch (error) {
      setError('Error creating account. Please try again.');
      console.error('Error signing up:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Create an Account</DialogTitle>
      <DialogContent>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {error && (
          <Typography color="error" variant="body2" margin="dense">
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleSignup}
          color="primary"
          disabled={loading}
          variant="contained"
        >
          {loading ? <CircularProgress size={24} /> : 'Sign Up'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignupDialog;
