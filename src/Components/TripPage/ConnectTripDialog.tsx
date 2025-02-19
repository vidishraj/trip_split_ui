
// ConnectTripDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Theme,
} from '@mui/material';
import { useTheme } from '@mui/material';
import { useMessage } from '../../Contexts/NotifContext';
import { sendTripRequest } from '../../Api';
import { MessageContextType } from '../../Common/types'

interface ConnectTripDialogProps {
  open: boolean;
  handleClose: () => void;
}

export const ConnectTripDialog: React.FC<ConnectTripDialogProps> = ({
                                                                      open,
                                                                      handleClose
                                                                    }) => {
  const [tripIdConnect, setTripIdConnect] = useState<string>('');
  const theme: Theme = useTheme();
  const notif: MessageContextType = useMessage();

  const sendTripConnectRequest = (): void => {
    if (tripIdConnect.length !== 6) {
      notif.setPayload({
        type: 'error',
        message: 'Trip Id should be 6 characters long',
      });
      return;
    }

    sendTripRequest(tripIdConnect)
      .then(() => {
        notif.setPayload({
          type: 'success',
          message: 'Request sent successfully. Ask your friend to add you!',
        });
      })
      .catch(() => {
        notif.setPayload({
          type: 'error',
          message: 'Error occurred while sending request',
        });
      });

    resetAndClose();
  };

  const resetAndClose = (): void => {
    setTripIdConnect('');
    handleClose();
  };

  return (
    <Dialog open={open} onClose={resetAndClose} fullWidth maxWidth="sm">
      <DialogTitle>Connect Trip</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="trip-title"
          label="Trip ID"
          type="text"
          fullWidth
          variant="outlined"
          inputProps={{ maxLength: 6, minLength: 6 }}
          value={tripIdConnect}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTripIdConnect(e.target.value)}
          sx={{
            marginTop: '16px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={sendTripConnectRequest}
          disabled={tripIdConnect.length !== 6}
          sx={{
            backgroundColor: tripIdConnect.length !== 6 ? 'grey' : '#1976d2',
            color: '#fff',
            '&:hover': { backgroundColor: '#1565c0' },
          }}
        >
          Send Request
        </Button>
        <Button onClick={resetAndClose} sx={{ color: theme.palette.grey[700] }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
