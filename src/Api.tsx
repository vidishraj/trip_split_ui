import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { useLoading } from './Contexts/LoadingContext';
import { auth } from './Login/FirebaseConfig';
const instance = Axios.create();
const axios = setupCache(instance, { debug: console.log });

let requestQueue: (() => void)[] = [];
export const useAxiosSetup = () => {
  const { setLoading } = useLoading();

  axios.interceptors.request.use(
    async (config) => {
      setLoading(true);
      let user = auth.currentUser; // Get currently signed-in user
      if (user) {
        const token = await user.getIdToken();
        config['headers'].setAuthorization(`Bearer ${token}`);
      }
      return config;
    },
    (error) => {
      setLoading(false);
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      if (requestQueue.length === 0) {
        setLoading(false);
      }
      return response;
    },
    (error) => {
      if (requestQueue.length === 0) {
        setLoading(false);
      }
      return Promise.reject(error);
    }
  );
};

let isRequestPending = false;
const delayBetweenRequests = 100;

const processNextRequest = () => {
  if (requestQueue.length > 0 && !isRequestPending) {
    isRequestPending = true;
    const nextRequest = requestQueue.shift();
    if (nextRequest) {
      nextRequest();
    }
  }
};

const queueRequest = (requestFunc: () => Promise<any>) => {
  return new Promise((resolve, reject) => {
    const executeRequest = () => {
      requestFunc()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          setTimeout(() => {
            isRequestPending = false;
            processNextRequest();
          }, delayBetweenRequests);
        });
    };
    requestQueue.push(executeRequest);
    processNextRequest();
  });
};

export async function fetchTrips(userCalled: boolean): Promise<any> {
  let cacheInstance = {};
  if (userCalled) {
    axios.storage.remove('fetch-trip');
  }
  return queueRequest(() =>
    axios
      .get(process.env.REACT_APP_BACKENDURL + '/fetchTrips', {
        id: 'fetch-trip',
        cache: cacheInstance,
      })
      .then((response) => response)
  );
}
export async function deleteTrip(
  userCalled: boolean,
  tripId: string
): Promise<any> {
  if (userCalled) {
    axios.storage.remove('fetch');
  }
  return queueRequest(() =>
    axios
      .get(process.env.REACT_APP_BACKENDURL + '/deleteTrip', {
        params: { tripId: tripId },
      })
      .then((response) => response)
  );
}

export async function insertTrip(body: any): Promise<any> {
  axios.storage.remove('fetch-trip');
  return queueRequest(() =>
    axios
      .post(process.env.REACT_APP_BACKENDURL + '/createTrip', body)
      .then((response) => response)
  );
}

export async function fetchUsersForATrip(
  userCalled: boolean,
  tripId: string
): Promise<any> {
  let cacheInstance = {};
  if (userCalled) {
    axios.storage.remove('summary');
  }
  return queueRequest(() =>
    axios
      .get(process.env.REACT_APP_BACKENDURL + '/fetchUsersForTrip', {
        params: { trip: tripId },
        id: 'summary',
        cache: cacheInstance,
      })
      .then((response) => response)
  );
}

export async function insertUser(body: any): Promise<any> {
  axios.storage.remove('summary');
  return queueRequest(() =>
    axios
      .post(process.env.REACT_APP_BACKENDURL + '/createUser', body)
      .then((response) => response)
  );
}

export async function insertExpense(body: any): Promise<any> {
  axios.storage.remove('summary');
  axios.storage.remove('expense');
  axios.storage.remove('balances');
  return queueRequest(() =>
    axios
      .post(process.env.REACT_APP_BACKENDURL + '/addExpense', body)
      .then((response) => response)
  );
}
export async function updateExpense(
  expenseId: string,
  body: any
): Promise<any> {
  axios.storage.remove('summary');
  axios.storage.remove('expense');
  axios.storage.remove('balances');
  return queueRequest(() =>
    axios
      .post(process.env.REACT_APP_BACKENDURL + '/editExpense', {
        expenseId: expenseId,
        body: body,
      })
      .then((response) => response)
  );
}
export async function updateTripTitle(
  title:string, tripId: string
): Promise<any> {
  axios.storage.remove('fetch-trip');
  return queueRequest(() =>
    axios
      .post(process.env.REACT_APP_BACKENDURL + '/editTripTitle', {
        title: title,
        tripId: tripId,
      })
      .then((response) => response)
  );
}

export async function fetchExpenseForTrip(
  userCalled: boolean,
  tripId: string
): Promise<any> {
  let cacheInstance = {};
  if (userCalled) {
    axios.storage.remove('expense');
    axios.storage.remove('balances');
  }
  return queueRequest(() =>
    axios
      .get(process.env.REACT_APP_BACKENDURL + '/fetchExpensesForTrip', {
        params: { trip: tripId },
        id: 'expense',
        cache: cacheInstance,
      })
      .then((response) => response)
  );
}

export async function fetchBalances(
  userCalled: boolean,
  tripId: string
): Promise<any> {
  let cacheInstance = {};
  if (userCalled) {
    axios.storage.remove('expense');
    axios.storage.remove('balances');
  }
  return queueRequest(() =>
    axios
      .get(process.env.REACT_APP_BACKENDURL + '/fetchBalances', {
        params: { trip: tripId },
        id: 'balances',
        cache: cacheInstance,
      })
      .then((response) => response)
  );
}

export async function deleteExpense(
  userCalled: boolean,
  expenseId: number,
  tripId: string
): Promise<any> {
  if (userCalled) {
    axios.storage.remove('expense');
    axios.storage.remove('summary');
    axios.storage.remove('balances');
  }
  return queueRequest(() =>
    axios
      .get(process.env.REACT_APP_BACKENDURL + '/deleteExpenses', {
        params: { expenseId: expenseId, tripId: tripId },
      })
      .then((response) => response)
  );
}

export async function deleteUser(userId: string, tripId: string): Promise<any> {
  axios.storage.remove('summary');
  axios.storage.remove('expense');
  return queueRequest(() =>
    axios
      .get(process.env.REACT_APP_BACKENDURL + '/deleteUser', {
        params: { userId: userId, tripId: tripId },
      })
      .then((response) => response)
  );
}
export async function sendTripRequest(tripId: string): Promise<any> {
  return queueRequest(() =>
    axios
      .post(process.env.REACT_APP_BACKENDURL + '/sendTripUserRequest', {
        tripId: tripId,
      })
      .then((response) => response)
  );
}
export async function fetchTripRequestsForTrip(tripId: string): Promise<any> {
  return queueRequest(() =>
    axios
      .get(process.env.REACT_APP_BACKENDURL + '/fetchTripRequestForTrip', {
        params: { trip: tripId },
      })
      .then((response) => response)
  );
}
export async function sendResponseForTripRequest(body: any): Promise<any> {
  return queueRequest(() =>
    axios
      .post(
        process.env.REACT_APP_BACKENDURL + '/registerResponseForTripRequest',
        body
      )
      .then((response) => response)
  );
}
