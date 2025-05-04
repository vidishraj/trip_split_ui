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
  IconButton, Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { useTravel } from '../../../Contexts/TravelContext';
import { formatNumber } from '../../../Contexts/CurrencyContext';

interface SelfExpenseDialogProps {
  open: boolean;
  onClose: () => void;
}
interface UserExpenses{
  selfExpense:number;
  netExpense:number;
  userId:number;
}
const SelfExpenseDialog: React.FC<SelfExpenseDialogProps> = ({
  open,
  onClose,
}) => {
  const {indiBalance, users} = useTravel().state;

  const getUserName = (userId: number) => {
    const user = users.find((u) => u.userId === userId);
    return user ? user.userName : 'Unknown';
  };

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
          Expenses
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* List */}
      <DialogContent dividers>
        <List>
          {indiBalance && Object.keys(indiBalance['expense']).map((userId:string, index) => {
              return(
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
                      {getUserName(Number(userId))}
                    </Typography>
                  }
                  secondary={
                    <Typography display="flex" alignItems="center" gap="5px" color="green">
                      <Box display="flex" alignItems={"center"}>
                        <CurrencyRupeeIcon fontSize="small" sx={{ mr: 0 }} />
                        {formatNumber(indiBalance['expense'][userId])}
                      </Box>
                      <Box display="flex" alignItems={"center"}>
                        (<CurrencyRupeeIcon fontSize="small" sx={{ mr: 0 }} />
                        {formatNumber(indiBalance['selfExpense'][userId])})

                      </Box>
                    </Typography>
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
