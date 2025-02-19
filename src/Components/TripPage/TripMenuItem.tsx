// TripMenuItem.tsx
import React from 'react';
import { Button } from '@mui/material';
import { useTheme, Theme } from '@mui/material';
import { deleteTrip } from '../../Api';
import { useMessage } from '../../Contexts/NotifContext';
import { TripData, MessageContextType } from '../../Common/types';

interface TripMenuItemProps {
  item: TripData;
  handleEditTrip: (item: TripData) => void;
  refetchTrips: () => void;
}

export const TripMenuItem: React.FC<TripMenuItemProps> = ({
                                                            item,
                                                            handleEditTrip,
                                                            refetchTrips
                                                          }) => {
  const theme: Theme = useTheme();
  const notif: MessageContextType = useMessage();

  const handleDeleteTrip = (e: React.MouseEvent, tripId: string): void => {
    e.stopPropagation();
    deleteTrip(true, tripId)
      .then((response) => {
        if (response.status === 200) {
          refetchTrips();
          notif.setPayload({
            type: 'success',
            message: 'Trip deleted successfully.',
          });
        }
      })
      .catch((error: any) => {
        if (error.status === 401) {
          notif.setPayload({
            type: 'error',
            message: `Expenses exist for the trip`,
          });
        } else {
          notif.setPayload({
            type: 'error',
            message: 'Error deleting trip.',
          });
        }
      });
  };

  const handleEdit = (e: React.MouseEvent): void => {
    e.stopPropagation();
    handleEditTrip(item);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      gap:'20px',
      alignItems: 'center',
      width: '100%'
    }}>
      <span>{item.tripTitle}</span>
      <div>
        <Button
          variant="outlined"
          size="small"
          color="error"
          onClick={(e) => handleDeleteTrip(e, item.tripIdShared)}
          sx={{
            borderColor: theme.palette.error.light,
            '&:active': {
              backgroundColor: theme.palette.error.light,
            },
          }}
        >
          Delete
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleEdit}
          sx={{
            marginLeft: '8px',
            color: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
            '&:active': {
              backgroundColor: theme.palette.primary.light,
            },
          }}
        >
          Edit
        </Button>
      </div>
    </div>
  );
};