import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import { TravelPage } from './Travel';
import { useAxiosSetup } from './Api/Api';
import ProtectedRoute from './Components/ProtectedRoute';
import Home from './Pages/Home';

const App: React.FC = () => {
  useAxiosSetup(); // Set up the axios interceptors
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/trip/*" element={
        <ProtectedRoute>
          <TravelPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
