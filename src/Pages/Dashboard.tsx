// Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import animationData from '../Assets/dashboardAnimation.json';
import { useTheme, useMediaQuery } from '@mui/material';
import { useTravel } from '../Contexts/TravelContext';
import { fetchTripRequestsForTrip } from '../Api/Api';
import { useMessage } from '../Contexts/NotifContext';
import BackgroundAnimation from '../Components/DashboardPage/BackgroundAnimation';
import ActionButtonGroups from '../Components/DashboardPage/ActionButtonGroups';
import DynamicContentContainer from '../Components/DashboardPage/DynamicContentContainer';
import DashboardDialogs from '../Components/DashboardPage/DashboardDialogs';

interface ActionProps {
  refreshData: () => void;
}

const Dashboard: React.FC<ActionProps> = ({ refreshData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const travelCtx = useTravel();
  const { setPayload } = useMessage();

  // State declarations
  const [nameListOpen, setNameListOpen] = useState(false);
  const [expenseDialog, setExpenseDialog] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [currencyDialogOpen, setCurrencyDialogOpen] = useState(false);
  const [activeContainer, setActiveContainer] = useState<
    'expenses' | 'balances' | null
  >(null);

  useEffect(() => {
    if (travelCtx.state.chosenTrip?.tripIdShared) {
      fetchTripRequestsForTrip(travelCtx.state.chosenTrip?.tripIdShared)
        .then((response) => {
          if (Array.isArray(response.data.Message)) {
            travelCtx.dispatch({
              type: 'SET_TRIP_REQ',
              payload: response.data.Message,
            });
          }
        })
        .catch(() => {
          setPayload({
            type: 'error',
            message: 'Error fetching user requests',
          });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelCtx.state.chosenTrip]);

  // Container visibility handlers
  const handleToggleContainer = (container: 'expenses' | 'balances') => {
    setActiveContainer(container);
  };

  // Dialog handlers
  const handleOpenUserDialog = () => setUserDialogOpen(true);
  const handleCloseUserDialog = () => {
    setUserDialogOpen(false);
    setUsername('');
  };

  return (
    <Box
      id="parentBox"
      display="flex"
      flexDirection="column"
      paddingTop="30px"
      sx={{ textWrap: 'nowrap' }}
    >
      {/* Background Animation */}
      <BackgroundAnimation animationData={animationData} isMobile={isMobile} />

      {/* Trip ID Display */}
      <Box
        sx={{
          position: 'absolute',
          zIndex: 8,
          width: 'fit-content',
          right: 10,
          top: 5,
          marginRight: '10px',
        }}
      >
        TripId: {travelCtx.state.chosenTrip?.tripIdShared}
      </Box>

      {/* Action Buttons */}
      <ActionButtonGroups
        isMobile={isMobile}
        userCount={travelCtx?.state?.summary?.userCount ?? 0}
        onToggleExpenses={() => handleToggleContainer('expenses')}
        onToggleBalances={() => handleToggleContainer('balances')}
        onOpenNameList={() => setNameListOpen(true)}
        onOpenCurrencyDialog={() => setCurrencyDialogOpen(true)}
        onOpenExpenseDialog={() => setExpenseDialog(true)}
        onOpenUserDialog={handleOpenUserDialog}
      />

      {/* Dynamic Content Container */}
      <DynamicContentContainer
        showExpenseContainer={activeContainer === 'expenses'}
        showBalancesContainer={activeContainer === 'balances'}
        expenseDialogOpen={expenseDialog}
        onCloseExpenseDialog={() => setExpenseDialog(false)}
      />

      {/* Dialogs */}
      <DashboardDialogs
        userDialogOpen={userDialogOpen}
        username={username}
        setUsername={setUsername}
        onCloseUserDialog={handleCloseUserDialog}
        onSubmitUser={() => {
          // Logic for adding a user
          // ... (moved to a separate component)
          refreshData();
          handleCloseUserDialog();
        }}
        currencyDialogOpen={currencyDialogOpen}
        onCloseCurrencyDialog={() => setCurrencyDialogOpen(false)}
        nameListOpen={nameListOpen}
        onCloseNameList={() => setNameListOpen(false)}
        refreshData={refreshData}
        travelCtx={travelCtx}
      />
    </Box>
  );
};

export default Dashboard;
