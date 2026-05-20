import Axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { useEffect } from 'react';
import { useLoading } from '../Contexts/LoadingContext';
import { auth } from './FirebaseConfig';

const instance = Axios.create({ baseURL: process.env.REACT_APP_BACKENDURL });
const axios = setupCache(instance);

// Count in-flight requests so the global loader only clears when truly idle.
let inFlight = 0;

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const useAxiosSetup = () => {
  const { setLoading } = useLoading();

  useEffect(() => {
    const requestId = axios.interceptors.request.use(
      async (config: RetriableConfig) => {
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
      },
    );

    const responseId = axios.interceptors.response.use(
      (response) => {
        inFlight = Math.max(0, inFlight - 1);
        if (inFlight === 0) setLoading(false);
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as RetriableConfig | undefined;
        // 401 with a fresh token: retry exactly once.
        if (
          error.response?.status === 401 &&
          config &&
          !config._retry &&
          auth.currentUser
        ) {
          try {
            const fresh = await auth.currentUser.getIdToken(true);
            config._retry = true;
            config.headers?.set('Authorization', `Bearer ${fresh}`);
            // Don't decrement inFlight here — the replay's interceptor will
            // run again and re-increment, so net it's still balanced.
            return axios.request(config);
          } catch {
            /* fall through to normal failure */
          }
        }
        inFlight = Math.max(0, inFlight - 1);
        if (inFlight === 0) setLoading(false);
        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.request.eject(requestId);
      axios.interceptors.response.eject(responseId);
    };
  }, [setLoading]);
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

/** Invalidate every read cache — used after the assistant mutates data
 *  through tools, since the chat dialog can't know which resources changed. */
export const invalidateAll = () => invalidate(...Object.values(CACHE_KEYS));

// `force` triggers a fresh fetch; default false now relies on the cache.
export async function fetchTrips(force = false): Promise<any> {
  if (force) invalidate(CACHE_KEYS.trips);
  return axios.get('/fetchTrips', { id: CACHE_KEYS.trips });
}

export async function deleteTrip(_force: boolean, tripId: string): Promise<any> {
  invalidate(CACHE_KEYS.trips);
  return axios.get('/deleteTrip', { params: { tripId } });
}

export async function insertTrip(body: any): Promise<any> {
  invalidate(CACHE_KEYS.trips);
  return axios.post('/createTrip', body);
}

export async function fetchUsersForATrip(force: boolean, tripId: string): Promise<any> {
  if (force) invalidate(CACHE_KEYS.users);
  return axios.get('/fetchUsersForTrip', {
    params: { trip: tripId },
    id: CACHE_KEYS.users,
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

export async function fetchExpenseForTrip(force: boolean, tripId: string): Promise<any> {
  if (force) invalidate(CACHE_KEYS.expenses, CACHE_KEYS.balances);
  return axios.get('/fetchExpensesForTrip', {
    params: { trip: tripId },
    id: CACHE_KEYS.expenses,
  });
}

export async function fetchBalances(force: boolean, tripId: string): Promise<any> {
  if (force) invalidate(CACHE_KEYS.expenses, CACHE_KEYS.balances);
  return axios.get('/fetchBalances', {
    params: { trip: tripId },
    id: CACHE_KEYS.balances,
  });
}

export async function fetchIndividualBalance(force: boolean, tripId: string): Promise<any> {
  if (force) invalidate(CACHE_KEYS.expenses, CACHE_KEYS.balances, CACHE_KEYS.indiBalances);
  return axios.get('/fetchIndividualBalance', {
    params: { trip: tripId },
    id: CACHE_KEYS.indiBalances,
  });
}

export async function deleteExpense(_force: boolean, expenseId: number, tripId: string): Promise<any> {
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
  invalidate(CACHE_KEYS.users);
  return axios.post('/registerResponseForTripRequest', body);
}

export async function fetchNotes(tripId: string, page: number): Promise<any> {
  // Notes mutate often and page ordering shifts on insert/delete, so the
  // cache is more trouble than it's worth here. Always go to the network.
  return axios.get('/getNotes', { params: { tripId, page }, cache: false });
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
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
): Promise<any> {
  return axios.post('/chat', { tripId, message, history });
}
