import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Calendar, 
  User, 
  ArrowLeft, 
  Users, 
  Clock, 
  MapPin, 
  FileText,
  CheckCircle2,
  LogOut,
  FileSpreadsheet
} from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import './HistorialVisitas.css';

const HistorialVisitas = () => {
  const [visitas, setVisitas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const navigate = useNavigate();

  // Obtener datos del usuario en sesión y verificar si es administrador
  const usuarioSesion = JSON.parse(localStorage.getItem('usuarioClinica')) || {};
  const esAdmin = usuarioSesion?.rol === 'administrador';

  const handleSalida = async (id) => {
    if (window.confirm("¿Confirmar salida del visitante?")) {
      try {
        await axios.put(`http://localhost:3000/api/visitas/salida/${id}`);
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

  const descargarReporteVisitas = async (tipo) => {
    try {
      const token = localStorage.getItem('tokenClinica');

      const response = await axios.get(`http://localhost:3000/api/visitas/exportar-${tipo}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_visitas.${tipo === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Error al exportar a ${tipo}:`, err);
      alert(`No se pudo descargar el archivo ${tipo.toUpperCase()}. Verifica tus permisos.`);
    }
  };

  const visitasFiltradas = visitas.filter((v) => {
    const nombreVisitante = `${v.nombres || ''} ${v.apellidos || ''}`.toLowerCase();
    const documento = (v.numero_documento || '').toLowerCase();
    const personaVisitada = (v.nombre_paciente || '').toLowerCase();

    const datosRegistro = `${nombreVisitante} ${documento} ${personaVisitada}`;
    const palabrasBusqueda = busqueda.toLowerCase().trim().split(/\s+/);

    const coincideBusqueda = palabrasBusqueda.every((palabra) => 
      datosRegistro.includes(palabra)
    );

    const coincideFecha = filtroFecha ? v.fecha_entrada?.includes(filtroFecha) : true;

    return coincideBusqueda && coincideFecha;
  });

  return (
    <div className="historial-layout">
      <header className="historial-header-glass">
        <div className="header-top-bar">
          <button onClick={() => navigate('/inicio')} className="btn-volver">
            <ArrowLeft size={18} />
            <span>Volver</span>
          </button>
          
          <div className="header-title-group">
            <h2>Historial de Accesos</h2>
            <p className="subtitle">Gestión y monitoreo en tiempo real de visitas — Clínica Meta</p>
          </div>

          <div className="metrics-bar">
            <div className="metric-chip">
              <Users size={20} className="icon-blue" />
              <div className="metric-info">
                <span className="metric-val">{visitasFiltradas.length}</span>
                <span className="metric-lbl">Registros</span>
              </div>
            </div>
          </div>
        </div>

        <div className="filtro-bar" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ flex: 1 }}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar por paciente, visitante o documento..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="date-input-wrapper">
            <Calendar size={18} className="date-icon" />
            <input 
              type="date" 
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
            />
          </div>

          {/* Renderizado condicional: Solo se muestra si es Administrador */}
          {esAdmin && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => descargarReporteVisitas('excel')} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#107c41',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                <FileSpreadsheet size={16} /> Excel
              </button>
              <button 
                onClick={() => descargarReporteVisitas('pdf')} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#bb2d3b',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                <FileText size={16} /> PDF
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="historial-content">
        <div className="tabla-container-glass">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Visitante</th>
                <th>Destino y Paciente</th>
                <th>Fecha / Hora Entrada</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {visitasFiltradas.length > 0 ? (
                visitasFiltradas.map((v) => (
                  <tr key={v.id_visita} className="row-hover">
                    <td>
                      <span className="documento-badge">{v.numero_documento || 'Sin doc'}</span>
                    </td>
                    <td>
                      <div className="user-info-cell">
                        <div className="avatar-wrapper">
                          {v.foto_perfil_url ? (
                            <img src={v.foto_perfil_url} alt="Visitante" className="avatar-img" />
                          ) : (
                            <div className="avatar-placeholder"><User size={20} /></div>
                          )}
                        </div>
                        <div className="user-text">
                          <span className="user-name">
                            {v.visitante_completo || `${v.nombres || ''} ${v.apellidos || ''}`.trim() || 'Desconocido'}
                          </span>
                          <span className="user-sub">Visitante Autorizado</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="visit-detail">
                        <MapPin size={14} className="icon-blue" />
                        <span>{v.area_destino}</span>
                      </div>
                      <div className="visit-detail patient">
                        <User size={14} className="icon-muted" />
                        <span>Paciente: <strong>{v.nombre_paciente || 'No especificado'}</strong></span>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <span className="date-main">{new Date(v.fecha_entrada).toLocaleDateString()}</span>
                        <span className="date-hour">
                          <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          {new Date(v.fecha_entrada).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </td>
                    <td>
                      {v.fecha_salida ? (
                        <span className="status-pill completado">
                          <CheckCircle2 size={13} /> Completado
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleSalida(v.id_visita)} 
                          className="btn-marcar-salida"
                        >
                          <LogOut size={13} /> Marcar Salida
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state-container">
                      <FileText size={44} />
                      <p>No se encontraron registros que coincidan con la búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default HistorialVisitas;