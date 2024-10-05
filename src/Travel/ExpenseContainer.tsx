import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  useTheme,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTravel } from '../Contexts/TravelContext';
import './ExpenseContainer.scss';
import { deleteExpense } from '../Api';
import { useMessage } from '../Contexts/NotifContext';
import ExpenseDialog from './Dialogs/ExpenseDialog';
import ConfirmationDialog from '../Common/ConfirmationDialog';

const ExpenseContainer = () => {
  const travelCtx = useTravel();

  useEffect(() => {
    fetchMoreData();
  }, []);

  const fetchMoreData = () => {};

  const sortedExpenses = travelCtx.state.expenses.sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Box
      id="innerBox"
      flexGrow={1}
      width="100%"
      borderRadius="12px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        height: '100%',
        backgroundColor: 'transparent',
        overflow: 'auto',
      }}
    >
      {sortedExpenses && sortedExpenses.length > 0 ? (
        <InfiniteScroll
          dataLength={sortedExpenses.length}
          next={fetchMoreData}
          hasMore={false}
          loader={
            <Box display="flex" justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          }
          endMessage={
            <Typography
              variant="body2"
              color="textSecondary"
              textAlign="center"
            >
              You have seen it all!
            </Typography>
          }
          height={'80%'}
          scrollableTarget={'parentBox'}
          style={{ width: '100%' }}
        >
          {sortedExpenses.map((expense: any, index: any) => (
            <Box
              key={index}
              padding="16px"
              margin="8px 0"
              borderRadius="12px"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <ExpenseItem expense={expense} />
            </Box>
          ))}
        </InfiniteScroll>
      ) : (
        <Box
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Nothing to see!
        </Box>
      )}
    </Box>
  );
};

interface ExpenseProps {
  expense: any;
}

const ExpenseItem = ({ expense }: ExpenseProps) => {
  const theme = useTheme();
  const travelCtx = useTravel();
  const { setPayload } = useMessage();
  const [confirmDialog, setConfirmDialog] = useState(false);
  const { date, expenseDesc, amount, paidBy, splitBetween } = expense;
  const [editMode, setEditMode] = useState(false);
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const getUserName = (userId: number) => {
    const user = travelCtx.state.users.find((u: any) => u.userId === userId);
    return user ? user.userName : 'Unknown';
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleDelete = () => {
    setConfirmDialog(false);
    deleteExpense(true, expense.expenseId)
      .then((response) => {
        setPayload({
          type: 'success',
          message: 'Expense deleted successfully',
        });
        travelCtx.state.refreshData();
      })
      .catch((error) => {
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
        maxWidth: '100%',
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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          marginBottom="8px"
        >
          <Typography
            variant="body1"
            sx={{
              fontWeight: 'bold',
              color: '#333',
              flexGrow: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {expenseDesc}
          </Typography>

          <Box sx={{ display: 'flex', gap: '8px' }}>
            <IconButton aria-label="edit" onClick={handleEdit} size="small">
              <EditIcon fontSize="small" sx={{ color: '#1976d2' }} />
            </IconButton>
            <IconButton
              aria-label="delete"
              onClick={() => setConfirmDialog(true)}
              size="small"
            >
              <DeleteIcon fontSize="small" sx={{ color: '#d32f2f' }} />
            </IconButton>
          </Box>
        </Box>
        <ConfirmationDialog
          open={confirmDialog}
          message="Are you sure you want to delete this item?"
          onSubmit={handleDelete}
          onCancel={() => setConfirmDialog(false)}
        />

        <Typography
          variant="subtitle2"
          sx={{ color: '#1976d2', textAlign: 'right', marginBottom: '8px' }}
        >
          {formattedDate}
        </Typography>

        <Divider sx={{ marginBottom: '8px', backgroundColor: '#ddd' }} />

        <Box display="flex" justifyContent="space-between" marginBottom="8px">
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', color: '#1976d2' }}
          >
            ₹ {amount.toFixed(2)}
          </Typography>
          <Typography variant="body2" sx={{ color: '#333' }}>
            <strong>Paid By:</strong> {getUserName(paidBy)}
          </Typography>
        </Box>

        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          sx={{ color: '#333' }}
        >
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            <strong>Split Between:</strong>
          </Typography>
          <Box display="flex" flexDirection="column" alignItems="flex-end">
            {Object.keys(splitBetween).map((userId: string) => (
              <Typography
                key={userId}
                variant="body2"
                sx={{
                  color: splitBetween[userId] >= 0 ? '#388e3c' : '#d32f2f',
                  fontWeight: '500',
                }}
              >
                {getUserName(parseInt(userId))}: ₹{' '}
                {parseInt(userId) === paidBy
                  ? (amount - splitBetween[userId]).toFixed(2)
                  : splitBetween[userId].toFixed(2)}
              </Typography>
            ))}
          </Box>
        </Box>
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

export default ExpenseContainer;
