import React, { createContext, useEffect, useReducer } from 'react';
import axios from 'axios';
export interface Currency {
  currency: string;
  value: number;
}

export interface CurrencyResponse {
  [key: string]: number;
}

interface CurrencyState {
  currencies: any;
  loading: boolean;
  error: string | null;
}
type Action =
  | { type: 'FETCH_CURRENCIES_REQUEST' }
  | { type: 'FETCH_CURRENCIES_SUCCESS'; payload: CurrencyResponse }
  | { type: 'FETCH_CURRENCIES_FAILURE'; payload: string };

export const CurrencyContext = createContext<{
  state: CurrencyState;
  dispatch: React.Dispatch<Action>;
}>({
  state: { currencies: null, loading: false, error: null },
  dispatch: () => null,
});

const currencyReducer = (
  state: CurrencyState,
  action: Action
): CurrencyState => {
  switch (action.type) {
    case 'FETCH_CURRENCIES_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_CURRENCIES_SUCCESS':
      return { ...state, loading: false, currencies: action.payload };
    case 'FETCH_CURRENCIES_FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(currencyReducer, {
    currencies: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const fetchCurrencies = async () => {
      dispatch({ type: 'FETCH_CURRENCIES_REQUEST' });
      try {
        const response = await axios.get<CurrencyResponse>(
          'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/inr.json'
        );
        dispatch({ type: 'FETCH_CURRENCIES_SUCCESS', payload: response.data });
      } catch (error: any) {
        dispatch({ type: 'FETCH_CURRENCIES_FAILURE', payload: error.message });
      }
    };

    fetchCurrencies();
  }, []);

  return (
    <CurrencyContext.Provider value={{ state, dispatch }}>
      {children}
    </CurrencyContext.Provider>
  );
};
