import React from 'react';
import { Dialog, DialogContent, Box, Button, Divider } from '@mui/material';
import { useTravel } from '../../Contexts/TravelContext';
import { sendResponseForTripRequest } from '../../Api';
import { useMessage } from '../../Contexts/NotifContext';
import { useLoading } from '../../Contexts/LoadingContext';

interface UsernameDialogProps {
  open: boolean;
  onClose: () => void;
  username: string;
  setUsername: (value: string) => void;
  handleSubmit: () => void;
}

const UsernameDialog: React.FC<UsernameDialogProps> = ({ open, onClose }) => {
  const travelCtx = useTravel();
  const { setPayload } = useMessage();
  const { setLoading } = useLoading();
  function handleResponse(response: boolean, userId: number) {
    setLoading(true);
    sendResponseForTripRequest({
      response: response,
      userId: userId,
      tripId: travelCtx.state.chosenTrip?.tripIdShared,
    })
      .then(() => {
        setPayload({
          type: 'success',
          message: 'Response sent successfully.',
        });
      })
      .catch(() => {
        setPayload({
          type: 'error',
          message: 'Error while sending response for request.',
        });
      })
      .finally(() => {
        setLoading(false);
      });
    onClose();
  }

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
          {travelCtx.state.tripRequests &&
          travelCtx.state.tripRequests.length > 0 ? (
            travelCtx.state.tripRequests.map((item) => {
              return (
                <Box
                  key={item.userId}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  width="100%"
                  padding="8px"
                  bgcolor="#f5f5f5"
                  borderRadius="8px"
                  marginBottom="8px"
                  flexWrap="wrap"
                >
                  <Box display="flex" flexDirection="column" flex="1">
                    <span style={{ fontWeight: 500 }}>{item.userName}</span>
                    <span style={{ color: '#666' }}>{item.email}</span>
                  </Box>

                  <Box display="flex" justifyContent="flex-end" flex="1">
                    <Button
                      onClick={() => handleResponse(true, item.userId)}
                      color="primary"
                      variant="contained"
                      size="small"
                      sx={{ marginRight: '8px' }}
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleResponse(false, item.userId)}
                      color="secondary"
                      variant="outlined"
                      size="small"
                    >
                      Reject
                    </Button>
                  </Box>
                </Box>
              );
            })
          ) : (
            <div>No user requests!</div>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default UsernameDialog;
