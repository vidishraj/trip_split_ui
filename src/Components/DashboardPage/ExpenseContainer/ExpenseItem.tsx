// ExpenseComponents/ExpenseItem.tsx
import React, { useState } from 'react';
import { Card, CardContent, Divider, useTheme } from '@mui/material';
import { useTravel } from '../../../Contexts/TravelContext';
import { useMessage } from '../../../Contexts/NotifContext';
import ConfirmationDialog from '../../ConfirmationDialog';
import { deleteExpense } from '../../../Api/Api';
import ExpenseDetails from './ExpenseDetails';
import ExpenseHeader from './ExpenseHeader';

interface ExpenseProps {
  expense: any;
}

const ExpenseItem: React.FC<ExpenseProps> = ({ expense }) => {
  const theme = useTheme();
  const travelCtx = useTravel();
  const { setPayload } = useMessage();
  const [confirmDialog, setConfirmDialog] = useState(false);
  const formattedDate = new Date(expense.date).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleEdit = () => {
    travelCtx.dispatch({type:'SET_SELECTED_EXPENSE',payload:expense});
    travelCtx.dispatch({type:'SET_EXPENSE_DIALOG_STATE',payload:true});
  };

  const handleDelete = () => {
    setConfirmDialog(false);
    deleteExpense(true, expense.expenseId, expense.tripId)
      .then(() => {
        setPayload({
          type: 'success',
          message: 'Expense deleted successfully',
        });
        travelCtx.state.refreshData();
      })
      .catch(() => {
        setPayload({
          type: 'error',
          message: 'Failed to delete Expense.',
        });
      });
  };

  return (
    <Card
      sx={{
        width: '100%',
        minWidth: 320,
        maxWidth: 360,
        margin: '4px 0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        padding: '12px 16px',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        transition: 'box-shadow 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
        [theme.breakpoints.down('sm')]: {
          padding: '10px 12px',
          margin: '3px 0',
        },
      }}
    >
      <CardContent sx={{ paddingBottom: '12px !important' }}>
        <ExpenseHeader
          title={expense.expenseDesc}
          date={formattedDate}
          onEdit={handleEdit}
          onDelete={() => setConfirmDialog(true)}
        />

        <ConfirmationDialog
          open={confirmDialog}
          message="Are you sure you want to delete this item?"
          onSubmit={handleDelete}
          onCancel={() => setConfirmDialog(false)}
        />

        <Divider sx={{ marginBottom: '8px', backgroundColor: '#ddd' }} />

        <ExpenseDetails
          amount={expense.amount}
          paidBy={expense.paidBy}
          splitBetween={expense.splitBetween}
        />
      </CardContent>
    </Card>
  );
};

export default ExpenseItem;
