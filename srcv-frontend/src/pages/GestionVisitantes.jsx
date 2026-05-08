import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserSearch, 
  Phone, 
  CreditCard, 
  ArrowLeft, 
  History, 
  X, 
  User 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './GestionVisitantes.css';

const GestionVisitantes = () => {
  const [visitantes, setVisitantes] = useState([]);
  const [todasLasVisitas, setTodasLasVisitas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [visitanteSeleccionado, setVisitanteSeleccionado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carga de visitantes
        const resV = await axios.get('http://localhost:3000/api/visitantes');
        setVisitantes(resV.data);
        
        // Carga de historial para el modal de detalles
        const resH = await axios.get('http://localhost:3000/api/visitas');
        setTodasLasVisitas(resH.data);
      } catch (err) {
        console.error("Error al cargar datos", err);
      }
    };
    fetchData();
  }, []);

  const filtrados = visitantes.filter(v => 
    (v.nombre_completo && v.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())) ||
    (v.numero_documento && v.numero_documento.includes(busqueda))
  );

  return (
    <div className="visitantes-page">
      <header className="visitantes-header">
        <div className="header-left">
          <button 
            onClick={() => navigate('/inicio')} 
            className="back-circle" 
            title="Volver al Inicio"
          >
            <ArrowLeft size={24} />
            <span className="tooltip-text">Inicio</span>
          </button>
          <div>
            <h1>Directorio de Visitantes</h1>
            <p>Gestión y consulta de registros históricos</p>
          </div>
        </div>
      </header>

      <div className="search-container-modern">
        <div className="search-bar-modern">
          <UserSearch className="icon-search" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o número de cédula..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="cards-grid">
        {filtrados.length > 0 ? (
          filtrados.map((v) => (
            <div key={v.id} className="visitante-card">
              <div className="card-avatar">
                {v.foto ? (
                  <img src={v.foto} alt="Perfil" />
                ) : (
                  <div className="avatar-placeholder">
                    <User size={30} />
                  </div>
                )}
              </div>
              <div className="card-content">
                <h3>{v.nombre_completo}</h3>
                <div className="info-item">
                  <CreditCard size={14} /> 
                  <span>{v.tipo_documento}: {v.numero_documento}</span>
                </div>
                <div className="info-item">
                  <Phone size={14} /> 
                  <span>{v.telefono || 'Sin teléfono'}</span>
                </div>
              </div>
              <div className="card-footer">
                <button 
                  className="btn-ver-mas" 
                  onClick={() => setVisitanteSeleccionado(v)}
                >
                  Ver historial
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No se encontraron visitantes con ese criterio.</p>
          </div>
        )}
      </div>

      {/* MODAL DE DETALLES E HISTORIAL */}
      {visitanteSeleccionado && (
        <div className="modal-overlay" onClick={() => setVisitanteSeleccionado(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <header className="modal-header">
              <h2>Detalles del Visitante</h2>
              <button className="btn-close" onClick={() => setVisitanteSeleccionado(null)}>
                <X size={24} />
              </button>
            </header>
            
            <div className="perfil-resumen">
                <div className="modal-avatar">
                  {visitanteSeleccionado.foto ? (
                    <img src={visitanteSeleccionado.foto} alt="Perfil" />
                  ) : (
                    <User size={40} />
                  )}
                </div>
                <div>
                    <h3 className="modal-name">{visitanteSeleccionado.nombre_completo}</h3>
                    <p className="modal-doc">{visitanteSeleccionado.numero_documento}</p>
                </div>
            </div>

            <h4 className="historial-title">
              <History size={18} /> Historial de Visitas en Clínica Meta
            </h4>
            
            <div className="historial-lista">
              {todasLasVisitas
                .filter(vis => String(vis.numero_documento) === String(visitanteSeleccionado.numero_documento))
                .map((vis, index) => (
                  <div key={index} className="historial-item">
                    <div className="historial-row">
                        <span className="historial-fecha">
                          {new Date(vis.fecha_entrada).toLocaleDateString()} - {new Date(vis.fecha_entrada).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <span className="piso-tag">{vis.area_destino}</span>
                    </div>
                    <div className="historial-footer">
                      <small>Paciente visitado: <strong>{vis.nombre_paciente}</strong></small>
                    </div>
                  </div>
                ))}
              {todasLasVisitas.filter(vis => String(vis.numero_documento) === String(visitanteSeleccionado.numero_documento)).length === 0 && (
                <div className="no-history">
                  <p>Este usuario no tiene registros de visitas previas.</p>
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