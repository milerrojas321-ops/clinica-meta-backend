import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import MenuPrincipal from './pages/MenuPrincipal';
import Perfil from './pages/Perfil';
import Configuracion from './pages/Configuracion';
import RegistroIngreso from './pages/RegistroIngreso';
import HistorialVisitas from './pages/HistorialVisitas';
import GestionVisitantes from './pages/GestionVisitantes';
import RegistroUsuarios from './pages/RegistroUsuarios';
import ControlCamas from './pages/controlCamas';
import Egresos from './pages/Egresos';
import ProtectedRoute from './components/ProtectedRoute';

import axios from 'axios';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('tokenClinica');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('tokenClinica');
      localStorage.removeItem('usuarioClinica');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

function App() {
  const [usuarioLogueado, setUsuarioLogueado] = useState(() => {
    const guardado = localStorage.getItem('usuarioClinica');
    return guardado ? JSON.parse(guardado) : null;
  });

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login onLoginSuccess={(u) => setUsuarioLogueado(u)} />} />

        <Route path="/inicio" element={
          <ProtectedRoute user={usuarioLogueado} allowedRoles={['administrador', 'recepcionista']}>
            <MenuPrincipal user={usuarioLogueado} />
          </ProtectedRoute>
        } />

        <Route path="/Perfil" element={<Perfil />} />

        <Route path="/control-camas" element={
          <ProtectedRoute user={usuarioLogueado} allowedRoles={['administrador', 'recepcionista']}>
            <ControlCamas />
          </ProtectedRoute>
        } />

        <Route path="/registro-ingreso" element={
          <ProtectedRoute user={usuarioLogueado} allowedRoles={['administrador', 'recepcionista']}>
            <RegistroIngreso />
          </ProtectedRoute>
        } />

        <Route path="/historial-visitas" element={
          <ProtectedRoute user={usuarioLogueado} allowedRoles={['administrador', 'recepcionista']}>
            <HistorialVisitas />
          </ProtectedRoute>
        } />

        <Route path="/visitantes" element={
          <ProtectedRoute user={usuarioLogueado} allowedRoles={['administrador', 'recepcionista']}>
            <GestionVisitantes />
          </ProtectedRoute>
        } />

        <Route path="/registro-usuarios" element={
          <ProtectedRoute user={usuarioLogueado} allowedRoles={['administrador']}>
            <RegistroUsuarios />
          </ProtectedRoute>
        } />

        <Route path="/egresos" element={
          <ProtectedRoute user={usuarioLogueado} allowedRoles={['administrador', 'recepcionista']}>
            <Egresos />
          </ProtectedRoute>
        } />

        <Route path="/Configuracion" element={
          <ProtectedRoute user={usuarioLogueado} allowedRoles={['administrador']}>
            <Configuracion />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;