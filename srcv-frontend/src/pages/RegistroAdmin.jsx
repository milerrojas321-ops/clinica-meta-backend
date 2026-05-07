import React, { useState } from 'react';
import axios from 'axios';
import './RegistroAdmin.css';

const RegistroAdmin = () => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    documento: '',
    usuario: '',
    password: '',
    rol: 'recepcionista' // Valor por defecto
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/api/auth/register', formData);
      alert('Administrador registrado con éxito');
    } catch (err) {
      alert('Error al registrar: ' + err.response.data.mensaje);
    }
  };

  return (
    <div className="admin-container">
      <form className="admin-card" onSubmit={handleSubmit}>
        <h2>Registro de Personal</h2>
        <p>Crea cuentas para recepcionistas y personal autorizado.</p>

        <input type="text" name="nombreCompleto" placeholder="Nombre Completo" onChange={handleChange} required />
        <input type="text" name="documento" placeholder="Cédula de Ciudadanía" onChange={handleChange} required />
        <input type="text" name="usuario" placeholder="Nombre de Usuario (Login)" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Contraseña Temporal" onChange={handleChange} required />
        
        <select name="rol" onChange={handleChange}>
          <option value="recepcionista">Recepcionista</option>
          <option value="supervisor">Supervisor</option>
          <option value="admin">Administrador Global</option>
        </select>

        <button type="submit" className="btn-save">GUARDAR USUARIO</button>
      </form>
    </div>
  );
};

export default RegistroAdmin;