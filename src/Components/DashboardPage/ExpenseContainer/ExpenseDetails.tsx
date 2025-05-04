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
      <Box display="flex" justifyContent="space-between" marginBottom="8px">
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          ₹ {formatNumber(amount)}
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
          <SplitDetails
            splitBetween={splitBetween}
            amount={amount}
            getUserName={getUserName}
          />
        </Box>
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
    <>
      {Object.keys(splitBetween).map((userId: string) => (
        <Typography
          key={userId}
          variant="body2"
          sx={{
            color: '#d32f2f',
            fontWeight: '500',
          }}
        >
          {getUserName(parseInt(userId))}: ₹{''}
          {splitBetween[userId] >= 0
            ? formatNumber(-1 * (amount - splitBetween[userId]))
            : formatNumber(splitBetween[userId])}
        </Typography>
      ))}
    </>
  );
};

export default ExpenseDetails;
