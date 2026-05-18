// DynamicContentContainer.tsx
import React from 'react';
import ExpenseContainer from './ExpenseContainer';
import BalanceContainer from './BalanceContainer';
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
    <div style={{ minHeight: 480 }}>
      {showExpenseContainer && <ExpenseContainer />}
      {showBalancesContainer && <BalanceContainer />}

      <ExpenseDialog
        onClose={onCloseExpenseDialog}
        editMode={Boolean(travelCtx.state.selectedExpense)}
        editData={travelCtx.state.selectedExpense}
      />
    </div>
  );
};

export default DynamicContentContainer;
