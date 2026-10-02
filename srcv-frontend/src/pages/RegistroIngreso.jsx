import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import { Camera, UserCheck, CreditCard, Phone, User, MapPin, RefreshCw, Search, AlertCircle, CheckCircle, Bed, Repeat, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './RegistroIngreso.css';

const RegistroIngreso = () => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    numero_documento: '',
    telefono: '',
    id_paciente: null,
    nombre_paciente: '',
    cama_paciente: '',
    area_destino: '', 
    es_acompanante: false
  });

  const [visitanteOriginal, setVisitanteOriginal] = useState(null);
  const [datosModificados, setDatosModificados] = useState(false);

  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [busquedaPaciente, setBusquedaPaciente] = useState('');
  const [resultadosPaciente, setResultadosPaciente] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  const [acompananteActivo, setAcompananteActivo] = useState(null);
  const [areasDisponibles, setAreasDisponibles] = useState([]);
  const [imgSrc, setImgSrc] = useState(null);
  const [fotoVencida, setFotoVencida] = useState(false);
  const [fotoExistente, setFotoExistente] = useState(false);
  const [actualizarFoto, setActualizarFoto] = useState(true);
  
  // Estado para la configuración de foto obligatoria
  const [requiereFoto, setRequiereFoto] = useState(false);

  const webcamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarAreas = async () => {
      try {
        const respuesta = await axios.get('http://localhost:3000/api/config/areas');
        setAreasDisponibles(respuesta.data);
      } catch (error) {
        setAreasDisponibles([{ id: 1, nombre: 'UCI' }, { id: 2, nombre: 'Urgencias' }]);
      }
    };

    const cargarParametros = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/config/parametros');
        if (res.data.requiere_foto_visitante !== undefined) {
          setRequiereFoto(res.data.requiere_foto_visitante);
        }
      } catch (error) {
        console.error("No se pudo consultar parametro de fotografia.");
      }
    };

    cargarAreas();
    cargarParametros();
  }, []);

  useEffect(() => {
    const buscarVisitante = async () => {
      if (busqueda.trim().length < 2) {
        setResultadosBusqueda([]);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:3000/api/visitantes/buscar?q=${busqueda}`);
        setResultadosBusqueda(res.data);
      } catch (err) {
        console.error("Error buscando visitante", err);
      }
    };

    const timer = setTimeout(() => buscarVisitante(), 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  useEffect(() => {
    const buscarPaciente = async () => {
      if (busquedaPaciente.trim().length < 2) {
        setResultadosPaciente([]);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:3000/api/pacientes/buscar?q=${busquedaPaciente}`);
        setResultadosPaciente(res.data);
      } catch (err) {
        console.error("Error buscando paciente", err);
      }
    };

    const timer = setTimeout(() => buscarPaciente(), 300);
    return () => clearTimeout(timer);
  }, [busquedaPaciente]);

  const seleccionarVisitante = (vis) => {
    const datosVis = {
      nombres: vis.nombres || '',
      apellidos: vis.apellidos || '',
      numero_documento: vis.numero_documento || '',
      telefono: vis.telefono || ''
    };

    setFormData((prev) => ({
      ...prev,
      ...datosVis
    }));

    setVisitanteOriginal(datosVis);
    setDatosModificados(false);

    const dias = vis.dias_foto !== null ? vis.dias_foto : 999;
    const esVencida = dias >= 15 || !vis.foto;

    setFotoVencida(esVencida);
    setFotoExistente(!esVencida);
    setImgSrc(esVencida ? null : vis.foto);
    setActualizarFoto(esVencida);
    setResultadosBusqueda([]);
    setBusqueda('');
  };

  const seleccionarPaciente = async (paciente) => {
    if (!paciente.permite_visitas) {
      alert(`El paciente ${paciente.nombre_completo} tiene restricción médica y NO permite visitas.`);
      return;
    }

    setPacienteSeleccionado(paciente);
    setFormData((prev) => ({
      ...prev,
      id_consulta: paciente.id_consulta,
      id_paciente: paciente.id_paciente,
      nombre_paciente: paciente.nombre_completo,
      cama_paciente: paciente.cama,
      area_destino: paciente.nombre_area
    }));

    setResultadosPaciente([]);
    setBusquedaPaciente('');

    try {
      const token = localStorage.getItem('tokenClinica');
      const res = await axios.get(
        `http://localhost:3000/api/visitas/acompanante/${paciente.id_consulta}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.tieneAcompanante) {
        setAcompananteActivo(res.data.acompanante);
      } else {
        setAcompananteActivo(null);
      }
    } catch (error) {
      setAcompananteActivo(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, type, checked, value } = e.target;
    const val = type === 'checkbox' ? checked : value;

    const nuevoFormData = { ...formData, [name]: val };
    setFormData(nuevoFormData);

    if (visitanteOriginal && (name === 'nombres' || name === 'apellidos' || name === 'numero_documento')) {
      const huboCambio = 
        nuevoFormData.nombres.trim().toLowerCase() !== visitanteOriginal.nombres.trim().toLowerCase() ||
        nuevoFormData.apellidos.trim().toLowerCase() !== visitanteOriginal.apellidos.trim().toLowerCase() ||
        nuevoFormData.numero_documento.trim() !== visitanteOriginal.numero_documento.trim();

      if (huboCambio) {
        setDatosModificados(true);
        setImgSrc(null);
        setFotoExistente(false);
        setFotoVencida(false);
        setActualizarFoto(true);
      } else {
        setDatosModificados(false);
      }
    }
  };

  const capturarFoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
      setActualizarFoto(true);
    }
  }, [webcamRef]);

  const retomarFoto = () => {
    setImgSrc(null);
    setActualizarFoto(true);
  };

  const confirmarRegistro = async () => {
    if (!formData.numero_documento || !formData.nombres || !formData.apellidos) {
      return alert("Complete los datos requeridos del visitante.");
    }

    if (datosModificados && requiereFoto && !imgSrc) {
      return alert("Ha modificado los datos de la persona. Por motivos de seguridad, debe capturar una nueva fotografía.");
    }

    if (!formData.id_paciente && !formData.nombre_paciente) {
      return alert("Debe seleccionar o especificar un paciente a visitar.");
    }

    // Validación condicional de la foto según configuración
    if (requiereFoto && !imgSrc) {
      return alert("La fotografía es obligatoria según la configuración del sistema.");
    }

    try {
      const token = localStorage.getItem('tokenClinica');
      const payload = {
        ...formData,
        foto_perfil_url: imgSrc || null,
        actualizarFoto: actualizarFoto,
        id_relevo_salida: (formData.es_acompanante && acompananteActivo) ? acompananteActivo.id_visita : null
      };

      const res = await axios.post(
        'http://localhost:3000/api/visitas/ingreso', 
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message || 'Registro completado exitosamente.');
      navigate('/inicio');
    } catch (error) {
      const mensajeError = error.response?.data?.message || 'Error al registrar el ingreso.';
      alert(mensajeError);
    }
  };

  return (
    <div className="ingreso-container">
      <div className="ingreso-card">
        <header className="ingreso-header">
          <div className="title-group">
            <h1>Registro de Visitante</h1>
            <p>Busque un visitante existente o registre uno nuevo</p>
          </div>
        </header>

        {/* Buscador de Visitantes */}
        <div className="search-box-container" style={{ position: 'relative', marginBottom: '25px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label><Search size={16} /> Buscar Visitante Frecuente (por Nombre o Cédula)</label>
            <input 
              type="text" 
              placeholder="Escriba la cédula o nombre del visitante..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {resultadosBusqueda.length > 0 && (
            <div className="search-results-dropdown">
              {resultadosBusqueda.map((v) => (
                <div key={v.id} className="search-result-item" onClick={() => seleccionarVisitante(v)}>
                  <div>
                    <strong>{v.nombre_completo}</strong>
                    <small>Doc: {v.numero_documento}</small>
                  </div>
                  <span className={`status-badge ${v.dias_foto < 15 ? 'badge-ok' : 'badge-alert'}`}>
                    {v.dias_foto < 15 ? 'Foto Vigente' : 'Foto Vencida'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ingreso-grid">
          {/* Columna Izquierda: Formulario */}
          <section className="form-section">
            <div className="input-group">
              <label><CreditCard size={16} /> Documento de Identidad del Visitante</label>
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
                <label><Phone size={16} /> Teléfono</label>
                <input name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="Ej: 310..." />
              </div>

              <div className="input-group">
                <label><MapPin size={16} /> Área de Destino</label>
                <input 
                  type="text"
                  name="area_destino" 
                  value={formData.area_destino || 'Se asigna automáticamente al seleccionar paciente'} 
                  readOnly
                  disabled
                  style={{ 
                    backgroundColor: '#e9ecef', 
                    cursor: 'not-allowed', 
                    color: formData.area_destino ? '#212529' : '#6c757d',
                    fontStyle: formData.area_destino ? 'normal' : 'italic',
                    fontWeight: formData.area_destino ? '600' : 'normal'
                  }}
                />
              </div>
            </div>

            {/* Buscador de Paciente */}
            <div className="search-box-container" style={{ position: 'relative' }}>
              <div className="input-group">
                <label><UserCheck size={16} /> Paciente a Visitar (Buscar por Cédula o Nombre)</label>
                <input 
                  type="text" 
                  placeholder="Escriba el nombre o cédula del paciente..." 
                  value={busquedaPaciente}
                  onChange={(e) => setBusquedaPaciente(e.target.value)}
                />
              </div>

              {resultadosPaciente.length > 0 && (
                <div className="search-results-dropdown">
                  {resultadosPaciente.map((p) => (
                    <div key={p.id} className="search-result-item" onClick={() => seleccionarPaciente(p)}>
                      <div>
                        <strong>{p.nombre_completo}</strong>
                        <small>Doc: {p.numero_documento} | Área: {p.nombre_area} ({p.cama})</small>
                      </div>
                      <span className={`status-badge ${p.permite_visitas ? 'badge-ok' : 'badge-alert'}`}>
                        {p.permite_visitas ? 'Permite Visita' : 'Sin Visitas'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tarjeta del Paciente Seleccionado */}
            {pacienteSeleccionado && (
              <div className="paciente-selected-card">
                <div>
                  <strong>Paciente: {formData.nombre_paciente}</strong>
                  <div className="paciente-meta">
                    <span><MapPin size={14} /> {formData.area_destino}</span>
                    <span><Bed size={14} /> {formData.cama_paciente}</span>
                  </div>
                </div>
                <button 
                  className="btn-clear-paciente"
                  onClick={() => {
                    setPacienteSeleccionado(null);
                    setAcompananteActivo(null);
                    setFormData(prev => ({ 
                      ...prev, 
                      id_consulta: null, 
                      id_paciente: null, 
                      nombre_paciente: '', 
                      cama_paciente: '', 
                      area_destino: '', 
                      es_acompanante: false 
                    }));
                  }}
                >
                  Quitar
                </button>
              </div>
            )}

            {/* NOTIFICACIÓN DE RELEVO */}
            {pacienteSeleccionado && acompananteActivo && (
              <div className="relevo-alert-box">
                <div className="relevo-alert-header">
                  <Repeat size={18} />
                  <strong>Relevo de Acompañante Detectado</strong>
                </div>
                <p>
                  El paciente ya cuenta con un acompañante dentro: <strong>{acompananteActivo.nombres} {acompananteActivo.apellidos}</strong> (Cédula: {acompananteActivo.numero_documento}).
                </p>
                <small>Al registrar la entrada de esta persona, se cerrará automáticamente el acceso del acompañante anterior.</small>
              </div>
            )}

            {/* SECTOR TIPO DE VISITA */}
            <div className="tipo-visita-selector">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  name="es_acompanante" 
                  checked={formData.es_acompanante} 
                  onChange={handleInputChange} 
                />
                <span className="checkmark"></span>
                <div className="tipo-visita-text">
                  <strong><ShieldCheck size={16} /> Acompañante Permanente / Relevo</strong>
                  <small>Marcar si ingresa como cuidador continuo del paciente</small>
                </div>
              </label>
            </div>
          </section>

          {/* Columna Derecha: Cámara (Opcional según config) */}
          <section className="camera-section">
            <label className="label-center">
              <Camera size={16} /> Fotografía del Visitante {requiereFoto ? '(Obligatoria)' : '(Opcional)'}
            </label>

            {datosModificados && requiereFoto && (
              <div className="photo-status-alert alert-warning">
                <AlertTriangle size={16} /> Ha modificado los datos de la persona. Tome una nueva fotografía por seguridad.
              </div>
            )}

            {!datosModificados && fotoVencida && requiereFoto && (
              <div className="photo-status-alert alert-warning">
                <AlertCircle size={16} /> La foto superó los 15 días de antigüedad. Debe capturar una nueva.
              </div>
            )}

            {!datosModificados && fotoExistente && !actualizarFoto && (
              <div className="photo-status-alert alert-success">
                <CheckCircle size={16} /> Fotografía vigente. Puedes conservarla o actualizarla.
              </div>
            )}

            <div className="camera-wrapper">
              {!imgSrc ? (
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="webcam-pro" />
              ) : (
                <img src={imgSrc} alt="Preview" className="photo-preview" />
              )}
              
              {!imgSrc ? (
                <button onClick={capturarFoto} className="btn-capture">Capturar Foto</button>
              ) : (
                <button onClick={retomarFoto} className="btn-retake">
                  <RefreshCw size={16} /> Capturar Nueva Foto / Borrar
                </button>
              )}
            </div>
          </section>
        </div>

        <footer className="ingreso-footer">
          <button className="btn-cancel" onClick={() => navigate('/inicio')}>Cancelar</button>
          <button className="btn-confirm" onClick={confirmarRegistro}>
            <UserCheck size={20} /> {formData.es_acompanante && acompananteActivo ? 'Confirmar Relevo e Ingreso' : 'Finalizar Registro'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default RegistroIngreso;