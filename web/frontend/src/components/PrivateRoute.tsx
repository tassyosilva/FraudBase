import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated');
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

export default PrivateRoute;