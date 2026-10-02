import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Settings, MapPin, Shield, Database, Plus, Trash2, ArrowLeft, Users, Edit2, Check, X, Camera } from 'lucide-react';
import './Configuracion.css';

const Configuracion = () => {
  const navigate = useNavigate();
  const [nuevaArea, setNuevaArea] = useState('');
  const [maxVisitantes, setMaxVisitantes] = useState(1);
  const [areas, setAreas] = useState([]);
  const [tiempoExpiracion, setTiempoExpiracion] = useState('1h');
  const [requiereFoto, setRequiereFoto] = useState(false);

  // Estados para modo edición
  const [editandoId, setEditandoId] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editMaxVisitantes, setEditMaxVisitantes] = useState(1);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/config/areas');
        setAreas(res.data);
      } catch (error) {
        console.error("Error al cargar áreas", error);
      }
    };

    const fetchParametros = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/config/parametros');
        if (res.data.requiere_foto_visitante !== undefined) {
          setRequiereFoto(res.data.requiere_foto_visitante);
        }
      } catch (error) {
        console.error("Error al cargar parámetros", error);
      }
    };

    fetchAreas();
    fetchParametros();
  }, []);

  const handleToggleFoto = async (e) => {
    const valor = e.target.checked;
    setRequiereFoto(valor);
    try {
      await axios.post('http://localhost:3000/api/config/parametros', {
        clave: 'requiere_foto_visitante',
        valor: valor
      });
    } catch (error) {
      alert("Error al actualizar la configuración de la cámara.");
      setRequiereFoto(!valor);
    }
  };

  const agregarArea = async () => {
    if (nuevaArea.trim()) {
      try {
        const res = await axios.post('http://localhost:3000/api/config/areas', { 
          nombre: nuevaArea,
          max_visitantes: maxVisitantes 
        });
        setAreas([...areas, res.data]);
        setNuevaArea('');
        setMaxVisitantes(1);
      } catch (error) {
        alert("Error al guardar el área");
      }
    }
  };

  const iniciarEdicion = (area) => {
    setEditandoId(area.id);
    setEditNombre(area.nombre);
    setEditMaxVisitantes(area.max_visitantes || 1);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditNombre('');
    setEditMaxVisitantes(1);
  };

  const guardarEdicion = async (id) => {
    if (!editNombre.trim()) return alert("El nombre no puede estar vacío.");

    try {
      const res = await axios.put(`http://localhost:3000/api/config/areas/${id}`, {
        nombre: editNombre,
        max_visitantes: editMaxVisitantes
      });

      setAreas(areas.map(a => a.id === id ? res.data : a));
      cancelarEdicion();
    } catch (error) {
      alert("Error al actualizar el área.");
    }
  };

  const eliminarArea = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/config/areas/${id}`);
      setAreas(areas.filter(area => area.id !== id));
    } catch (error) {
      const mensaje = error.response?.data?.message || "No se pudo eliminar el área.";
      alert(mensaje);
    }
  };

  const handleDescargarBackup = async () => {
    try {
      const respuesta = await axios.get('http://localhost:3000/api/auth/backup', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([respuesta.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_clinica_${new Date().toISOString().slice(0,10)}.sql`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      alert("No se pudo generar la copia de seguridad.");
    }
  };

  useEffect(() => {
    const verificarAcceso = async () => {
      try {
        await axios.get('http://localhost:3000/api/auth/verificar-sesion');
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/');
        }
      }
    };
    verificarAcceso();

    const usuario = JSON.parse(localStorage.getItem('usuarioClinica'));
    if (!usuario || usuario.rol !== 'administrador') {
      navigate('/inicio');
    }
  }, [navigate]);

  return (
    <div className="config-container">
      <div className="config-card">
        <header className="config-header">
          <button onClick={() => navigate('/inicio')} className="btn-back">
            <ArrowLeft size={20} />
          </button>
          <h1><Settings size={24} /> Configuración del Sistema</h1>
        </header>

        <div className="config-body">
          {/* SECCIÓN NUEVA: FOTO OBLIGATORIA */}
          <section className="config-section">
            <div className="section-title">
              <Camera size={18} />
              <h3>Captura de Fotografía</h3>
            </div>
            <p className="section-desc">Activa o desactiva la obligatoriedad de la fotografía al registrar visitantes.</p>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
              <span><strong>Exigir foto obligatoria al ingresar visitante</strong></span>
              <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  checked={requiereFoto} 
                  onChange={handleToggleFoto}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '500', color: requiereFoto ? '#2b8a3e' : '#868e96' }}>
                  {requiereFoto ? 'Obligatorio' : 'Activar Foto Obligatoria'}
                </span>
              </label>
            </div>
          </section>

          <section className="config-section">
            <div className="section-title">
              <MapPin size={18} />
              <h3>Gestión de Áreas Destino y Límites</h3>
            </div>
            <p className="section-desc">Añade, edita o elimina áreas especificando el límite de visitas simultáneas por paciente.</p>
            
            <div className="area-input-group">
              <input 
                type="text" 
                value={nuevaArea} 
                onChange={(e) => setNuevaArea(e.target.value)}
                placeholder="Ej: Sala de espera"
              />
              <input 
                type="number" 
                min="1"
                value={maxVisitantes} 
                onChange={(e) => setMaxVisitantes(e.target.value)}
                placeholder="Máx. Visitas"
                className="input-max-visitantes"
              />
              <button onClick={agregarArea} className="btn-add">
                <Plus size={18} /> Añadir
              </button>
            </div>

            <ul className="area-list">
              {areas.map((area, index) => (
                <li key={area.id || `area-${index}`}> 
                  {editandoId === area.id ? (
                    <div className="area-edit-row">
                      <input 
                        type="text" 
                        value={editNombre} 
                        onChange={(e) => setEditNombre(e.target.value)} 
                        className="input-edit-nombre"
                      />
                      <input 
                        type="number" 
                        min="1" 
                        value={editMaxVisitantes} 
                        onChange={(e) => setEditMaxVisitantes(e.target.value)} 
                        className="input-edit-num"
                      />
                      <button onClick={() => guardarEdicion(area.id)} className="btn-save-inline" title="Guardar">
                        <Check size={16} />
                      </button>
                      <button onClick={cancelarEdicion} className="btn-cancel-inline" title="Cancelar">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="area-info">
                        <strong>{area.nombre}</strong>
                        <small className="area-badge">
                          <Users size={14} /> Máx: {area.max_visitantes ?? 1} {area.max_visitantes === 1 ? 'visita' : 'visitas'}
                        </small>
                      </span>
                      <div className="area-actions">
                        <button onClick={() => iniciarEdicion(area)} className="btn-edit" title="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => eliminarArea(area.id)} className="btn-delete" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="config-section">
            <div className="section-title">
              <Shield size={18} />
              <h3>Seguridad de Sesión</h3>
            </div>
            <div className="security-session-container">
              <label htmlFor="tiempoExpiracion" className="text-token">
                Tiempo de expiración del token
              </label>
              <select 
                id="tiempoExpiracion"
                name="tiempoExpiracion" 
                value={tiempoExpiracion} 
                onChange={(e) => {
                  const nuevoTiempo = e.target.value;
                  setTiempoExpiracion(nuevoTiempo);
                  localStorage.setItem('tiempoSesionClinica', nuevoTiempo);
                }} 
              >
                <option value="1m">1 Minuto (Pruebas)</option>
                <option value="15m">15 Minutos</option>
                <option value="1h">1 Hora</option>
                <option value="1d">1 Día</option>
              </select>
            </div>
          </section>

          <section className="config-section backup-section">
            <div className="section-title backup-title">
              <Database size={18} />
              <h3>Base de Datos</h3>
            </div>
            <p className="section-desc backup-text">Respalda la información para evitar pérdidas por fallos en MySQL.</p>
            <button onClick={handleDescargarBackup} className="btn-backup">
              Generar Copia de Seguridad
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;