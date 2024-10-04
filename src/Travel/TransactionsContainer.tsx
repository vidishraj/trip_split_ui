import React from 'react';
import { Box, Typography, Card, Avatar, useTheme } from '@mui/material';
import { useTravel } from '../Contexts/TravelContext';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import './BalanceContainer.scss';

const BalanceContainer = () => {
  const travelCtx = useTravel();
  const theme = useTheme();
  const userBalances = travelCtx.state.balances;

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
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 'bold', color: '#333' }}
                >
                  {getUserName(Number(userId))}
                </Typography>
              </Box>

              {/* Balance */}
              <Typography
                variant="h6"
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
        <Typography variant="body1" color="textSecondary">
          No balances to show.
        </Typography>
      )}
    </Box>
  );
};

export default BalanceContainer;
