// DashboardComponents/ActionButtonGroups.tsx
import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { People, AttachMoney, CurrencyExchange } from '@mui/icons-material';

interface ActionButtonGroupsProps {
  isMobile: boolean;
  userCount: number;
  onToggleExpenses: () => void;
  onToggleBalances: () => void;
  onOpenNameList: () => void;
  onOpenCurrencyDialog: () => void;
  onOpenExpenseDialog: () => void;
  onOpenUserDialog: () => void;
}

const ActionButtonGroups: React.FC<ActionButtonGroupsProps> = ({
  isMobile,
  userCount,
  onToggleExpenses,
  onToggleBalances,
  onOpenNameList,
  onOpenCurrencyDialog,
  onOpenExpenseDialog,
  onOpenUserDialog,
}) => {
  return (
    <>
      {/* Group 1: Spendings and See Balances */}
      <Box display="flex" justifyContent="center" mb={1}>
        <Button
          variant="outlined"
          startIcon={<AttachMoney />}
          onClick={onToggleExpenses}
          sx={buttonStylesSmall}
        >
          <Typography variant={isMobile ? 'caption' : 'body2'}>
            See Expenses
          </Typography>
        </Button>
        <Button
          variant="outlined"
          startIcon={<AttachMoney />}
          onClick={onToggleBalances}
          sx={buttonStylesSmall}
        >
          <Typography variant={isMobile ? 'caption' : 'body2'}>
            See Balances
          </Typography>
        </Button>
      </Box>

      {/* Group 2: Users and Rates */}
      <Box display="flex" justifyContent="center" mb={1}>
        <Button
          variant="outlined"
          startIcon={<People />}
          onClick={onOpenNameList}
          sx={buttonStylesSmall}
        >
          <Typography variant={isMobile ? 'caption' : 'body2'}>
            {userCount} Users
          </Typography>
        </Button>
        <Button
          variant="outlined"
          startIcon={<CurrencyExchange />}
          onClick={onOpenCurrencyDialog}
          sx={buttonStylesSmall}
        >
          <Typography variant={isMobile ? 'caption' : 'body2'}>
            Rates
          </Typography>
        </Button>
      </Box>

      {/* Group 3: Add Expense and Add User */}
      <Box display="flex" justifyContent="center" mb={1}>
        <Button
          variant="contained"
          startIcon={<AttachMoney />}
          sx={mainButtonStylesSmall}
          onClick={onOpenExpenseDialog}
        >
          Add Expense
        </Button>
        <Button
          variant="contained"
          startIcon={<People />}
          sx={mainButtonStylesSmall}
          onClick={onOpenUserDialog}
        >
          Add User
        </Button>
      </Box>
    </>
  );
};

const buttonStylesSmall = {
  flexBasis: '40%',
  bgcolor: '#fff',
  color: '#1976d2',
  borderRadius: '8px',
  boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1)',
  margin: '0 4px',
  textTransform: 'none',
  '&:hover': { backgroundColor: '#e3f2fd' },
};

const mainButtonStylesSmall = {
  flexBasis: '40%',
  backgroundColor: '#1976d2',
  color: '#fff',
  borderRadius: '8px',
  margin: '0 4px',
  boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1)',
  textTransform: 'none',
  '&:hover': { backgroundColor: '#1565c0' },
};

export default ActionButtonGroups;
