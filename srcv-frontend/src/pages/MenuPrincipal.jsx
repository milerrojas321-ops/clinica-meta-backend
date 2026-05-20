import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, ClipboardList, Users, UserCog, 
  LogOut, Menu, X, Settings, User as UserIcon, Bell 
} from 'lucide-react'; 
import './MenuPrincipal.css';

const MenuPrincipal = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  console.log("Datos del objeto user:", user);
  console.log("Rol detectado:", user?.rol);

  // Nombre del usuario que viene de la sesión
  const userName = user?.nombre || "Usuario";
  const usuario = JSON.parse(localStorage.getItem('usuarioClinica'));

  // 1. Primero definimos TODAS las opciones posibles
const opcionesMenu = [
  {
    titulo: 'Registrar Visita',
    descripcion: 'Escaneo de cédula y toma de fotografía para nuevos ingresos.',
    icono: <UserPlus size={35} />,
    ruta: '/registro-ingreso',
    color: '#2ecc71'
  },
  {
    titulo: 'Historial de Visitas',
    descripcion: 'Consulta quién ha entrado y salido de la clínica.',
    icono: <ClipboardList size={35} />,
    ruta: '/historial-visitas',
    color: '#3498db'
  },
  {
    titulo: 'Historial de Visitantes',
    descripcion: 'Base de datos maestra de personas registradas.',
    icono: <Users size={35} />,
    ruta: '/visitantes',
    color: '#9b59b6'
  },
  {
    titulo: 'Registrar Usuarios',
    descripcion: 'Crear nuevas cuentas para recepcionistas o administradores.',
    icono: <UserCog size={35} />,
    ruta: '/registro-usuarios',
    color: '#e67e22'
  }
];

const handleLogout = () => {
  // Opción A: Eliminar uno por uno completamente
  localStorage.removeItem('usuarioClinica');
  localStorage.removeItem('tokenClinica'); // <--- Usa removeItem para que desaparezca la fila
  
  // Opción B (Más profesional): Limpiar TODO de una vez
  // localStorage.clear(); 

  window.location.href = '/';
};

const opcionesPermitidas = opcionesMenu.filter(opcion => {
  if (opcion.ruta === '/registro-usuarios') {
    return user?.rol?.toLowerCase().trim() === 'administrador';
  }
  return true;
});

  return (
    <div className="dashboard-layout">
      {/* TopBar mejorado al 100% de ancho */}
      <nav className="topbar">
        <div className="topbar-left">
          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="brand" onClick={() => navigate('/inicio')} style={{ cursor: 'pointer' }}>
            <span className="plus-icon">+</span>
            <h1>CLÍNICA META</h1>
          </div>
        </div>

        <div className="topbar-right">
          {/* BOTÓN DE CONFIGURACIÓN: Solo visible para administradores */}
          {user?.rol === 'administrador' && (
            <button 
              className="icon-btn" 
              onClick={() => navigate('/configuracion')}
              title="Configuración del sistema"
            >
              <Settings size={20} />
            </button>
          )}

          {/* <button className="icon-btn">
            <Bell size={20} />
          </button> */}

          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">{userName}</span>
              {/* Mostramos el rol con la primera letra en mayúscula para que se vea más profesional */}
              <span className="user-role">
                {user?.rol ? user.rol.charAt(0).toUpperCase() + user.rol.slice(1) : 'Personal'}
              </span>
            </div>
            <div className="user-avatar">
              {/* El botón ahora envuelve al icono correctamente para mejorar el área de clic */}
              <button className="avatar-btn" onClick={() => navigate('/Perfil')} title="Ver mi perfil">
                <UserIcon size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menú Hamburguesa Lateral (Drawer) */}
      <div className={`side-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div className="drawer-content">
          <div className="drawer-section">
            {/* CORRECCIÓN: Solo el admin ve el botón de Configuración en el menú lateral */}
            {user?.rol === 'administrador' && (
              <button onClick={() => navigate('/Configuracion')}>
                <Settings size={18} /> Configuración
              </button>
            )}
            
            <button onClick={() => navigate('/Perfil')}>
              <UserIcon size={18} /> Mi Perfil
            </button>
          </div>
          
          <button className="btn-logout-sidebar" onClick={handleLogout}>
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="main-content">
        <div className="welcome-section">
          <h2>Panel de Gestión</h2>
          <p>Selecciona una opción para comenzar</p>
        </div>

        <div className="menu-grid">
          {opcionesPermitidas.map((opcion, index) => (
            <div 
              key={index} 
              className="menu-card" 
              onClick={() => navigate(opcion.ruta)}
              style={{ '--accent-color': opcion.color }}
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
        </div>
      </main>

      <footer className="menu-footer">
        <p>© 2026 Clínica Meta - Sistema de Gestión de visitas</p>
      </footer>
    </div>
  );
};

export default MenuPrincipal;