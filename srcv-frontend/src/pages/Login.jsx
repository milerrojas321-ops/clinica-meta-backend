import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importante para la navegación
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({ usuario: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Inicializamos el navegador


  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const res = await axios.post('http://localhost:3000/api/auth/login', credentials);
    
    if (res.data.success) {
      // ESTA ES LA LÍNEA NUEVA: Guardamos el objeto user (id, nombre, rol)
      localStorage.setItem('usuarioClinica', JSON.stringify(res.data.user));
      
      if (onLoginSuccess) onLoginSuccess(res.data.user);
      
      navigate('/inicio'); 
    }
  } catch (err) {
      if (err.response) {
        setError(err.response.data.mensaje || 'Error al conectar con el servidor');
      } else {
        // Este es el error que te sale si el servidor de Node está apagado
        setError('No se pudo establecer conexión con el backend');
      }
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="logo-placeholder">🏥</div>
        <h2>CLÍNICA META</h2>
        <p>Sistema de Registro de Visitas</p>
        
        {error && <div className="error-msg">{error}</div>}
        
        <input 
          type="text" 
          name="usuario" 
          placeholder="Nombre de Usuario" 
          onChange={handleChange} 
          required 
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Contraseña" 
          onChange={handleChange} 
          required 
        />
        
        <button type="submit" className="btn-login">INGRESAR</button>
      </form>
    </div>
  );
};

export default Login;