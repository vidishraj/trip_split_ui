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

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <CurrencyProvider>
          <MessageProvider>
            <NotificationMessage>
              <TravelProvider>
                <UserProvider>
                  <App />
                </UserProvider>
              </TravelProvider>
            </NotificationMessage>
          </MessageProvider>
        </CurrencyProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
