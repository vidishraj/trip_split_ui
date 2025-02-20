// DashboardComponents/DynamicContentContainer.tsx
import React from 'react';
import { Box } from '@mui/material';
import ExpenseContainer from './ExpenseContainer';
import TransactionContainer from './BalanceContainer';
import ExpenseDialog from './Dialogs/ExpenseDialog';

interface DynamicContentContainerProps {
  showExpenseContainer: boolean;
  showBalancesContainer: boolean;
  expenseDialogOpen: boolean;
  onCloseExpenseDialog: () => void;
}

const DynamicContentContainer: React.FC<DynamicContentContainerProps> = ({
  showExpenseContainer,
  showBalancesContainer,
  expenseDialogOpen,
  onCloseExpenseDialog,
}) => {
  return (
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

      <ExpenseDialog open={expenseDialogOpen} onClose={onCloseExpenseDialog} />
    </Box>
  );
};

export default DynamicContentContainer;
