import './BalanceContainer.scss';
import React, { useState } from 'react';
import { Avatar, Box, Typography, useTheme, Card, Button } from '@mui/material';
import {
  ArrowForward,
  CurrencyRupee,
  AccountCircle,
} from '@mui/icons-material';
import { useTravel } from '../../Contexts/TravelContext';
import FunctionsIcon from '@mui/icons-material/Functions';
import SelfExpenseDialog from './Dialogs/SelfExpenseDialog';
import { formatNumber } from '../../Contexts/CurrencyContext';

const BalanceContainer = () => {
  const travelCtx = useTravel();
  const theme = useTheme();
  const userBalances = travelCtx.state.balances;
  const [selfExpenseDialog, setSelfExpenseDialog] = useState(false);


  const getUserName = (userId: number) => {
    const user = travelCtx.state.users.find((u) => u.userId === userId);
    return user ? user.userName : 'Unknown';
  };

  if (!userBalances || userBalances.length === 0) {
    return (
      <Typography sx={{ textAlign: 'center', mt: 2 }}>
        No Balance to show!
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: 'center',
        justifyContent: 'space-evenly',
        mt: 3,
        height: '100%',
      }}
    >
      {/* Total Card */}
      <Card
        sx={{
          width: '90%',
          maxWidth: 420,
          padding: '16px',
          boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.15)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backdropFilter: 'blur(10px)',
          gap:'8px',
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          [theme.breakpoints.down('sm')]: {
            padding: '12px',
            width: '95%',
          },
        }}
      >
        <Box display="flex" alignItems="center"
             justifyContent='space-between' width="100%">
          <Box display="flex" alignItems="center">
          <Avatar
            sx={{
              marginRight: '12px',
              backgroundColor: '#ff9800',
            }}
          >
            <FunctionsIcon />
          </Avatar>
          <Typography
            sx={{ fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}
          >
            Total
          </Typography>
          </Box>
        <Typography
          sx={{
            fontWeight: 'bold',
            color: travelCtx.state.indiBalance['total'] && travelCtx.state.indiBalance['total'] >= 0 ? '#4caf50' : '#f44336',
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.2rem',
          }}
        >
          <CurrencyRupee sx={{ fontSize: '1rem', mr: 0.5 }} />
          {formatNumber(travelCtx.state.indiBalance['total'])}
        </Typography>
        </Box>

        <Button
          onClick={() => {
            setSelfExpenseDialog(true);
          }}
          startIcon={<FunctionsIcon />}
          color="primary"
          variant="contained"
        >
          {' '}
          Individual Expenses
        </Button>
      </Card>
      <Box>
        {/* Individual Transactions */}
        {userBalances.map((balance: any) => {
          const senderName = getUserName(balance.from);
          const receiverName = getUserName(balance.to);

          return (
            <Box
              key={`${balance.from}-${balance.to}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                backgroundColor: '#fff',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                borderRadius: 3,
                padding: 2,
                minWidth: '320px',
                width: '90%',
                maxWidth: '600px',
                margin: 'auto',
                [theme.breakpoints.down('sm')]: {
                  width: '95%',
                  padding: '14px',
                },
              }}
            >
              {/* Sender */}
              <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center',textAlign: 'center', minWidth: 80 }}>
                <Avatar
                  sx={{
                    bgcolor: '#f44336',
                    width: 56,
                    height: 56,
                    fontSize: 24,
                  }}
                >
                  {senderName[0] || <AccountCircle />}
                </Avatar>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mt: 1,
                    color: '#f44336',
                    fontSize: '0.9rem',
                  }}
                >
                  {senderName}
                </Typography>
              </Box>

              {/* Arrow with Amount */}
              <Box sx={{ textAlign: 'center', flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: '#4caf50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                  }}
                >
                  <CurrencyRupee sx={{ fontSize: '1rem', mr: 0.5 }} />
                  {formatNumber(balance.amount)}
                </Typography>
                <ArrowForward sx={{ fontSize: 32, color: '#333' }} />
              </Box>

              {/* Receiver */}
              <Box sx={{display:'flex', flexDirection:'column', alignItems:'center', textAlign: 'center', minWidth: 80 }}>
                <Avatar
                  sx={{
                    bgcolor: '#4caf50',
                    width: 56,
                    height: 56,
                    fontSize: 24,
                  }}
                >
                  {receiverName[0] || <AccountCircle />}
                </Avatar>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mt: 1,
                    color: '#4caf50',
                    fontSize: '0.9rem',
                  }}
                >
                  {receiverName}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
      <SelfExpenseDialog
        open={selfExpenseDialog}
        onClose={() => setSelfExpenseDialog(false)}
      />
    </Box>
  );
};

export default BalanceContainer;
