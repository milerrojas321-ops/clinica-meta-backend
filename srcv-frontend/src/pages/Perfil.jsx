import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, LogOut, ArrowLeft } from 'lucide-react';
import './Perfil.css';

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
  const verificarSesion = async () => {
    try {
      // Validamos con el servidor antes de mostrar nada
      await axios.get('http://localhost:3000/api/auth/verificar-sesion');
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/');
      }
    }
  };
  verificarSesion();
}, [navigate]);

  useEffect(() => {
    const cargarDatosPerfil = async () => {
      try {
        // 1. Validamos sesión y traemos datos al mismo tiempo
        // Usamos la información guardada en localStorage o una petición al backend
        const datosGuardados = JSON.parse(localStorage.getItem('usuarioClinica'));
        
        // 2. Verificación proactiva con el servidor
        await axios.get('http://localhost:3000/api/auth/verificar-sesion');
        
        if (datosGuardados) {
          setUsuario(datosGuardados);
        }
      } catch (error) {
        // Si el token expiró (401), el interceptor o este catch sacarán al usuario
        if (error.response && error.response.status === 401) {
          localStorage.clear();
          navigate('/');
        }
      }
    };

    cargarDatosPerfil();
  }, [navigate]);

  if (!usuario) return null; // O un spinner de carga

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        <header className="perfil-header">
          <button onClick={() => navigate('/inicio')} className="btn-back">
            <ArrowLeft size={20} />
          </button>
          <h1>Mi Perfil</h1>
        </header>

        <div className="perfil-avatar-section">
          <div className="avatar-circle">
            <User size={50} />
          </div>
          <h2>{usuario.nombre_completo}</h2>
          <span className={`badge-rol ${usuario.rol}`}>
            {usuario.rol === 'administrador' ? 'Administrador' : 'Recepcionista'}
          </span>
        </div>

        <div className="perfil-info-grid">
          <div className="info-item">
            <label><Mail size={16} /> Usuario</label>
            <p>{usuario.username}</p>
          </div>
          <div className="info-item">
            <label><Shield size={16} /> Permisos</label>
            <p>{usuario.rol === 'administrador' ? 'Acceso Total' : 'Solo Registros'}</p>
          </div>
        </div>

        <footer className="perfil-footer">
          <button className="btn-logout" onClick={() => {
            localStorage.clear();
            navigate('/');
          }}>
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Perfil;