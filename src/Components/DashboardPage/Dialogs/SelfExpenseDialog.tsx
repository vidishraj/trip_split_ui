import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { useTravel } from '../../../Contexts/TravelContext';

interface SelfExpenseDialogProps {
  open: boolean;
  onClose: () => void;
}

const SelfExpenseDialog: React.FC<SelfExpenseDialogProps> = ({
  open,
  onClose,
}) => {
  const [data, setData] = useState<{ [key: string]: number }>({}); // Fix: Properly typed state
  const travelCtx = useTravel();

  const getUserName = (userId: number) => {
    const user = travelCtx.state.users.find((u) => u.userId === userId);
    return user ? user.userName : 'Unknown';
  };

  useEffect(() => {
    if (travelCtx.state.expenses && Array.isArray(travelCtx.state.expenses)) {
      const dataObj: { [key: string]: number } = {}; // Fix: Typed object

      travelCtx.state.expenses.forEach((item) => {
        const userName = getUserName(item.paidBy);
        if (item['selfExpense']) {
          if (Object.prototype.hasOwnProperty.call(dataObj, userName)) {
            dataObj[userName] += parseInt(item.amount);
          } else {
            dataObj[userName] = parseInt(item.amount);
          }
        }
      });

      setData(dataObj);
    }
  }, [travelCtx.state.expenses]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={{
        '& .MuiPaper-root': {
          borderRadius: '12px',
          padding: '12px',
          boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Self Expenses
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* List */}
      <DialogContent dividers>
        <List>
          {Object.entries(data).map(([user, amount], index) => (
            <ListItem
              key={index}
              sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: '#1976d2' }}>
                  <AccountCircleIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography fontWeight="bold" fontSize="1rem">
                    {user}
                  </Typography>
                }
                secondary={
                  <Typography display="flex" alignItems="center" color="green">
                    <CurrencyRupeeIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {amount.toFixed(2)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default SelfExpenseDialog;
