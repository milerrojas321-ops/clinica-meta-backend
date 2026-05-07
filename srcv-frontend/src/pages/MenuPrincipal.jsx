import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  ClipboardList, 
  Users, 
  UserCog, 
  LogOut 
} from 'lucide-react'; // Iconos modernos
import './MenuPrincipal.css';

const MenuPrincipal = () => {
  const navigate = useNavigate();

  // Opciones del menú basadas en tus requerimientos
  const opcionesMenu = [
    {
      titulo: 'Registrar Visita',
      descripcion: 'Escaneo de cédula y toma de fotografía para nuevos ingresos.',
      icono: <UserPlus size={40} />,
      ruta: '/registro-ingreso',
      color: '#2ecc71'
    },
    {
      titulo: 'Historial de Visitas',
      descripcion: 'Consulta quién ha entrado y salido de la clínica.',
      icono: <ClipboardList size={40} />,
      ruta: '/historial-visitas',
      color: '#3498db'
    },
    {
      titulo: 'Historial de Visitantes',
      descripcion: 'Base de datos maestra de personas registradas.',
      icono: <Users size={40} />,
      ruta: '/visitantes',
      color: '#9b59b6'
    },
    {
      titulo: 'Registrar Usuarios',
      descripcion: 'Crear nuevas cuentas para recepcionistas o administradores.',
      icono: <UserCog size={40} />,
      ruta: '/registro-usuarios',
      color: '#e67e22'
    }
  ];

  return (
    <div className="menu-container">
      <header className="menu-header">
        <div className="header-content">
          <h1>CLÍNICA META</h1>
          <p>Panel de Administración y Control de Acceso</p>
        </div>
        <button className="btn-logout" onClick={() => navigate('/')}>
          <LogOut size={20} /> Salir
        </button>
      </header>

      <main className="menu-grid">
        {opcionesMenu.map((opcion, index) => (
          <div 
            key={index} 
            className="menu-card" 
            onClick={() => navigate(opcion.ruta)}
            style={{ '--hover-color': opcion.color }}
          >
            <div className="card-icon" style={{ color: opcion.color }}>
              {opcion.icono}
            </div>
            <div className="card-info">
              <h3>{opcion.titulo}</h3>
              <p>{opcion.descripcion}</p>
            </div>
          </div>
        ))}
      </main>

      <footer className="menu-footer">
        <p>© 2026 Clínica Meta - Sistema de Gestión de Seguridad</p>
      </footer>
    </div>
  );
};

export default MenuPrincipal;