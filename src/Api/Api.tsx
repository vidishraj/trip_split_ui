import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { useLoading } from '../Contexts/LoadingContext';
import { auth } from './FirebaseConfig';

const instance = Axios.create({ baseURL: process.env.REACT_APP_BACKENDURL });
const axios = setupCache(instance);

// Count in-flight requests so the global loader only clears when truly idle.
let inFlight = 0;

export const useAxiosSetup = () => {
  const { setLoading } = useLoading();

  axios.interceptors.request.use(
    async (config) => {
      inFlight += 1;
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.setAuthorization(`Bearer ${token}`);
      }
      return config;
    },
    (error) => {
      inFlight = Math.max(0, inFlight - 1);
      if (inFlight === 0) setLoading(false);
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      inFlight = Math.max(0, inFlight - 1);
      if (inFlight === 0) setLoading(false);
      return response;
    },
    (error) => {
      inFlight = Math.max(0, inFlight - 1);
      if (inFlight === 0) setLoading(false);
      return Promise.reject(error);
    }
  );
};

// Cache key constants — single source of truth so invalidations stay in sync.
const CACHE_KEYS = {
  trips: 'fetch-trip',
  users: 'summary',
  expenses: 'expense',
  balances: 'balances',
  indiBalances: 'IndiBalances',
  notes: 'fetch-notes',
} as const;

const invalidate = (...keys: string[]) => {
  keys.forEach((k) => axios.storage.remove(k));
};

export async function fetchTrips(userCalled: boolean): Promise<any> {
  if (userCalled) invalidate(CACHE_KEYS.trips);
  return axios.get('/fetchTrips', { id: CACHE_KEYS.trips, cache: {} });
}

export async function deleteTrip(_userCalled: boolean, tripId: string): Promise<any> {
  invalidate(CACHE_KEYS.trips);
  return axios.get('/deleteTrip', { params: { tripId } });
}

export async function insertTrip(body: any): Promise<any> {
  invalidate(CACHE_KEYS.trips);
  return axios.post('/createTrip', body);
}

export async function fetchUsersForATrip(userCalled: boolean, tripId: string): Promise<any> {
  if (userCalled) invalidate(CACHE_KEYS.users);
  return axios.get('/fetchUsersForTrip', {
    params: { trip: tripId },
    id: CACHE_KEYS.users,
    cache: {},
  });
}

export async function insertUser(body: any): Promise<any> {
  invalidate(CACHE_KEYS.users);
  return axios.post('/createUser', body);
}

export async function insertExpense(body: any): Promise<any> {
  invalidate(CACHE_KEYS.users, CACHE_KEYS.expenses, CACHE_KEYS.balances, CACHE_KEYS.indiBalances);
  return axios.post('/addExpense', body);
}

export async function updateExpense(expenseId: string, body: any): Promise<any> {
  invalidate(CACHE_KEYS.users, CACHE_KEYS.expenses, CACHE_KEYS.balances, CACHE_KEYS.indiBalances);
  return axios.post('/editExpense', { expenseId, body });
}

export async function updateTripTitle(title: string, tripId: string): Promise<any> {
  invalidate(CACHE_KEYS.trips);
  return axios.post('/editTripTitle', { title, tripId });
}

export async function fetchExpenseForTrip(userCalled: boolean, tripId: string): Promise<any> {
  if (userCalled) invalidate(CACHE_KEYS.expenses, CACHE_KEYS.balances);
  return axios.get('/fetchExpensesForTrip', {
    params: { trip: tripId },
    id: CACHE_KEYS.expenses,
    cache: {},
  });
}

export async function fetchBalances(userCalled: boolean, tripId: string): Promise<any> {
  if (userCalled) invalidate(CACHE_KEYS.expenses, CACHE_KEYS.balances);
  return axios.get('/fetchBalances', {
    params: { trip: tripId },
    id: CACHE_KEYS.balances,
    cache: {},
  });
}

export async function fetchIndividualBalance(userCalled: boolean, tripId: string): Promise<any> {
  if (userCalled) invalidate(CACHE_KEYS.expenses, CACHE_KEYS.balances, CACHE_KEYS.indiBalances);
  return axios.get('/fetchIndividualBalance', {
    params: { trip: tripId },
    id: CACHE_KEYS.indiBalances,
    cache: {},
  });
}

export async function deleteExpense(_userCalled: boolean, expenseId: number, tripId: string): Promise<any> {
  invalidate(CACHE_KEYS.users, CACHE_KEYS.expenses, CACHE_KEYS.balances, CACHE_KEYS.indiBalances);
  return axios.get('/deleteExpenses', { params: { expenseId, tripId } });
}

export async function deleteUser(userId: string, tripId: string): Promise<any> {
  invalidate(CACHE_KEYS.users, CACHE_KEYS.expenses);
  return axios.get('/deleteUser', { params: { userId, tripId } });
}

export async function sendTripRequest(tripId: string): Promise<any> {
  return axios.post('/sendTripUserRequest', { tripId });
}

export async function fetchTripRequestsForTrip(tripId: string): Promise<any> {
  return axios.get('/fetchTripRequestForTrip', { params: { trip: tripId } });
}

export async function sendResponseForTripRequest(body: any): Promise<any> {
  return axios.post('/registerResponseForTripRequest', body);
}

export async function fetchNotes(tripId: string, page: number): Promise<any> {
  invalidate(CACHE_KEYS.notes);
  return axios.get('/getNotes', { id: CACHE_KEYS.notes, params: { tripId, page } });
}

export async function createNote(body: any): Promise<any> {
  invalidate(CACHE_KEYS.notes);
  return axios.post('/createNote', body);
}

export async function updateNote(body: any): Promise<any> {
  invalidate(CACHE_KEYS.notes);
  return axios.put('/editNote', body);
}

export async function deleteNote(tripId: string, noteId: string): Promise<any> {
  invalidate(CACHE_KEYS.notes);
  return axios.delete('/deleteNote', { params: { tripId, noteId } });
}

export async function fetchIndividualSpending(tripId: string): Promise<any> {
  return axios.get('/fetchIndividualSpending', { params: { tripId } });
}

export async function chatWithAgent(
  tripId: string,
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<any> {
  return axios.post('/chat', { tripId, message, history });
}
