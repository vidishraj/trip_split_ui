import {
  fetchBalances,
  fetchExpenseForTrip,
  fetchTrips,
  fetchUsersForATrip,
} from './Api/Api';
import Dashboard from './Pages/Dashboard';
import TripPage from './Pages/Trip';
import { useEffect } from 'react';
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
  // eslint-disable-next-line
  let [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  function refreshData() {
    if (travelCtx.state.chosenTrip) {
      fetchUsersForATrip(true, travelCtx.state.chosenTrip.tripIdShared)
        .then((response) => {
          const users = response.data.Message;
          travelCtx.dispatch({
            type: 'SET_USERS',
            payload: users,
          });
          travelCtx.dispatch({
            type: 'SET_SUMMARY',
            payload: {
              ...travelCtx.state.summary,
              userCount: Object.keys(users).length,
            },
          });
        })
        .catch((error) => {
          setPayload({
            type: 'error',
            message: 'Error fetching users for trip',
          });
          console.log(error);
        });
      fetchExpenseForTrip(true, travelCtx.state.chosenTrip.tripIdShared)
        .then((response) => {
          travelCtx.dispatch({
            type: 'SET_EXPENSES',
            payload: response.data.Message,
          });
        })
        .catch((error) => {
          setPayload({
            type: 'error',
            message: 'Error fetching expenses for trip',
          });
          console.log(error);
        });
      fetchBalances(true, travelCtx.state.chosenTrip.tripIdShared)
        .then((response) => {
          travelCtx.dispatch({
            type: 'SET_BALANCES',
            payload: response.data.Message,
          });
        })
        .catch((error) => {
          setPayload({
            type: 'error',
            message: 'Error fetching balances for trip',
          });
          console.log(error);
        });
    }
  }

  useEffect(() => {
    // eslint-disable-next-line
    const tripIdShared = searchParams.get('tripIdShared');
    if (tripIdShared && user) {
      fetchTrips(true)
        .then((response) => {
          travelCtx.dispatch({
            type: 'SET_TRIP',
            payload: response.data.Message,
          });
          if (Array.isArray(response.data.Message)) {
            const items: [] = response.data.Message;
            response.data.Message.forEach((item: any) => {
              item['currencies'] = item['currencies'].toString()?.split(',');
            });
            const trip: any = items.find(
              (item) => item['tripIdShared'] === parseInt(tripIdShared)
            );
            if (trip !== 'undefined' && trip) {
              travelCtx.dispatch({
                type: 'SET_CHOSEN_TRIP',
                payload: trip,
              });
            }
          }
        })
        .catch((error) => {
          console.log(error);
          setPayload({
            type: 'error',
            message: 'Error fetching trips.',
          });
        })
        .finally(() => {});
      refreshData();
    } else if (user) {
      fetchTrips(true)
        .then((response) => {
          if (Array.isArray(response.data.Message)) {
            response.data.Message.forEach((item: any) => {
              item['currencies'] = item['currencies'].toString().split(',');
            });
            travelCtx.dispatch({
              type: 'SET_TRIP',
              payload: response.data.Message,
            });
          }
        })
        .catch((error) => {
          console.log(error);
          setPayload({
            type: 'error',
            message: 'Error fetching trips',
          });
        })
        .finally(() => {});
    } // eslint-disable-next-line
  }, [navigate, user]);

  useEffect(() => {
    if (travelCtx.state.chosenTrip) {
      navigate(
        `/trip?tripIdShared=${travelCtx.state.chosenTrip.tripIdShared}`,
        {
          replace: true,
        }
      );
      refreshData();
    }
    travelCtx.dispatch({
      type: 'SET_REFRESHER',
      payload: refreshData,
    }); // eslint-disable-next-line
  }, [travelCtx.state.chosenTrip, navigate]);

  return (
    <>
      {user !== null ? (
        <div>
          {travelCtx.state.chosenTrip === undefined ? (
            <TripPage></TripPage>
          ) : (
            <>
              <Dashboard refreshData={refreshData}></Dashboard>
            </>
          )}
          <Footer />
        </div>
      ) : (
        <Login />
      )}
    </>
  );
};
