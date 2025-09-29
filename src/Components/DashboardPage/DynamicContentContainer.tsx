// DashboardComponents/DynamicContentContainer.tsx
import React from 'react';
import { Box } from '@mui/material';
import ExpenseContainer from './ExpenseContainer';
import TransactionContainer from './BalanceContainer';
import ExpenseDialog from './Dialogs/ExpenseDialog';
import { useTravel } from '../../Contexts/TravelContext';

interface DynamicContentContainerProps {
  showExpenseContainer: boolean;
  showBalancesContainer: boolean;
  onCloseExpenseDialog: () => void;
}

const DynamicContentContainer: React.FC<DynamicContentContainerProps> = ({
  showExpenseContainer,
  showBalancesContainer,
  onCloseExpenseDialog,
}) => {
  const travelCtx = useTravel();
  
  return (
    <Box
      id="outerBox"
      flexGrow={1}
      marginTop="8px"
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
        onClose={onCloseExpenseDialog}
        editMode={Boolean(travelCtx.state.selectedExpense)}
        editData={travelCtx.state.selectedExpense}
      />
    </Box>
  );
};

export default DynamicContentContainer;
