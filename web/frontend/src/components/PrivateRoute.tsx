import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  // Verifique se há um token no sessionStorage
  const isAuthenticated = sessionStorage.getItem('token') !== null;

  // Se não estiver autenticado, redirecione para a página de login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Se estiver autenticado, renderize o componente filho
  return children;
};

export default PrivateRoute;