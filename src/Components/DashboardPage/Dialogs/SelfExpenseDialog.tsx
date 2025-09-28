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
  Box,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { useTravel } from '../../../Contexts/TravelContext';
import { formatNumber } from '../../../Contexts/CurrencyContext';
import { fetchIndividualSpending } from '../../../Api/Api';

interface SelfExpenseDialogProps {
  open: boolean;
  onClose: () => void;
}
const SelfExpenseDialog: React.FC<SelfExpenseDialogProps> = ({
  open,
  onClose,
}) => {
  const {indiBalance, users, chosenTrip} = useTravel().state;
  const [individualSpending, setIndividualSpending] = useState<any>(null);
  const [loadingSpending, setLoadingSpending] = useState(false);

  const getUserName = (userId: number) => {
    const user = users.find((u) => u.userId === userId);
    return user ? user.userName : 'Unknown';
  };

  useEffect(() => {
    if (open && chosenTrip?.tripIdShared) {
      setLoadingSpending(true);
      fetchIndividualSpending(chosenTrip.tripIdShared)
        .then((response) => {
          setIndividualSpending(response.data);
        })
        .catch((error) => {
          console.error('Failed to fetch individual spending:', error);
        })
        .finally(() => {
          setLoadingSpending(false);
        });
    }
  }, [open, chosenTrip?.tripIdShared]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={{
        '& .MuiPaper-root': {
          borderRadius: '12px',
          padding: '8px',
          boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.2)',
          margin: '16px',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        component="div"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px 8px 16px',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Individual Expenses
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers>
        {/* Individual Spending Section */}
        {individualSpending && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
              Actual Money Spent
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', fontStyle: 'italic' }}>
              Total money each person paid during the trip
            </Typography>
            <List>
              {individualSpending.Message?.individualSpending && Object.entries(individualSpending.Message.individualSpending).map(([userId, amount]) => (
                <ListItem
                  key={userId}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5, px: 0 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#4caf50' }}>
                      <AccountCircleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography fontWeight="bold" fontSize="1rem">
                        {getUserName(Number(userId))}
                      </Typography>
                    }
                    secondary={
                      <span style={{ display: 'flex', alignItems: 'center', color: '#4caf50', fontWeight: 'bold' }}>
                        <CurrencyRupeeIcon fontSize="small" sx={{ mr: 0 }} />
                        {formatNumber(Number(amount))}
                      </span>
                    }
                  />
                </ListItem>
              ))}
              <Divider sx={{ my: 1.5 }} />
              <ListItem sx={{ bgcolor: '#f5f5f5', borderRadius: '8px', py: 1, px: 1.5 }}>
                <ListItemText
                  primary={
                    <Typography fontWeight="bold" fontSize="1.1rem">
                      Total Trip Cost
                    </Typography>
                  }
                  secondary={
                    <span style={{ display: 'flex', alignItems: 'center', color: '#1976d2', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      <CurrencyRupeeIcon fontSize="small" sx={{ mr: 0 }} />
                      {individualSpending.Message?.totalTripCost ? formatNumber(individualSpending.Message.totalTripCost) : '0'}
                    </span>
                  }
                />
              </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
          </Box>
        )}
        
        {loadingSpending && (
          <Box sx={{ textAlign: 'center', py: 1.5 }}>
            <Typography>Loading spending data...</Typography>
          </Box>
        )}

        {/* Existing Balance Section */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
          Balance Details
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', fontStyle: 'italic' }}>
          Net balance (what you owe/are owed) and personal expenses (in brackets)
        </Typography>
        <List>
          {indiBalance && indiBalance['expense'] && Object.keys(indiBalance['expense']).map((userId:string, index) => {
              return(
              <ListItem
                key={index}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5, px: 0 }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#1976d2' }}>
                    <AccountCircleIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography fontWeight="bold" fontSize="1rem">
                      {getUserName(Number(userId))}
                    </Typography>
                  }
                  secondary={
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'green' }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <CurrencyRupeeIcon fontSize="small" sx={{ mr: 0 }} />
                        {formatNumber(indiBalance['expense'][userId])}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        (<CurrencyRupeeIcon fontSize="small" sx={{ mr: 0 }} />
                        {formatNumber(indiBalance['selfExpense'] &&
                        indiBalance['selfExpense'][userId]?indiBalance['selfExpense'][userId]:0)})
                      </span>
                    </span>
                  }
                />
              </ListItem>)

          })}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default SelfExpenseDialog;
