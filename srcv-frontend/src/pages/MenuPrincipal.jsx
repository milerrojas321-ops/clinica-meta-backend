import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  UserPlus, ClipboardList, Users, UserCog, 
  LogOut, Menu, X, Settings, User as UserIcon, MoreVertical, Bed, LogOut as ExitIcon 
} from 'lucide-react'; 
import './MenuPrincipal.css';

const MenuPrincipal = ({ user: propUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [visitasActivas, setVisitasActivas] = useState([]);
  const [popOverActivo, setPopOverActivo] = useState(null);
  const navigate = useNavigate();

  const [activeUser, setActiveUser] = useState(propUser || null);

  const cargarVisitasActivas = async () => {
    try {
      const token = localStorage.getItem('tokenClinica');
      const response = await axios.get('http://localhost:3000/api/visitas/activas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVisitasActivas(response.data);
    } catch (error) {
      console.error("Error cargando visitantes activos", error);
    }
  };

  useEffect(() => {
    if (!activeUser) {
      const usuarioGuardado = localStorage.getItem('usuarioClinica');
      if (usuarioGuardado) {
        try {
          setActiveUser(JSON.parse(usuarioGuardado));
        } catch (e) {
          console.error("Error al parsear el usuario de la sesión", e);
        }
      }
    }
    cargarVisitasActivas();

    const interval = setInterval(() => {
      cargarVisitasActivas();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const userName = activeUser?.nombre_completo || activeUser?.nombre || "Usuario";

  const handleFinalizarVisita = async (id_visita) => {
    try {
      const token = localStorage.getItem('tokenClinica');
      await axios.put(`http://localhost:3000/api/visitas/salida/${id_visita}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPopOverActivo(null);
      cargarVisitasActivas();
    } catch (error) {
      console.error("Error al registrar la salida", error);
      alert("No se pudo registrar la salida");
    }
  };

  const opcionesMenu = [
    { titulo: 'Control de Camas', descripcion: 'Monitoreo en tiempo real del aforo y ocupación de camas por áreas.', icono: <Bed size={35} />, ruta: '/control-camas', color: '#00b4d8' },
    { titulo: 'Egresos y Portería', descripcion: 'Validación de boletas de salida y control de alta de pacientes.', icono: <ExitIcon size={35} />, ruta: '/egresos', color: '#e74c3c' },
    { titulo: 'Registrar Visita', descripcion: 'Escaneo de cédula y toma de fotografía para nuevos ingresos.', icono: <UserPlus size={35} />, ruta: '/registro-ingreso', color: '#2ecc71' },
    { titulo: 'Historial de Visitas', descripcion: 'Consulta quién ha entrado y salido de la clínica.', icono: <ClipboardList size={35} />, ruta: '/historial-visitas', color: '#3498db' },
    { titulo: 'Historial de Visitantes', descripcion: 'Base de datos maestra de personas registradas.', icono: <Users size={35} />, ruta: '/visitantes', color: '#9b59b6' },
    { titulo: 'Registrar Usuarios', descripcion: 'Crear nuevas cuentas para recepcionistas o administradores.', icono: <UserCog size={35} />, ruta: '/registro-usuarios', color: '#e67e22' }
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const opcionesPermitidas = opcionesMenu.filter(opcion => {
    if (opcion.ruta === '/registro-usuarios') {
      return activeUser?.rol?.toLowerCase().trim() === 'administrador';
    }
    return true;
  });

  return (
    <div className="dashboard-layout">
      <nav className="topbar">
        <div className="topbar-left">
          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="brand" onClick={() => navigate('/inicio')} style={{ cursor: 'pointer' }}></div>
        </div>
        <div className="welcome-section"><h2>Panel de Gestión</h2></div>
        <div className="topbar-right">
          {activeUser?.rol === 'administrador' && (
            <button className="icon-btn" onClick={() => navigate('/configuracion')} title="Configuración del sistema"><Settings size={30} /></button>
          )}
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-role">{activeUser?.rol ? activeUser.rol.charAt(0).toUpperCase() + activeUser.rol.slice(1) : 'Personal'}</span>
            </div>
            <div className="user-avatar">
              <button className="avatar-btn" onClick={() => navigate('/Perfil')} title="Ver mi perfil"><UserIcon size={30} /></button>
            </div>
          </div>
        </div>
      </nav>

      <div className={`side-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div className="drawer-content">
          <div className="drawer-section">
            {activeUser?.rol === 'administrador' && <button onClick={() => navigate('/Configuracion')}><Settings size={18} /> Configuración</button>}
            <button onClick={() => navigate('/Perfil')}><UserIcon size={18} /> Mi Perfil</button>
          </div>
          <button className="btn-logout-sidebar" onClick={handleLogout}><LogOut size={18} /> Cerrar Sesión</button>
        </div>
      </div>

      <main className="main-content">
        <div className="dashboard-container">
          <section className="panel-modulos">
            <div className="menu-grid">
              {opcionesPermitidas.map((opcion, index) => (
                <div key={index} className="menu-card" onClick={() => navigate(opcion.ruta)} style={{ '--accent-color': opcion.color }}>
                  <div className="card-icon" style={{ color: opcion.color }}>{opcion.icono}</div>
                  <div className="card-info">
                    <h3>{opcion.titulo}</h3>
                    <p>{opcion.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel-activos">
            <div className="activos-header">
              <h3>Visitantes en la Clínica ({visitasActivas.length})</h3>
            </div>
            <div className="activos-lista">
              {visitasActivas.length === 0 ? (
                <p className="no-activos">No hay visitas activas en este momento.</p>
              ) : (
                visitasActivas.map((visita) => (
                  <div key={visita.id_visita} className="notificacion-tarjeta">
                    <img 
                      src={visita.foto_perfil_url || 'https://via.placeholder.com/150'} 
                      alt="Visitante" 
                      className="notificacion-foto" 
                    />
                    <div className="notificacion-info">
                      <h4>{visita.visitante_completo}</h4>
                      <p>Destino: <span>{visita.area_destino}</span></p>
                    </div>
                    
                    <div className="popover-contenedor">
                      <button 
                        className="btn-opciones-pop"
                        onClick={() => setPopOverActivo(popOverActivo === visita.id_visita ? null : visita.id_visita)}
                      >
                        <MoreVertical size={20} />
                      </button>

                      {popOverActivo === visita.id_visita && (
                        <div className="popover-menu">
                          <button 
                            className="btn-finalizar-visita"
                            onClick={() => handleFinalizarVisita(visita.id_visita)}
                          >
                            Finalizar Visita
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="menu-footer">
        <p>© 2026 La Meta - Sistema de Gestión de visitas</p>
      </footer>
    </div>
  );
};

export default MenuPrincipal;