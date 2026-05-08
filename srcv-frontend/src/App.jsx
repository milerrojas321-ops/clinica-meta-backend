import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importaciones únicas
import Login from './pages/Login';
import MenuPrincipal from './pages/MenuPrincipal';
import RegistroIngreso from './pages/RegistroIngreso';
import HistorialVisitas from './pages/HistorialVisitas';
import GestionVisitantes from './pages/GestionVisitantes';
import RegistroUsuarios from './pages/RegistroUsuarios';

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Pantalla inicial */}
        <Route path="/" element={<Login />} />
        
        {/* 2. Menú después del Login */}
        <Route path="/inicio" element={<MenuPrincipal />} />
        
        {/* 3. Vista de Registro de Visitas */}
        <Route path="/registro-ingreso" element={<RegistroIngreso />} />
        
        {/* Otras rutas que definiste en el menú */}
        <Route path="/historial-visitas" element={<HistorialVisitas />} />
        <Route path="/visitantes" element={<GestionVisitantes />} />
        <Route path="/registro-usuarios" element={<RegistroUsuarios />} />
      </Routes>
    </Router>
  );
}

export default App;