import {
  fetchBalances,
  fetchExpenseForTrip,
  fetchIndividualBalance,
  fetchTrips,
  fetchUsersForATrip,
} from './Api/Api';
import Dashboard from './Pages/Dashboard';
import TripPage from './Pages/Trip';
import { useCallback, useEffect, useRef } from 'react';
import { useTravel } from './Contexts/TravelContext';
import { useMessage } from './Contexts/NotifContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Footer from './Components/Footer';
import { useUser } from './Contexts/GlobalContext';
import Login from './Pages/Login';

export const TravelPage = () => {
  const { setPayload } = useMessage();
  const travelCtx = useTravel();
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Stable ref so children that grab refreshData out of context don't
  // capture a stale closure or churn on every render.
  const refreshDataRef = useRef<() => void>(() => {});

  // Track which trip's data we've fetched, to avoid duplicate refetches
  // when a re-render produces a new but equivalent chosenTrip reference.
  const fetchedTripIdRef = useRef<string | undefined>();

  const refreshData = useCallback(() => {
    const trip = travelCtx.state.chosenTrip;
    if (!trip) return;
    const tripId = trip.tripIdShared;

    fetchUsersForATrip(true, tripId)
      .then((response) => {
        const users = response.data.Message;
        travelCtx.dispatch({ type: 'SET_USERS', payload: users });
        travelCtx.dispatch({
          type: 'SET_SUMMARY',
          payload: { userCount: Array.isArray(users) ? users.length : 0 },
        });
      })
      .catch(() => setPayload({ type: 'error', message: 'Error fetching users for trip' }));

    fetchExpenseForTrip(true, tripId)
      .then((response) =>
        travelCtx.dispatch({ type: 'SET_EXPENSES', payload: response.data.Message }),
      )
      .catch(() => setPayload({ type: 'error', message: 'Error fetching expenses for trip' }));

    fetchBalances(true, tripId)
      .then((response) =>
        travelCtx.dispatch({ type: 'SET_BALANCES', payload: response.data.Message }),
      )
      .catch(() => setPayload({ type: 'error', message: 'Error fetching balances for trip' }));

    fetchIndividualBalance(true, tripId)
      .then((response) =>
        travelCtx.dispatch({ type: 'SET_INDIVIDUAL_BALANCES', payload: response.data.Message }),
      )
      .catch(() =>
        setPayload({ type: 'error', message: 'Error fetching individual balances for trip' }),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelCtx.state.chosenTrip?.tripIdShared]);

  // Keep the ref in sync with the current refreshData, and publish *the ref's*
  // callback to context so consumers always invoke the latest version.
  useEffect(() => {
    refreshDataRef.current = refreshData;
    travelCtx.dispatch({
      type: 'SET_REFRESHER',
      payload: () => refreshDataRef.current(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshData]);

  // Load the trip list whenever the user changes. Also handle deep-link
  // `?tripIdShared=XXXXXX` by picking the matching trip once trips load.
  useEffect(() => {
    if (!user) return;
    const deepLinkTripId = searchParams.get('tripIdShared');

    fetchTrips(true)
      .then((response) => {
        const trips = response.data.Message;
        if (!Array.isArray(trips)) return;
        trips.forEach((item: any) => {
          item.currencies = item.currencies.toString().split(',');
        });
        travelCtx.dispatch({ type: 'SET_TRIP', payload: trips });
        if (deepLinkTripId) {
          const match = trips.find((t: any) => t.tripIdShared === deepLinkTripId);
          if (match) travelCtx.dispatch({ type: 'SET_CHOSEN_TRIP', payload: match });
        }
      })
      .catch(() => setPayload({ type: 'error', message: 'Error fetching trips.' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, searchParams]);

  // When the chosen trip changes (and only then), sync URL and fetch data.
  // Keyed off the tripIdShared string so we don't refire when the object
  // reference changes but the id doesn't.
  useEffect(() => {
    const tripId = travelCtx.state.chosenTrip?.tripIdShared;
    if (!tripId) {
      fetchedTripIdRef.current = undefined;
      return;
    }
    navigate(`/trip?tripIdShared=${tripId}`, { replace: true });
    if (fetchedTripIdRef.current === tripId) return;
    fetchedTripIdRef.current = tripId;
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelCtx.state.chosenTrip?.tripIdShared]);

  if (user === null) return <Login />;

  return (
    <div>
      {travelCtx.state.chosenTrip === undefined ? (
        <TripPage />
      ) : (
        <Dashboard refreshData={refreshData} />
      )}
      <Footer />
    </div>
  );
};
