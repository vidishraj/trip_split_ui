// ExpenseComponents/ExpenseItem.tsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Divider,
  useTheme
} from '@mui/material';
import { useTravel } from '../../../Contexts/TravelContext';
import { useMessage } from '../../../Contexts/NotifContext';
import ExpenseDialog from '../Dialogs/ExpenseDialog';
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
  const [editMode, setEditMode] = useState(false);
  const formattedDate = new Date(expense.date).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleEdit = () => {
    setEditMode(true);
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
        margin: '8px 0',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        borderRadius: '12px',
        padding: '12px 16px',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        [theme.breakpoints.down('sm')]: {
          padding: '8px',
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
      
      <ExpenseDialog
        editMode={true}
        editData={expense}
        open={editMode}
        onClose={() => setEditMode(false)}
      />
    </Card>
  );
};

export default ExpenseItem;
