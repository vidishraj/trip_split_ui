import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './Login/Login';
import { TravelPage } from './Travel/Travel';

function App() {
  return (
    <Routes>
      <Route path="*" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/trip/*" element={<TravelPage />} />
    </Routes>
  );
}

export default App;
