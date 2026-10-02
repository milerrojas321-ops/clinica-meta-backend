import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bed, Search, Filter, ArrowLeft, AlertCircle, CheckCircle2, Users, UserCheck } from 'lucide-react';
import './controlCamas.css';

const ControlCamas = () => {
  const [camasData, setCamasData] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [areaSeleccionada, setAreaSeleccionada] = useState('TODAS');
  const navigate = useNavigate();

  const cargarControlCamas = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/control-camas');
      setCamasData(response.data);
    } catch (error) {
      console.error("Error cargando control de camas", error);
    }
  };

  useEffect(() => {
    cargarControlCamas();
    const interval = setInterval(cargarControlCamas, 10000);
    return () => clearInterval(interval);
  }, []);

  const areasDisponibles = ['TODAS', ...new Set(camasData.map(item => item.area).filter(Boolean))];

  // Filtrado de camas por nombre, documento, cama y área
  const camasFiltradas = camasData.filter((item) => {
    const busquedaLower = busqueda.toLowerCase().trim();
    
    const coincideTexto = 
      (item.paciente && item.paciente.toLowerCase().includes(busquedaLower)) ||
      (item.documento && String(item.documento).toLowerCase().includes(busquedaLower)) ||
      (item.cama && item.cama.toLowerCase().includes(busquedaLower));

    const coincideArea = areaSeleccionada === 'TODAS' || item.area === areaSeleccionada;

    return coincideTexto && coincideArea;
  });

  const totalPacientes = camasFiltradas.length;
  const camasLlenas = camasFiltradas.filter(c => c.visitantes_actuales >= c.max_visitantes).length;
  const totalVisitasActivas = camasFiltradas.reduce((acc, item) => acc + (Number(item.visitantes_actuales) || 0), 0);

  return (
    <div className="control-camas-layout">
      <header className="control-camas-header">
        <div className="header-top-bar">
          <button className="btn-volver" onClick={() => navigate('/inicio')}>
            <ArrowLeft size={18} />
            <span>Volver</span>
          </button>
          
          <div className="header-title-group">
            <h2>Control de Camas y Aforo</h2>
            <p className="subtitle">Monitoreo en tiempo real de ocupación y visitantes por área</p>
          </div>

          <div className="metrics-bar">
            <div className="metric-chip">
              <Bed size={20} className="icon-blue" />
              <div className="metric-info">
                <span className="metric-val">{totalPacientes}</span>
                <span className="metric-lbl">Pacientes</span>
              </div>
            </div>
            <div className="metric-chip">
              <UserCheck size={20} className="icon-green" />
              <div className="metric-info">
                <span className="metric-val">{totalVisitasActivas}</span>
                <span className="metric-lbl">Visitas Activas</span>
              </div>
            </div>
            <div className="metric-chip">
              <AlertCircle size={20} className="icon-amber" />
              <div className="metric-info">
                <span className="metric-val">{camasLlenas}</span>
                <span className="metric-lbl">Aforo Lleno</span>
              </div>
            </div>
          </div>
        </div>

        <div className="filtro-bar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar por cédula, paciente o cama..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="select-input-wrapper">
            <Filter size={18} className="filter-icon" />
            <select 
              value={areaSeleccionada} 
              onChange={(e) => setAreaSeleccionada(e.target.value)}
            >
              {areasDisponibles.map((area, idx) => (
                <option key={idx} value={area}>
                  {area === 'TODAS' ? 'Todas las áreas' : area}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="control-camas-content">
        <div className="camas-grid">
          {camasFiltradas.length === 0 ? (
            <div className="sin-resultados-card">
              <AlertCircle size={40} />
              <p>No se encontraron camas o pacientes con los criterios especificados.</p>
            </div>
          ) : (
            camasFiltradas.map((item) => {
              const estaLleno = item.visitantes_actuales >= item.max_visitantes;
              const porcentaje = Math.min(100, Math.round((item.visitantes_actuales / item.max_visitantes) * 100));

              let visitantes = [];
              try {
                visitantes = typeof item.lista_visitantes === 'string'
                  ? JSON.parse(item.lista_visitantes || '[]')
                  : item.lista_visitantes || [];
              } catch (error) {
                visitantes = [];
              }

              const listaFiltrada = visitantes.filter(Boolean);

              return (
                <div key={item.id_consulta} className={`cama-card ${estaLleno ? 'cama-llena' : 'cama-disponible'}`}>
                  <div className="cama-card-header">
                    <div className="badge-cama">
                      <Bed size={16} />
                      <span>{item.cama}</span>
                    </div>
                    <span className={`badge-cupo ${estaLleno ? 'cupo-lleno' : 'cupo-ok'}`}>
                      {estaLleno ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                      {item.visitantes_actuales} / {item.max_visitantes} Aforo
                    </span>
                  </div>

                  <div className="progress-bar-container">
                    <div 
                      className={`progress-bar-fill ${estaLleno ? 'fill-lleno' : 'fill-ok'}`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>

                  <div className="paciente-info">
                    <h3>{item.paciente}</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                      <span className="area-badge">{item.area}</span>
                      <small style={{ color: '#94a3b8', fontSize: '0.8rem' }}>CC: {item.documento}</small>
                    </div>
                  </div>

                  <div className="visitantes-seccion">
                    <span className="visitantes-titulo">
                      <Users size={14} />
                      Visitantes dentro ({listaFiltrada.length})
                    </span>

                    <div className="visitantes-dento-list">
                      {listaFiltrada.length > 0 ? (
                        listaFiltrada.map((vis) => (
                          <div key={vis.id_visita} className="mini-visitante-item">
                            <img 
                              src={vis.foto || 'https://via.placeholder.com/40'} 
                              alt={vis.visitante} 
                              className="avatar-mini" 
                            />
                            <div className="visitante-detalles">
                              <strong>{vis.visitante}</strong>
                              <span className={`rol-tag ${vis.es_acompanante ? 'tag-acomp' : 'tag-visita'}`}>
                                {vis.es_acompanante ? 'Acompañante' : 'Visitante'}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="sin-visitas">
                          <span>Sin visitas activas</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default ControlCamas;