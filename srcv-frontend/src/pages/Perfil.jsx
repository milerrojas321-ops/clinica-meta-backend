import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Shield, LogOut, ArrowLeft, KeyRound, UserCheck, Sparkles } from 'lucide-react';
import './Perfil.css';

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verificarYCargar = async () => {
      try {
        await axios.get('http://localhost:3000/api/auth/verificar-sesion');
        const datosGuardados = JSON.parse(localStorage.getItem('usuarioClinica'));
        if (datosGuardados) {
          setUsuario(datosGuardados);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/');
        }
      }
    };
    verificarYCargar();
  }, [navigate]);

  if (!usuario) {
    return (
      <div className="perfil-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const esAdmin = usuario.rol === 'administrador';

  return (
    <div className="perfil-page">
      <div className="perfil-card-glass">
        {/* Cabecera con botón de regreso */}
        <header className="perfil-header-glass">
          <button onClick={() => navigate('/inicio')} className="btn-volver-perfil" title="Volver al inicio">
            <ArrowLeft size={18} />
            <span>Volver</span>
          </button>
          <div className="header-badge-status">
            <Sparkles size={14} className="icon-sparkle" />
            <span>Cuenta Activa</span>
          </div>
        </header>

        {/* Sección del Avatar y Presentación */}
        <div className="perfil-hero-section">
          <div className="avatar-wrapper">
            <div className="avatar-glow"></div>
            <div className="avatar-circle">
              <User size={52} />
            </div>
          </div>

          <h2 className="user-fullname">
            {usuario.nombre_completo || usuario.nombre || 'Usuario de la Clínica'}
          </h2>

          <div className={`badge-rol-pill ${usuario.rol || 'recepcionista'}`}>
            <Shield size={14} />
            <span>{esAdmin ? 'Administrador System' : 'Recepcionista Operativo'}</span>
          </div>
        </div>

        {/* Bloque de Información detallada */}
        <div className="perfil-details-grid">
          <div className="detail-card">
            <div className="detail-icon-box">
              <UserCheck size={18} />
            </div>
            <div className="detail-info">
              <span className="detail-label">Nombre de Usuario</span>
              <p className="detail-value">{usuario.username || 'No especificado'}</p>
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-icon-box">
              <KeyRound size={18} />
            </div>
            <div className="detail-info">
              <span className="detail-label">Nivel de Acceso</span>
              <p className="detail-value">
                {esAdmin ? 'Control Total & Reportes' : 'Registro de Entradas / Salidas'}
              </p>
            </div>
          </div>
        </div>

        {/* Botón de Salida */}
        <footer className="perfil-footer">
          <button 
            className="btn-logout-glass" 
            onClick={() => {
              localStorage.clear();
              navigate('/');
            }}
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Perfil;