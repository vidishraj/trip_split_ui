import { Route, Routes } from 'react-router-dom';
import Login from './Pages/Login';
import { TravelPage } from './Travel';
import { useAxiosSetup } from './Api/Api';

function App() {
  useAxiosSetup(); // Set up the axios interceptors
  return (
    <Routes>
      <Route path="*" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/trip/*" element={<TravelPage />} />
    </Routes>
  );
}

export default App;
