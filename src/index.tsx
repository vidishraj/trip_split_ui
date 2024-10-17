import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './Contexts/GlobalContext';
import { MessageProvider } from './Contexts/NotifContext';
import { TravelProvider } from './Contexts/TravelContext';
import { AuthProvider } from './Contexts/AuthContext';
import { CurrencyProvider } from './Contexts/CurrencyContext';
import NotificationMessage from './Travel/Notification';
import { LoadingProvider } from './Contexts/LoadingContext';
import Loader from './Common/Loader';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Router>
    <LoadingProvider>
      <AuthProvider>
        <CurrencyProvider>
          <MessageProvider>
            <NotificationMessage>
              <TravelProvider>
                <UserProvider>
                  <Loader />
                  <App />
                </UserProvider>
              </TravelProvider>
            </NotificationMessage>
          </MessageProvider>
        </CurrencyProvider>
      </AuthProvider>
    </LoadingProvider>
  </Router>
);
