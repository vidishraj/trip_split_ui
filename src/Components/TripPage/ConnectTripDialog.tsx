import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material';
import { useMessage } from '../../Contexts/NotifContext';
import { sendTripRequest } from '../../Api/Api';
import { MessageContextType } from '../../Assets/types';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import SendIcon from '@mui/icons-material/Send';
import CancelIcon from '@mui/icons-material/Cancel';

interface ConnectTripDialogProps {
  open: boolean;
  handleClose: () => void;
}

export const ConnectTripDialog: React.FC<ConnectTripDialogProps> = ({
  open,
  handleClose,
}) => {
  const [tripIdConnect, setTripIdConnect] = useState<string>('');
  const theme = useTheme();
  const notif: MessageContextType = useMessage();

  const sendTripConnectRequest = (): void => {
    if (tripIdConnect.length !== 6) {
      notif.setPayload({
        type: 'error',
        message: 'Trip ID should be exactly 6 characters long',
      });
      return;
    }

    sendTripRequest(tripIdConnect)
      .then(() => {
        notif.setPayload({
          type: 'success',
          message: 'Request sent successfully. Ask your friend to add you!',
        });
        resetAndClose();
      })
      .catch(() => {
        notif.setPayload({
          type: 'error',
          message: 'Error occurred while sending request',
        });
      });
  };

  const resetAndClose = (): void => {
    setTripIdConnect('');
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={resetAndClose}
      fullWidth
      maxWidth="xs"
      sx={{
        '& .MuiPaper-root': {
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          padding: '16px',
        },
      }}
    >
      {/* Title with Icon */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 'bold',
        }}
      >
        <TravelExploreIcon color="primary" /> Connect Trip
      </DialogTitle>

      <DialogContent>
        {/* Trip ID Input */}
        <TextField
          autoFocus
          margin="dense"
          id="trip-id"
          label="Trip ID (6 characters)"
          type="text"
          fullWidth
          variant="outlined"
          inputProps={{ maxLength: 6, minLength: 6 }}
          value={tripIdConnect}
          onChange={(e) => setTripIdConnect(e.target.value)}
          sx={{
            marginTop: '16px',
            backgroundColor: '#F9FAFB',
            borderRadius: '8px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />
      </DialogContent>

      {/* Button Actions */}
      <DialogActions sx={{ justifyContent: 'space-between', padding: '16px' }}>
        <Button
          onClick={sendTripConnectRequest}
          disabled={tripIdConnect.length !== 6}
          startIcon={<SendIcon />}
          sx={{
            backgroundColor:
              tripIdConnect.length !== 6
                ? theme.palette.grey[400]
                : theme.palette.primary.main,
            color: '#fff',
            '&:hover': {
              backgroundColor:
                tripIdConnect.length !== 6
                  ? theme.palette.grey[400]
                  : theme.palette.primary.dark,
            },
            borderRadius: '8px',
            padding: '8px 16px',
            transition: '0.3s',
          }}
        >
          Send Request
        </Button>

        <IconButton onClick={resetAndClose} color="error">
          <CancelIcon />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
};
