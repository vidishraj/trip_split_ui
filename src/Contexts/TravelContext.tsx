import React, { createContext, useReducer, useContext, ReactNode } from 'react';

export interface TripResponse {
  tripIdShared: string;
  tripTitle: string;
  currencies: string[];
}

export interface UserResponse {
  tripId: string;
  userId: number;
  userName: string;
  email: string;
  deletable: boolean;
}

export interface TripRequest {
  userId: number;
  email: string;
  userName: string;
}

/** Single expense row as the backend serves it back from
 *  /fetchExpensesForTrip — the split is flattened into a map of
 *  userId -> share-as-stored. */
export interface ExpenseResponse {
  expenseId: number;
  date: string;
  expenseDesc: string;
  amount: number;
  paidBy: number;
  selfExpense: boolean;
  tripId: string;
  splitBetween: Record<string, number>;
}

/** One leg of the simplified settlement plan from /fetchBalances. */
export interface BalanceTransaction {
  from: number;
  to: number;
  amount: number;
}

/** The shape of /fetchIndividualBalance: per-user net + per-user self-expense
 *  totals + the overall trip total. */
export interface IndividualBalance {
  expense?: Record<string, number>;
  selfExpense?: Record<string, number>;
  total?: number;
}

interface CurrentTripInterface {
  userCount: number | undefined;
}

interface TravelContextType {
  trip: TripResponse[] | undefined;
  expenses: ExpenseResponse[];
  users: UserResponse[];
  balances: BalanceTransaction[];
  indiBalance: IndividualBalance;
  tripRequests: undefined | TripRequest[];
  chosenTrip: TripResponse | undefined;
  summary: CurrentTripInterface | undefined;
  refreshData: () => void;
  expenseDialogOpen: boolean;
  selectedExpense: ExpenseResponse | null;
}

const initialState: TravelContextType = {
  trip: undefined,
  expenses: [],
  users: [],
  balances: [],
  indiBalance: {},
  tripRequests: undefined,
  chosenTrip: undefined,
  summary: { userCount: undefined },
  refreshData: () => {},
  expenseDialogOpen: false,
  selectedExpense: null,
};

type Action =
  | { type: 'SET_TRIP'; payload: TripResponse[] }
  | { type: 'SET_EXPENSES'; payload: ExpenseResponse[] }
  | { type: 'SET_USERS'; payload: UserResponse[] }
  | { type: 'SET_BALANCES'; payload: BalanceTransaction[] }
  | { type: 'SET_INDIVIDUAL_BALANCES'; payload: IndividualBalance }
  | { type: 'SET_TRIP_REQ'; payload: TripRequest[] }
  | { type: 'SET_REFRESHER'; payload: () => void }
  | { type: 'SET_CHOSEN_TRIP'; payload: TripResponse | undefined }
  | { type: 'SET_EXPENSE_DIALOG_STATE'; payload: boolean }
  | { type: 'SET_SUMMARY'; payload: CurrentTripInterface }
  | { type: 'SET_SELECTED_EXPENSE'; payload: ExpenseResponse | null };

const reducer = (state: TravelContextType, action: Action): TravelContextType => {
  switch (action.type) {
    case 'SET_TRIP':
      return { ...state, trip: action.payload };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_BALANCES':
      return { ...state, balances: action.payload };
    case 'SET_INDIVIDUAL_BALANCES':
      return { ...state, indiBalance: action.payload };
    case 'SET_TRIP_REQ':
      return { ...state, tripRequests: action.payload };
    case 'SET_REFRESHER':
      return { ...state, refreshData: action.payload };
    case 'SET_CHOSEN_TRIP':
      return { ...state, chosenTrip: action.payload };
    case 'SET_SUMMARY':
      return { ...state, summary: action.payload };
    case 'SET_EXPENSE_DIALOG_STATE':
      return { ...state, expenseDialogOpen: action.payload };
    case 'SET_SELECTED_EXPENSE':
      return { ...state, selectedExpense: action.payload };
    default:
      return state;
  }
};

const TravelContext = createContext<{
  state: TravelContextType;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => undefined,
});

export const TravelProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <TravelContext.Provider value={{ state, dispatch }}>
      {children}
    </TravelContext.Provider>
  );
};

export const useTravel = () => {
  const context = useContext(TravelContext);
  if (!context) {
    throw new Error('useTravel must be used within a TravelProvider');
  }
  return context;
};
