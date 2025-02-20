// ExpenseComponents/ExpenseList.tsx
import React from 'react';
import { Box } from '@mui/material';
import ExpenseItem from './ExpenseItem';

interface ExpenseListProps {
  expenses: any[];
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses }) => {
  return (
    <>
      {expenses.map((expense: any, index: number) => (
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
    </>
  );
};

export default ExpenseList;
