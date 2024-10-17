import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, Avatar, useTheme } from '@mui/material';
import { useTravel } from '../Contexts/TravelContext';
import FunctionsIcon from '@mui/icons-material/Functions';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import './BalanceContainer.scss';

const BalanceContainer = () => {
  const travelCtx = useTravel();
  const theme = useTheme();
  const userBalances = travelCtx.state.balances;
  const [totalExpenditure, setTotalExpenditure] = useState(0);
  useEffect(() => {
    let totalExpenditureLoc = 0;
    travelCtx.state.expenses.forEach((item: any) => {
      totalExpenditureLoc += item.amount;
    });
    setTotalExpenditure(totalExpenditureLoc);
  }, [travelCtx]);
  const getUserName = (userId: number) => {
    const user = travelCtx.state.users.find((u: any) => u.userId === userId);
    return user ? user.userName : 'Unknown';
  };

  return (
    <Box
      id="balanceBox"
      flexGrow={1}
      width="100%"
      padding="16px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        height: '100%',
        overflow: 'auto',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: 'transparent',
      }}
    >
      <Card
        sx={{
          width: '80%',
          maxWidth: 400,
          padding: '16px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          [theme.breakpoints.down('sm')]: {
            padding: '12px',
          },
        }}
      >
        <Box display="flex" alignItems="center">
          <Avatar
            sx={{
              marginRight: '12px',
              backgroundColor: 'orange',
            }}
          >
            <FunctionsIcon />
          </Avatar>
          <Typography
            sx={{
              fontWeight: 'bold',
              color: '#333',
            }}
          >
            {'Total'}
          </Typography>
        </Box>
        <Typography
          sx={{
            fontWeight: 'bold',
            color: totalExpenditure >= 0 ? '#4caf50' : '#f44336',
          }}
        >
          ₹ {totalExpenditure.toFixed(2)}
        </Typography>
      </Card>
      {Object.keys(userBalances).length > 0 ? (
        Object.entries(userBalances).map(
          ([userId, balance]: [userId: any, balance: any]) => (
            <Card
              key={userId}
              sx={{
                width: '80%',
                maxWidth: 400,
                padding: '16px',
                margin: '8px 0',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                [theme.breakpoints.down('sm')]: {
                  padding: '12px',
                },
              }}
            >
              {/* User Avatar and Name */}
              <Box display="flex" alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: balance >= 0 ? '#4caf50' : '#f44336',
                    marginRight: '12px',
                  }}
                >
                  <AccountBalanceIcon />
                </Avatar>
                <Typography sx={{ fontWeight: 'bold', color: '#333' }}>
                  {getUserName(Number(userId))}
                </Typography>
              </Box>

              {/* Balance */}
              <Typography
                sx={{
                  fontWeight: 'bold',
                  color: balance >= 0 ? '#4caf50' : '#f44336',
                }}
              >
                ₹ {balance.toFixed(2)}
              </Typography>
            </Card>
          )
        )
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
            },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'rgba(0, 0, 0, 0.7)',
              textShadow: '1px 1px 5px rgba(0, 0, 0, 0.2)',
            }}
          >
            No balances to show!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default BalanceContainer;
