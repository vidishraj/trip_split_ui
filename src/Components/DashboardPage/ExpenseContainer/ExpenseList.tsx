// ExpenseList.tsx
import React from 'react';
import ExpenseItem from './ExpenseItem';

interface ExpenseListProps {
  expenses: any[];
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses }) => (
  <div>
    {expenses.map((expense: any) => (
      <ExpenseItem key={expense.expenseId} expense={expense} />
    ))}
  </div>
);

export default ExpenseList;
