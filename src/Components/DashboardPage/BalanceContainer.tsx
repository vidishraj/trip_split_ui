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


  return (
    <Box
      id="innerBox"
      flexGrow={1}
      width="100%"
      borderRadius="12px"
      display="flex"
      flexDirection="column"
      sx={{
        height: '100%',
        backgroundColor: 'transparent',
        position: 'relative',
      }}
    >
      {/* Total Card - Fixed */}
      <Box display="flex" justifyContent="center" sx={{ mb: 2, px: 2 }}>
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
            sx={{
              borderRadius: '8px',
              padding: { xs: '8px 16px', sm: '10px 20px' },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: '600',
              minHeight: '44px',
            }}
          >
            Individual Expenses
          </Button>
        </Card>
      </Box>

      {/* Scrollable Balance Transactions Container */}
      <Box
        flexGrow={1}
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {userBalances && userBalances.length > 0 ? (
          <div
            style={{ height: '100%', width: '100%', overflow: 'auto' }}
          >
            <Box sx={{ 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              px: 2,
              pb: 4,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(0,0,0,0.3)',
              },
              // Firefox scrollbar
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0,0,0,0.2) transparent',
            }}>
            {userBalances.map((balance: any, index: number) => {
          const senderName = getUserName(balance.from);
          const receiverName = getUserName(balance.to);

          return (
            <Box
              key={`${balance.from}-${balance.to}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#fff',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                borderRadius: 3,
                padding: { xs: '12px', sm: '16px' },
                minWidth: '320px',
                width: '90%',
                maxWidth: '550px',
                margin: index === 0 ? '0 auto 8px auto' : '8px auto',
                transition: 'box-shadow 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                },
                [theme.breakpoints.down('sm')]: {
                  width: '95%',
                  padding: '12px',
                },
              }}
            >
              {/* Sender */}
              <Box sx={{ 
                display:'flex', 
                flexDirection:'column', 
                alignItems:'center',
                textAlign: 'center', 
                width: { xs: '80px', sm: '90px' },
                flexShrink: 0,
              }}>
                <Avatar
                  sx={{
                    bgcolor: '#f44336',
                    width: { xs: '50px', sm: '56px' },
                    height: { xs: '50px', sm: '56px' },
                    fontSize: { xs: '20px', sm: '24px' },
                    mb: 1,
                  }}
                >
                  {senderName[0] || <AccountCircle />}
                </Avatar>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: '#f44336',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    lineHeight: 1.2,
                    wordBreak: 'break-word',
                  }}
                >
                  {senderName}
                </Typography>
              </Box>

              {/* Arrow with Amount */}
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: '140px', sm: '160px' },
                flexShrink: 0,
                px: 1,
              }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: '#4caf50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    mb: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <CurrencyRupee sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, mr: 0.5 }} />
                  {formatNumber(balance.amount)}
                </Typography>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                }}>
                  <Box sx={{ 
                    width: { xs: '30px', sm: '40px' }, 
                    height: '2px', 
                    backgroundColor: '#666',
                    opacity: 0.6,
                  }} />
                  <ArrowForward sx={{ 
                    fontSize: { xs: '20px', sm: '24px' }, 
                    color: '#666',
                    opacity: 0.8,
                    mx: 1,
                  }} />
                  <Box sx={{ 
                    width: { xs: '30px', sm: '40px' }, 
                    height: '2px', 
                    backgroundColor: '#666',
                    opacity: 0.6,
                  }} />
                </Box>
              </Box>

              {/* Receiver */}
              <Box sx={{ 
                display:'flex', 
                flexDirection:'column', 
                alignItems:'center', 
                textAlign: 'center', 
                width: { xs: '80px', sm: '90px' },
                flexShrink: 0,
              }}>
                <Avatar
                  sx={{
                    bgcolor: '#4caf50',
                    width: { xs: '50px', sm: '56px' },
                    height: { xs: '50px', sm: '56px' },
                    fontSize: { xs: '20px', sm: '24px' },
                    mb: 1,
                  }}
                >
                  {receiverName[0] || <AccountCircle />}
                </Avatar>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: '#4caf50',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    lineHeight: 1.2,
                    wordBreak: 'break-word',
                  }}
                >
                  {receiverName}
                </Typography>
              </Box>
            </Box>
          );
        })}
            </Box>
          </div>
        ) : (
          <Typography sx={{ textAlign: 'center', mt: 2, color: '#666' }}>
            No balance transactions to show
          </Typography>
        )}
      </Box>
      
      <SelfExpenseDialog
        open={selfExpenseDialog}
        onClose={() => setSelfExpenseDialog(false)}
      />
    </Box>
  );
};

export default BalanceContainer;
