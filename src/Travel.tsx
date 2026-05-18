import {
  fetchBalances,
  fetchExpenseForTrip,
  fetchIndividualBalance,
  fetchTrips,
  fetchUsersForATrip,
} from './Api/Api';
import Dashboard from './Pages/Dashboard';
import TripPage from './Pages/Trip';
import { useCallback, useEffect } from 'react';
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
          payload: { ...travelCtx.state.summary, userCount: Object.keys(users).length },
        });
      })
      .catch(() => setPayload({ type: 'error', message: 'Error fetching users for trip' }));

    fetchExpenseForTrip(true, tripId)
      .then((response) =>
        travelCtx.dispatch({ type: 'SET_EXPENSES', payload: response.data.Message })
      )
      .catch(() => setPayload({ type: 'error', message: 'Error fetching expenses for trip' }));

    fetchBalances(true, tripId)
      .then((response) =>
        travelCtx.dispatch({ type: 'SET_BALANCES', payload: response.data.Message })
      )
      .catch(() => setPayload({ type: 'error', message: 'Error fetching balances for trip' }));

    fetchIndividualBalance(true, tripId)
      .then((response) =>
        travelCtx.dispatch({ type: 'SET_INDIVIDUAL_BALANCES', payload: response.data.Message })
      )
      .catch(() =>
        setPayload({ type: 'error', message: 'Error fetching individual balances for trip' })
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelCtx.state.chosenTrip]);

  // Load the trip list whenever the user changes. Also handle deep-link
  // `?tripIdShared=XXXXXX` by picking the matching trip once trips are loaded.
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
  }, [user]);

  // When a trip is chosen (manually or via deep link), sync URL and fetch data.
  useEffect(() => {
    if (!travelCtx.state.chosenTrip) return;
    navigate(`/trip?tripIdShared=${travelCtx.state.chosenTrip.tripIdShared}`, { replace: true });
    refreshData();
    travelCtx.dispatch({ type: 'SET_REFRESHER', payload: refreshData });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelCtx.state.chosenTrip, refreshData]);

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
