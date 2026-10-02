import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserSearch, 
  Phone, 
  CreditCard, 
  ArrowLeft, 
  History, 
  X, 
  User,
  ChevronRight,
  Calendar,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './GestionVisitantes.css';

const GestionVisitantes = () => {
  const [visitantes, setVisitantes] = useState([]);
  const [historialVisitante, setHistorialVisitante] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [visitanteSeleccionado, setVisitanteSeleccionado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVisitantes = async () => {
      try {
        const resV = await axios.get('http://localhost:3000/api/visitantes');
        setVisitantes(resV.data);
      } catch (err) {
        console.error("Error al cargar la lista de visitantes", err);
      }
    };
    fetchVisitantes();
  }, []);

  const abrirHistorial = async (visitante) => {
    setVisitanteSeleccionado(visitante);
    setCargandoHistorial(true);
    try {
      const idTarget = visitante.id_visitante || visitante.id;
      const res = await axios.get(`http://localhost:3000/api/visitantes/${idTarget}/historial`);
      setHistorialVisitante(res.data);
    } catch (error) {
      console.error("Error al obtener el historial del visitante", error);
      setHistorialVisitante([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const cerrarModal = () => {
    setVisitanteSeleccionado(null);
    setHistorialVisitante([]);
  };

  const filtrados = visitantes.filter(v => 
    (v.nombre_completo && v.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())) ||
    (v.numero_documento && v.numero_documento.includes(busqueda))
  );

  return (
    <div className="visitantes-page">
      <header className="visitantes-header-glass">
        <div className="header-left">
          <button 
            onClick={() => navigate('/inicio')} 
            className="btn-volver" 
            title="Volver al Inicio"
          >
            <ArrowLeft size={18} />
            <span>Volver</span>
          </button>
          <div className="header-title">
            <h1>Directorio de Visitantes</h1>
            <p>Gestión y consulta de registros históricos — Clínica Meta</p>
          </div>
        </div>

        <div className="search-bar-modern">
          <UserSearch className="icon-search" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o número de documento..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </header>

      <main className="visitantes-content">
        <div className="cards-grid">
          {filtrados.length > 0 ? (
            filtrados.map((v) => (
              <div key={v.id_visitante || v.id} className="visitante-card">
                <div className="card-avatar">
                  {(v.foto || v.foto_perfil_url) ? (
                    <img src={v.foto || v.foto_perfil_url} alt={v.nombre_completo} className="avatar-img" />
                  ) : (
                    <div className="avatar-placeholder">
                      <User size={32} />
                    </div>
                  )}
                </div>

                <div className="card-user-info">
                  <h3>{v.nombre_completo}</h3>
                  <div className="info-item">
                    <CreditCard size={14} className="info-icon" /> 
                    <span className="doc-text">{v.tipo_documento || 'CC'}: {v.numero_documento}</span>
                  </div>
                  <div className="info-item">
                    <Phone size={14} className="info-icon" /> 
                    <span>{v.telefono || 'Sin teléfono registrado'}</span>
                  </div>
                </div>

                <div className="card-footer">
                  <button 
                    className="btn-ver-historial" 
                    onClick={() => abrirHistorial(v)}
                  >
                    <span>Ver historial</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state-card">
              <UserSearch size={44} />
              <p>No se encontraron visitantes con ese criterio.</p>
            </div>
          )}
        </div>
      </main>

      {visitanteSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <header className="modal-header">
              <h2>Detalles del Visitante</h2>
              <button className="btn-close" onClick={cerrarModal}>
                <X size={20} />
              </button>
            </header>
            
            <div className="perfil-resumen">
              <div className="modal-avatar">
                {visitanteSeleccionado.foto ? (
                  <img src={visitanteSeleccionado.foto} alt="Perfil" />
                ) : (
                  <User size={36} />
                )}
              </div>
              <div className="modal-user-meta">
                <h3 className="modal-name">{visitanteSeleccionado.nombre_completo}</h3>
                <span className="modal-doc">{visitanteSeleccionado.tipo_documento || 'CC'}: {visitanteSeleccionado.numero_documento}</span>
              </div>
            </div>

            <div className="historial-section-title">
              <History size={16} />
              <span>Historial de Visitas en Clínica Meta</span>
            </div>
            
            <div className="historial-lista">
              {cargandoHistorial ? (
                <div className="no-history">
                  <p>Cargando historial de visitas...</p>
                </div>
              ) : historialVisitante.length > 0 ? (
                historialVisitante.map((vis, index) => (
                  <div key={vis.id_visita || index} className="historial-item">
                    <div className="historial-row">
                      <span className="historial-fecha">
                        <Calendar size={13} style={{ display: 'inline', marginRight: '6px' }} />
                        {new Date(vis.fecha_entrada).toLocaleDateString()} - {new Date(vis.fecha_entrada).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <span className="piso-tag">
                        <MapPin size={11} style={{ display: 'inline', marginRight: '4px' }} />
                        {vis.area_destino}
                      </span>
                    </div>
                    <div className="historial-footer">
                      <small>Paciente visitado: <strong>{vis.nombre_paciente || 'No especificado'}</strong></small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-history">
                  <p>Este usuario no registra ingresos previos.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionVisitantes;