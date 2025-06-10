import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import { useUser } from '../Contexts/GlobalContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const { setUser } = useUser();
  const location = useLocation();

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      
    }
  }, [currentUser, setUser]);

  if (!currentUser) {
    // Save the complete URL including search params
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 