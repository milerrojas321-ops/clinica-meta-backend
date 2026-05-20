import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importaciones
import Login from './pages/Login';
import MenuPrincipal from './pages/MenuPrincipal';
import Perfil from './pages/Perfil';
import Configuracion from './pages/Configuracion';
import RegistroIngreso from './pages/RegistroIngreso';
import HistorialVisitas from './pages/HistorialVisitas';
import GestionVisitantes from './pages/GestionVisitantes';
import RegistroUsuarios from './pages/RegistroUsuarios';
import ProtectedRoute from './components/ProtectedRoute'; // Verifica que la carpeta sea 'components'

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
      localStorage.removeItem('tokenClinica'); // ESTO ES CLAVE
      localStorage.removeItem('usuarioClinica');
      window.location.href = '/'; // Opcional: Forzar salida
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
        {/* Ruta pública */}
        <Route path="/" element={<Login onLoginSuccess={(u) => setUsuarioLogueado(u)} />} />

        {/* Rutas Protegidas para AMBOS roles */}
        <Route path="/inicio" element={
          <ProtectedRoute user={usuarioLogueado} allowedRoles={['administrador', 'recepcionista']}>
            <MenuPrincipal user={usuarioLogueado} />
          </ProtectedRoute>
        } />

        <Route path="/Perfil" element={<Perfil />} />

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

        {/* Ruta Protegida SOLO para Administrador */}
        <Route path="/registro-usuarios" element={
          <ProtectedRoute user={usuarioLogueado} allowedRoles={['administrador']}>
            <RegistroUsuarios />
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