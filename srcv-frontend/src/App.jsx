import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importaciones
import Login from './pages/Login';
import MenuPrincipal from './pages/MenuPrincipal';
import RegistroIngreso from './pages/RegistroIngreso';
import HistorialVisitas from './pages/HistorialVisitas';
import GestionVisitantes from './pages/GestionVisitantes';
import RegistroUsuarios from './pages/RegistroUsuarios';
import ProtectedRoute from './components/ProtectedRoute'; // Verifica que la carpeta sea 'components'

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
      </Routes>
    </Router>
  );
}

export default App;