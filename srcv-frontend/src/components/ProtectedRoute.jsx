import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, allowedRoles, children }) => {
  // Si no hay usuario en el estado ni en el localStorage, al login
  const storedUser = JSON.parse(localStorage.getItem('usuarioClinica'));
  const currentUser = user || storedUser;

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // Verificar si el rol está permitido
  const rolLimpio = currentUser.rol?.toLowerCase().trim();
  if (allowedRoles && !allowedRoles.includes(rolLimpio)) {
    return <Navigate to="/inicio" replace />;
  }

  return children;
};

// ESTA LÍNEA ES VITAL para evitar el error de la pantalla blanca
export default ProtectedRoute;