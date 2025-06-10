import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import { TravelPage } from './Travel';
import { useAxiosSetup } from './Api/Api';
import ProtectedRoute from './Components/ProtectedRoute';

function App() {
  useAxiosSetup(); // Set up the axios interceptors
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/trip/*" element={
        <ProtectedRoute>
          <TravelPage />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/trip" replace />} />
      <Route path="*" element={<Navigate to="/trip" replace />} />
    </Routes>
  );
}

export default App;
