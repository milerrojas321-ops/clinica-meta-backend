import React, { useState, useEffect } from 'react';
import axios from 'axios';
// AGREGA ESTOS ICONOS A LA LISTA: Users, Clock, MapPin, FileText
import { 
  Search, 
  Calendar, 
  User, 
  ArrowLeft, 
  Users, 
  Clock, 
  MapPin, 
  FileText 
} from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import './HistorialVisitas.css';

const HistorialVisitas = () => {
  const [visitas, setVisitas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const navigate = useNavigate();

  const handleSalida = async (id) => {
    if (window.confirm("¿Confirmar salida del visitante?")) {
      try {
        await axios.put(`http://localhost:3000/api/visitas/salida/${id}`);
        // Recargar los datos para actualizar la tabla
        const res = await axios.get('http://localhost:3000/api/visitas');
        setVisitas(res.data);
      } catch (err) {
        alert("Error al registrar la salida");
      }
    }
  };

  useEffect(() => {
    const obtenerVisitas = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/visitas');
        setVisitas(res.data);
      } catch (err) {
        console.error("Error al traer el historial", err);
      }
    };
    obtenerVisitas();
  }, []);

  const visitasFiltradas = visitas.filter((v) => {
    const nombreCompleto = `${v.nombres || ''} ${v.apellidos || ''}`.toLowerCase();
    const coincideBusqueda = 
      nombreCompleto.includes(busqueda.toLowerCase()) ||
      (v.numero_documento && v.numero_documento.includes(busqueda));
    const coincideFecha = filtroFecha ? v.fecha_entrada.includes(filtroFecha) : true;
    return coincideBusqueda && coincideFecha;
  });

  return (
    <div className="historial-layout">
      {/* Sidebar o Barra lateral decorativa opcional puede ir aquí */}
      <div className="historial-main">
        <header className="historial-header-premium">
          <div className="header-left">
            <button onClick={() => navigate('/inicio')} className="btn-back-circle">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1>Historial de Accesos</h1>
              <p className="subtitle">Gestión y monitoreo de visitas - Clínica Meta</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <Users className="icon-blue" size={20} />
              <div>
                <span className="stat-value">{visitasFiltradas.length}</span>
                <span className="stat-label">Registros</span>
              </div>
            </div>
          </div>
        </header>

        <section className="filtros-container-premium">
          <div className="search-box-premium">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, apellido o documento..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="date-box-premium">
            <Calendar size={20} className="date-icon" />
            <input 
              type="date" 
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
            />
          </div>
        </section>

        <div className="tabla-container-premium">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Identificación</th>
                <th>Visitante</th>
                <th>Detalles de Visita</th>
                <th>Fecha y Hora</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {visitasFiltradas.length > 0 ? (
                visitasFiltradas.map((v) => (
                  <tr key={v.id_visita} className="row-hover">
                    <td className="col-id">
                      <div className="documento-badge">{v.numero_documento}</div>
                    </td>
                    <td className="col-user">
                      <div className="user-info-cell">
                        <div className="avatar-wrapper">
                          {v.foto_perfil_url ? (
                            <img src={v.foto_perfil_url} alt="Visitante" className="avatar-img" />
                          ) : (
                            <div className="avatar-placeholder"><User size={20} /></div>
                          )}
                        </div>
                        <div className="user-text">
                          <span className="user-name">{`${v.nombres} ${v.apellidos}`}</span>
                          <span className="user-sub">Visitante Autorizado</span>
                        </div>
                      </div>
                    </td>
                    <td className="col-details">
                      <div className="visit-detail">
                        <MapPin size={14} className="icon-detail" />
                        <span>{v.area_destino}</span>
                      </div>
                      <div className="visit-detail patient">
                        <Clock size={14} className="icon-detail" />
                        <span>Paciente: {v.nombre_paciente}</span>
                      </div>
                    </td>
                    <td className="col-date">
                      <div className="date-cell">
                        <span className="date-main">{new Date(v.fecha_entrada).toLocaleDateString()}</span>
                        <span className="date-hour">{new Date(v.fecha_entrada).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </td>
                    <td className="col-status">
                      {v.fecha_salida ? (
                        <span className="status-pill salió">Completado</span>
                      ) : (
                        <button 
                          onClick={() => handleSalida(v.id_visita)} 
                          className="btn-marcar-salida"
                        >
                          Marcar Salida
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <FileText size={48} />
                    <p>No se encontraron registros que coincidan con la búsqueda</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistorialVisitas;