import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import { Camera, UserCheck, CreditCard, Phone, User, MapPin, RefreshCw, Scan } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './RegistroIngreso.css';

const RegistroIngreso = () => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    numero_documento: '',
    telefono: '',
    nombre_paciente: '',
    area_destino: 'UCI',
    stringCapturado: ''
  });

  const [imgSrc, setImgSrc] = useState(null);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const capturarFoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  const simularEscaneo = () => {
    setFormData({
      ...formData,
      nombres: "MILLER STIVEN",
      apellidos: "GARCIA",
      numero_documento: "1121900000",
      stringCapturado: "DATA_PDF417_SIMULADO_CLINICA_META"
    });
  };

  const confirmarRegistro = async () => {
    if (!imgSrc) return alert("La fotografía es obligatoria.");
    try {
      await axios.post('http://localhost:3000/api/visitas/ingreso', {
        ...formData,
        foto_perfil_url: imgSrc,
        id_usuario: 1 
      });
      alert('Registro completado exitosamente.');
      navigate('/inicio');
    } catch (error) {
      alert('Error en el servidor. Verifique los datos.');
    }
  };

  return (
    <div className="ingreso-container">
      <div className="ingreso-card">
        <header className="ingreso-header">
          <div className="title-group">
            <h1>Registro de Visitante</h1>
            <p>Complete la información para autorizar el acceso</p>
          </div>
          <button onClick={simularEscaneo} className="btn-scan-sim">
            <Scan size={18} /> Simular Escaneo
          </button>
        </header>

        <div className="ingreso-grid">
          {/* Columna Izquierda: Formulario */}
          <section className="form-section">
            <div className="input-group">
              <label><CreditCard size={16} /> Identificación (Editable)</label>
              <input 
                name="numero_documento" 
                value={formData.numero_documento} 
                onChange={handleInputChange} 
                placeholder="Número de cédula"
              />
            </div>

            <div className="input-row">
              <div className="input-group">
                <label><User size={16} /> Nombres</label>
                <input name="nombres" value={formData.nombres} onChange={handleInputChange} placeholder="Nombres" />
              </div>
              <div className="input-group">
                <label>Apellidos</label>
                <input name="apellidos" value={formData.apellidos} onChange={handleInputChange} placeholder="Apellidos" />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label><Phone size={16} /> Teléfono de Contacto</label>
                <input name="telefono" onChange={handleInputChange} placeholder="Ej: 310..." />
              </div>
              <div className="input-group">
                <label><MapPin size={16} /> Área de Destino</label>
                <select name="area_destino" onChange={handleInputChange}>
                  <option value="UCI">Unidad de Cuidados Intensivos (UCI)</option>
                  <option value="Piso 4">Hospitalización - Piso 4</option>
                  <option value="Urgencias">Urgencias</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label><UserCheck size={16} /> Paciente a Visitar</label>
              <input name="nombre_paciente" onChange={handleInputChange} placeholder="Nombre completo del paciente" />
            </div>
          </section>

          {/* Columna Derecha: Cámara */}
          <section className="camera-section">
            <label className="label-center"><Camera size={16} /> Registro Fotográfico</label>
            <div className="camera-wrapper">
              {!imgSrc ? (
                <Webcam 
                  audio={false} 
                  ref={webcamRef} 
                  screenshotFormat="image/jpeg" 
                  className="webcam-pro"
                />
              ) : (
                <img src={imgSrc} alt="Preview" className="photo-preview" />
              )}
              
              {!imgSrc ? (
                <button onClick={capturarFoto} className="btn-capture">Capturar Foto</button>
              ) : (
                <button onClick={() => setImgSrc(null)} className="btn-retake">
                  <RefreshCw size={16} /> Tomar otra
                </button>
              )}
            </div>
          </section>
        </div>

        <footer className="ingreso-footer">
          <button className="btn-cancel" onClick={() => navigate('/inicio')}>Cancelar</button>
          <button className="btn-confirm" onClick={confirmarRegistro}>
            <UserCheck size={20} /> Finalizar Registro
          </button>
        </footer>
      </div>
    </div>
  );
};

export default RegistroIngreso;