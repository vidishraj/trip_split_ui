// TripPage.tsx
import React, { useState } from 'react';
import { Box} from '@mui/material';
import { useTheme, useMediaQuery, Theme } from '@mui/material';
import { useTravel } from '../Contexts/TravelContext';
import { useMessage } from '../Contexts/NotifContext';
import { fetchTrips } from '../Api/Api';
import { CreateTripDialog } from '../Components/TripPage/CreateTripDialog';
import { ConnectTripDialog } from '../Components/TripPage/ConnectTripDialog';
import { EditTripDialog } from '../Components/TripPage/EditTripDialog';
import { TripData } from '../Assets/types';
import { TripSelector } from '../Components/TripPage/TripSelector';
import { BackgroundAnimation } from '../Components/TripPage/BackgroundAnimation';
import { ActionButtons } from '../Components/TripPage/ActionButtons';

const TripPage: React.FC = () => {
  const [trip, setTrip] = useState<string>('');
  const [openCreateDialog, setOpenCreateDialog] = useState<boolean>(false);
  const [openConnectDialog, setOpenConnectDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [editData, setEditData] = useState<TripData | undefined>(undefined);

  const notif = useMessage();
  const travelCtx = useTravel();
  const theme: Theme = useTheme();
  const isMobile: boolean = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTripChange = (event: React.ChangeEvent<{ value: unknown }>): void => {
    setTrip(event.target.value as string);
  };

  const refetchTrips = (): void => {
    fetchTrips(true)
      .then((response) => {
        if (Array.isArray(response.data.Message)) {
          response.data.Message.forEach((item: TripData) => {
            item['currencies'] = item['currencies'].toString().split(',');
          });
          travelCtx.dispatch({
            type: 'SET_TRIP',
            payload: response.data.Message,
          });
        }
      })
      .catch(() => {
        notif.setPayload({
          type: 'error',
          message: 'Error fetching trip.',
        });
      });
  };

  const handleEditTrip = (item: TripData): void => {
    setEditData(item);
    setOpenEditDialog(true);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      position="relative"
      sx={{ overflow: 'hidden' }}
    >
      <BackgroundAnimation isMobile={isMobile} />

      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <TripSelector
          trip={trip}
          handleTripChange={handleTripChange}
          trips={travelCtx?.state?.trip}
          travelCtx={travelCtx}
          isMobile={isMobile}
          handleEditTrip={handleEditTrip}
          refetchTrips={refetchTrips}
        />

        <ActionButtons
          isMobile={isMobile}
          onCreateClick={() => setOpenCreateDialog(true)}
          onConnectClick={() => setOpenConnectDialog(true)}
        />

        <CreateTripDialog
          open={openCreateDialog}
          handleClose={() => setOpenCreateDialog(false)}
          refetchTrips={refetchTrips}
        />

        <ConnectTripDialog
          open={openConnectDialog}
          handleClose={() => setOpenConnectDialog(false)}
        />

        <EditTripDialog
          editData={editData}
          open={openEditDialog}
          handleClose={() => setOpenEditDialog(false)}
          refetchTrips={refetchTrips}
        />
      </Box>
    </Box>
  );
};

export default TripPage;