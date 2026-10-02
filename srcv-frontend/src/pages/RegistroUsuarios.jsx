import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, User, Lock, ShieldCheck, Mail, ArrowLeft, CheckCircle, AlertCircle, UserCheck, UserX, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './RegistroUsuarios.css';

const RegistroUsuarios = () => {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    username: '',
    password: '',
    rol: 'recepcionista'
  });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

  const cargarUsuarios = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/auth/usuarios');
      if (res.data.success) {
        setUsuarios(res.data.usuarios);
      }
    } catch (err) {
      console.error("Error al cargar lista de usuarios", err);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', msg: 'Procesando registro...' });
    
    try {
      const res = await axios.post('http://localhost:3000/api/auth/register', formData);
      if (res.data.success) {
        setStatus({ type: 'success', msg: 'Personal autorizado correctamente' });
        setFormData({ nombre_completo: '', username: '', password: '', rol: 'recepcionista' });
        cargarUsuarios();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Error al registrar: El usuario ya existe o falló el servidor';
      setStatus({ type: 'error', msg: errorMsg });
    }
  };

  const toggleEstadoUsuario = async (u) => {
    const idUsuario = u.id_usuario || u.id;
    const nuevoEstado = !u.activo;
    try {
      await axios.patch(`http://localhost:3000/api/auth/usuarios/${idUsuario}/estado`, {
        activo: nuevoEstado
      });
      cargarUsuarios();
    } catch (err) {
      alert("Error al cambiar el estado del usuario.");
    }
  };

  return (
    <div className="register-admin-container">
      <header className="page-header-global">
        <button onClick={() => navigate('/inicio')} className="btn-back-minimal" title="Volver al inicio">
          <ArrowLeft size={22} />
        </button>
        <div className="color-letter-header">
          <h1>Registro y Gestión de Usuarios</h1>
          <p>Administración de credenciales y control de accesos del personal</p>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL CON DOS CUADROS INDEPENDIENTES */}
      <div className="admin-panels-wrapper">
        
        {/* CUADRO 1: FORMULARIO DE REGISTRO */}
        <div className="register-card panel-card">
          <div className="panel-header">
            <h2><UserPlus size={22} /> Nuevo Registro</h2>
            <p>Registrar un nuevo usuario en la plataforma</p>
          </div>

          {status.msg && (
            <div className={`status-banner ${status.type}`}>
              {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {status.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="input-field">
              <label><User size={16} /> Nombre Completo</label>
              <input 
                name="nombre_completo" 
                value={formData.nombre_completo}
                placeholder="Ej. Dr. Mario García" 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="input-group-half">
              <div className="input-field">
                <label><Mail size={16} /> Usuario (Login)</label>
                <input 
                  name="username" 
                  value={formData.username}
                  placeholder="mgarcia24" 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="input-field">
                <label><Lock size={16} /> Contraseña</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password}
                  placeholder="••••••••" 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="input-field">
              <label><ShieldCheck size={16} /> Rol en el Sistema</label>
              <select name="rol" value={formData.rol} onChange={handleChange} className="select-modern">
                <option value="recepcionista">Recepcionista (control limitado)</option>
                <option value="administrador">Administrador (Control total)</option>
              </select>
            </div>

            <button type="submit" className="btn-register-orange">
              <UserPlus size={20} />
              Autorizar Usuario
            </button>
          </form>
        </div>

        {/* CUADRO 2: CONTROL DE USUARIOS REGISTRADOS */}
        <div className="control-card panel-card">
          <div className="panel-header">
            <h2><Users size={22} /> Control de Usuarios</h2>
            <p>Activar o desactivar usuarios del sistema</p>
          </div>

          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-table">No hay usuarios registrados</td>
                  </tr>
                ) : (
                  usuarios.map((u) => {
                    const esActivo = u.activo === 1 || u.activo === true;
                    return (
                      <tr key={u.id_usuario || u.id}>
                        <td className="font-medium">{u.nombre_completo}</td>
                        <td className="text-subtle">{u.username}</td>
                        <td>
                          <span className="badge-role">{u.rol}</span>
                        </td>
                        <td>
                          <span className={`badge-status ${esActivo ? 'activo' : 'inactivo'}`}>
                            {esActivo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            onClick={() => toggleEstadoUsuario(u)}
                            title={esActivo ? "Desactivar usuario" : "Activar usuario"}
                            className={`btn-toggle-status ${esActivo ? 'btn-desactivar' : 'btn-activar'}`}
                          >
                            {esActivo ? <UserX size={16} /> : <UserCheck size={16} />}
                            {esActivo ? 'Desactivar' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegistroUsuarios;