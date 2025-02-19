// ExpenseComponents/types.ts
export interface Expense {
  expenseId: string;
  tripId: string;
  date: string;
  expenseDesc: string;
  amount: number;
  paidBy: number;
  splitBetween: {
    [userId: string]: number;
  };
}

export interface User {
  userId: number;
  userName: string;
}

export interface TravelContextState {
  expenses: Expense[];
  users: User[];
  refreshData: () => void;
  chosenTrip?: {
    tripIdShared: string;
  };
}
