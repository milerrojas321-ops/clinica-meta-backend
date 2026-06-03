import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, User, Lock, ShieldCheck, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
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
  const navigate = useNavigate();

  // useEffect(() => {
  //   const verificarPermisos = async () => {
  //     try {
  //       // Intentamos una petición protegida
  //       await axios.get('http://localhost:3000/api/visitas/historial');
  //     } catch (error) {
  //       if (error.response && error.response.status === 401) {
  //         localStorage.clear();
  //         navigate('/');
  //       }
  //     }
  //   };
  //   verificarPermisos();
  // }, [navigate]);

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
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Error al registrar: El usuario ya existe o falló el servidor';
      setStatus({ type: 'error', msg: errorMsg });
    }
  };

  return (
    <div className="register-admin-container">
      <div className="register-card">
        <header className="register-header">
          <button onClick={() => navigate('/inicio')} className="btn-back-minimal" title="Volver al inicio">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1>Nuevo Personal</h1>
            <p>Registro de acceso para personal autorizado</p>
          </div>
        </header>

        {status.msg && (
          <div className={`status-banner ${status.type}`}>
            {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {status.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          {/* Los inputs mantienen sus nombres originales */}
          <div className="input-field">
            <label><User size={16} /> Nombre Completo</label>
            <input 
              name="nombre_completo" 
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
                placeholder="••••••••" 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="input-field">
            <label><ShieldCheck size={16} /> Rol en el Sistema</label>
            <select name="rol" onChange={handleChange} className="select-modern">
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
    </div>
  );
};

export default RegistroUsuarios;