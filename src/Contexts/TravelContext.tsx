import React, { createContext, useReducer, useContext, ReactNode } from 'react';

export interface TripResponse {
  tripIdShared: string;
  tripTitle: string;
  currencies: string[];
}

interface UserResponse {
  tripId: string;
  userId: number;
  userName: string;
  email: string;
  deletable: boolean;
}

interface TripRequest {
  userId: number;
  email: string;
  userName: string;
}
interface TravelContextType {
  trip: TripResponse[] | undefined;
  expenses: any;
  users: UserResponse[];
  balances: any;
  indiBalance: any;
  tripRequests: undefined | TripRequest[];
  chosenTrip: TripResponse | undefined;
  summary: CurrentTripInterface | undefined;
  refreshData: any;
  expenseDialogOpen: boolean;
}

interface CurrentTripInterface {
  userCount: number | undefined;
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
  refreshData: () => {
    console.log('No refresher registered');
  },
  expenseDialogOpen: false
};

type Action =
  | { type: 'SET_TRIP'; payload: any }
  | { type: 'SET_EXPENSES'; payload: any[] }
  | { type: 'SET_USERS'; payload: any[] }
  | { type: 'SET_BALANCES'; payload: any[] }
  | { type: 'SET_INDIVIDUAL_BALANCES'; payload: any }
  | { type: 'SET_TRIP_REQ'; payload: any[] }
  | { type: 'SET_REFRESHER'; payload: any }
  | { type: 'SET_CHOSEN_TRIP'; payload: TripResponse | undefined }
  | { type: 'SET_EXPENSE_DIALOG_STATE'; payload: boolean }
  | { type: 'SET_SUMMARY'; payload: CurrentTripInterface };

const reducer = (
  state: TravelContextType,
  action: Action
): TravelContextType => {
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
