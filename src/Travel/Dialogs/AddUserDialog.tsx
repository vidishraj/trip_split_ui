import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  DialogActions,
  Button,
  TextField,
  Divider,
} from '@mui/material';

interface UsernameDialogProps {
  open: boolean;
  onClose: () => void;
  username: string;
  setUsername: (value: string) => void;
  handleSubmit: () => void;
}

const UsernameDialog: React.FC<UsernameDialogProps> = ({
  open,
  onClose,
  username,
  setUsername,
  handleSubmit,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogContent>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          padding="16px"
          bgcolor="#ffffff"
          borderRadius="8px"
        >
          <Divider sx={{ width: '100%', marginBottom: '16px' }} />

          <TextField
            autoFocus
            margin="dense"
            label="Username (min 5)"
            type="text"
            fullWidth
            variant="outlined"
            inputProps={{ maxLength: 20 }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ marginBottom: '16px' }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleSubmit}
          disabled={username?.length < 5}
          color="primary"
          variant="contained"
        >
          Submit
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UsernameDialog;
