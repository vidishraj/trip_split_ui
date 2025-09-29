// ExpenseComponents/ExpenseDetails.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTravel } from '../../../Contexts/TravelContext';
import { formatNumber } from '../../../Contexts/CurrencyContext';

interface ExpenseDetailsProps {
  amount: number;
  paidBy: number;
  splitBetween: {
    [key: string]: number;
  };
}

const ExpenseDetails: React.FC<ExpenseDetailsProps> = ({
  amount,
  paidBy,
  splitBetween,
}) => {
  const travelCtx = useTravel();

  const getUserName = (userId: number) => {
    const user = travelCtx.state.users.find((u: any) => u.userId === userId);
    return user ? user.userName : 'Unknown';
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" marginBottom="8px" alignItems="center">
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: '700', 
            color: '#1976d2',
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          ₹ {formatNumber(amount)}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#555',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          <strong>Paid By:</strong> {getUserName(paidBy)}
        </Typography>
      </Box>

      <Box sx={{ mt: 0.5 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: '600',
            fontSize: '0.875rem',
            color: '#555',
            mb: 0.75,
          }}
        >
          Split Between:
        </Typography>
        <SplitDetails
          splitBetween={splitBetween}
          amount={amount}
          getUserName={getUserName}
        />
      </Box>
    </>
  );
};

interface SplitDetailsProps {
  splitBetween: {
    [key: string]: number;
  };
  amount: number;
  getUserName: (userId: number) => string;
}

const SplitDetails: React.FC<SplitDetailsProps> = ({
  splitBetween,
  amount,
  getUserName,
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: 1,
      alignItems: 'center',
    }}>
      {Object.keys(splitBetween).map((userId: string, index) => {
        const calculatedAmount = splitBetween[userId] >= 0
          ? -1 * (amount - splitBetween[userId])
          : splitBetween[userId];
        
        return (
          <Box
            key={userId}
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#fff3e0',
              borderRadius: '16px',
              padding: '4px 12px',
              border: '1px solid #ffcc02',
              flexShrink: 0,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#e65100',
                fontWeight: '600',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
              }}
            >
              {getUserName(parseInt(userId))}: ₹{formatNumber(calculatedAmount)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default ExpenseDetails;
