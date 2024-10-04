import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import animationData from './dashboardAnimation.json';
import { useTheme, useMediaQuery } from '@mui/material';
import ExpenseDialog from './Dialogs/ExpenseDialog';
import { useTravel } from '../Contexts/TravelContext';
import { NameListDialog } from './Dialogs/UserDialog';
import { insertUser } from '../Api';
import ExpenseContainer from './ExpenseContainer';
import { People, AttachMoney, CurrencyExchange } from '@mui/icons-material';
import UsernameDialog from './Dialogs/AddUserDialog';
import CurrencyDialog from './Dialogs/CurrencyDialog';
import TransactionContainer from './TransactionsContainer';
import Lottie from 'lottie-react';
import { useMessage } from '../Contexts/NotifContext';

interface ActionProps {
  refreshData: any;
}

const Dashboard: React.FC<ActionProps> = (props) => {
  const theme = useTheme();
  const [nameListOpen, setNameListOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expenseDialog, setExpenseDialog] = useState(false);
  const travelCtx = useTravel();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [showExpenseContainer, setShowExpenseContainer] = useState(false);
  const [showBalancesContainer, setShowBalanceContainer] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => setDialogOpen(true);
  const handleDialogClose = () => setDialogOpen(false);
  const handleOpen = () => setOpen(true);
  const { setPayload } = useMessage();
  const handleClose = () => {
    setOpen(false);
    setUsername('');
  };
  const handleToggle = (index: number) => {
    setShowExpenseContainer(index === 0);
    setShowBalanceContainer(index === 1);
  };
  const handleSubmit = () => {
    if (travelCtx.state.chosenTrip) {
      const body = {
        user: [username, travelCtx.state.chosenTrip.tripId],
      };
      insertUser(body)
        .then(() => {
          setPayload({
            type: 'success',
            message: 'User added successfully',
          });
          props.refreshData();
        })
        .catch((error) => {
          setPayload({
            type: 'error',
            message: 'Failed to add user.',
          });
        })
        .finally(handleClose);
    }
    props.refreshData();
  };

  return (
    <Box
      id="parentBox"
      display="flex"
      flexDirection="column"
      height="80vh"
      paddingTop="30px"
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex={-1}
        display={isMobile ? 'flex' : 'relative'}
        alignItems={isMobile ? 'center' : 'start'}
        justifyContent={isMobile ? 'center' : 'flex-start'}
        sx={{ opacity: 0.5 }}
      >
        <Lottie
          loop
          autoplay
          animationData={animationData}
          style={{ opacity: 0.4, height: '100%' }}
          height={isMobile ? 300 : 500}
          width={isMobile ? 300 : 500}
        />
      </Box>

      {/* Group 1: Spendings and See Balances */}
      <Box display="flex" justifyContent="center" mb={1}>
        {' '}
        {/* Reduced margin */}
        <Button
          variant="outlined"
          startIcon={<AttachMoney />}
          onClick={() => handleToggle(0)}
          sx={buttonStylesSmall}
        >
          <Typography variant={isMobile ? 'caption' : 'body2'}>
            See Expenses
          </Typography>
        </Button>
        <Button
          variant="outlined"
          startIcon={<AttachMoney />}
          onClick={() => handleToggle(1)}
          sx={buttonStylesSmall}
        >
          <Typography variant={isMobile ? 'caption' : 'body2'}>
            See Balances
          </Typography>
        </Button>
      </Box>

      {/* Group 2: Users and Rates */}
      <Box display="flex" justifyContent="center" mb={1}>
        {' '}
        {/* Reduced margin */}
        <Button
          variant="outlined"
          startIcon={<People />}
          onClick={() => setNameListOpen(true)}
          sx={buttonStylesSmall}
        >
          <Typography variant={isMobile ? 'caption' : 'body2'}>
            {travelCtx?.state?.summary?.userCount ?? 0} Users
          </Typography>
        </Button>
        <Button
          variant="outlined"
          startIcon={<CurrencyExchange />}
          onClick={handleDialogOpen}
          sx={buttonStylesSmall}
        >
          <Typography variant={isMobile ? 'caption' : 'body2'}>
            Rates
          </Typography>
        </Button>
      </Box>

      {/* Group 3: Add Expense and Add User */}
      <Box display="flex" justifyContent="center" mb={1}>
        {' '}
        {/* Reduced margin */}
        <Button
          variant="contained"
          startIcon={<AttachMoney />}
          sx={mainButtonStylesSmall}
          onClick={() => setExpenseDialog(true)}
        >
          Add Expense
        </Button>
        <Button
          variant="contained"
          startIcon={<People />}
          sx={mainButtonStylesSmall}
          onClick={handleOpen}
        >
          Add User
        </Button>
      </Box>

      {/* Dynamic Container */}
      <Box
        id="outerBox"
        flexGrow={1}
        marginTop="16px"
        borderRadius="8px"
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          height: 'calc(100vh - 250px)',
        }}
      >
        {showExpenseContainer && <ExpenseContainer />}
        {showBalancesContainer && <TransactionContainer />}

        <ExpenseDialog
          open={expenseDialog}
          onClose={() => setExpenseDialog(false)}
        />
      </Box>

      {/* Username Dialog */}
      <UsernameDialog
        onClose={handleClose}
        open={open}
        username={username}
        setUsername={setUsername}
        handleSubmit={handleSubmit}
      />

      {/* Currency Dialog */}
      {dialogOpen && (
        <CurrencyDialog open={dialogOpen} onClose={handleDialogClose} />
      )}

      {/* Name List Dialog */}
      {nameListOpen && (
        <NameListDialog onClose={() => setNameListOpen(false)} />
      )}
    </Box>
  );
};

const buttonStylesSmall = {
  flexBasis: '40%',
  bgcolor: '#fff',
  color: '#1976d2',
  borderRadius: '8px',
  padding: '6px 12px',
  boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1)',
  margin: '0 4px',
  textTransform: 'none',
  fontSize: '0.8rem',
  '&:hover': { backgroundColor: '#e3f2fd' },
};

const mainButtonStylesSmall = {
  flexBasis: '40%',
  padding: '8px',
  fontSize: '0.9rem',
  backgroundColor: '#1976d2',
  color: '#fff',
  borderRadius: '8px',
  margin: '0 4px',
  boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1)',
  textTransform: 'none',
  '&:hover': { backgroundColor: '#1565c0' },
};

export default Dashboard;
