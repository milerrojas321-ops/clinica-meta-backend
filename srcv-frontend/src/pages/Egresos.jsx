import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  Users, 
  FileText, 
  Calendar,
  RefreshCw,
  LogOut,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import './Egresos.css';

const Egresos = () => {
  const [pestanaActiva, setPestanaActiva] = useState('confirmar');

  const [busqueda, setBusqueda] = useState('');
  const [pacienteInfo, setPacienteInfo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [observaciones, setObservaciones] = useState('');

  const [historialEgresos, setHistorialEgresos] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [filtroFechaFin, setFiltroFechaFin] = useState(
    new Date().toISOString().split('T')[0]
  );

  const navigate = useNavigate();

  // Obtener datos del usuario en sesión y verificar si es administrador
  const usuarioSesion = JSON.parse(localStorage.getItem('usuarioClinica')) || {};
  const esAdmin = usuarioSesion?.rol === 'administrador';

  const cargarResumenHoy = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/egresos/hoy');
      if (pestanaActiva === 'historial' && !filtroTexto) {
        setHistorialEgresos(res.data);
      }
    } catch (err) {
      console.error('Error al cargar resumen de egresos', err);
    }
  };

  const cargarHistorialCompleto = async () => {
    setCargandoHistorial(true);
    try {
      const res = await axios.get('http://localhost:3000/api/egresos/historial', {
        params: {
          fechaInicio: filtroFechaInicio,
          fechaFin: filtroFechaFin,
          busqueda: filtroTexto
        }
      });
      setHistorialEgresos(res.data);
    } catch (err) {
      console.error('Error al cargar historial completo de egresos', err);
      cargarResumenHoy();
    } finally {
      setCargandoHistorial(false);
    }
  };

  useEffect(() => {
    cargarResumenHoy();
  }, []);

  useEffect(() => {
    if (pestanaActiva === 'historial') {
      cargarHistorialCompleto();
    }
  }, [pestanaActiva, filtroFechaInicio, filtroFechaFin]);

  const handleBuscarPaciente = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) return;

    setCargando(true);
    setMensaje(null);
    setPacienteInfo(null);
    setObservaciones('');

    try {
      const res = await axios.get(`http://localhost:3000/api/egresos/buscar-dinamica?criterio=${busqueda}`);
      
      if (res.data.encontrado === false) {
        setMensaje({ 
          tipo: 'error', 
          texto: res.data.mensaje || 'No se encontró ningún paciente con consulta activa.' 
        });
      } else {
        setPacienteInfo(res.data);
      }
    } catch (err) {
      setMensaje({ 
        tipo: 'error', 
        texto: 'Error de conexión con el servidor.' 
      });
    } finally {
      setCargando(false);
    }
  };

  const handleFinalizarSalida = async () => {
    if (!pacienteInfo || !pacienteInfo.puedeSalir) return;

    const idUsuario = usuarioSesion?.id_usuario || 
                      usuarioSesion?.idUsuario || 
                      usuarioSesion?.id;

    if (!idUsuario) {
      setMensaje({ 
        tipo: 'error', 
        texto: 'No se encontró la información del orientador en la sesión. Por favor vuelve a iniciar sesión.' 
      });
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/egresos/confirmar-salida', {
        id_consulta: pacienteInfo.id_consulta,
        id_paciente: pacienteInfo.id_paciente,
        documento: pacienteInfo.documento,
        nombre: pacienteInfo.nombre,
        id_usuario: idUsuario,
        observaciones
      });

      setMensaje({ tipo: 'exito', texto: 'Salida física registrada con éxito, cama liberada y visitas cerradas.' });
      setPacienteInfo(null);
      setBusqueda('');
      setObservaciones('');
      cargarResumenHoy();
    } catch (err) {
      setMensaje({ 
        tipo: 'error', 
        texto: err.response?.data?.mensaje || 'Error al registrar la salida física del paciente.' 
      });
    }
  };

  const aplicarRangoFecha = (dias) => {
    const hoy = new Date();
    const fin = hoy.toISOString().split('T')[0];
    
    const inicioDate = new Date();
    inicioDate.setDate(hoy.getDate() - dias);
    const inicio = inicioDate.toISOString().split('T')[0];

    setFiltroFechaInicio(inicio);
    setFiltroFechaFin(fin);
  };

  const descargarReporte = async (tipo) => {
    try {
      const token = localStorage.getItem('tokenClinica');

      const response = await axios.get(`http://localhost:3000/api/egresos/exportar-${tipo}`, {
        params: {
          fechaInicio: filtroFechaInicio,
          fechaFin: filtroFechaFin,
          busqueda: filtroTexto
        },
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_egresos.${tipo === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Error al exportar a ${tipo}:`, err);
      alert(`No se pudo descargar el reporte de egresos en ${tipo.toUpperCase()}.`);
    }
  };

  const egresosFiltrados = historialEgresos.filter(item => {
    if (!filtroTexto.trim()) return true;
    const busq = filtroTexto.toLowerCase();
    const nombre = (item.nombre_paciente || item.nombre || '').toLowerCase();
    const doc = (item.documento || '').toLowerCase();
    const orientador = (item.orientador || '').toLowerCase();
    const area = (item.area || '').toLowerCase();

    return nombre.includes(busq) || doc.includes(busq) || orientador.includes(busq) || area.includes(busq);
  });

  return (
    <div className="egresos-layout">
      <header className="egresos-header-glass">
        <div className="header-top-bar">
          <button className="btn-volver" onClick={() => navigate('/inicio')}>
            <ArrowLeft size={18} />
            <span>Volver</span>
          </button>
          
          <div className="header-title-group">
            <h2>Módulo de Egresos y Portería</h2>
            <p className="subtitle">Gestión de salidas físicas e historial cronológico de altas</p>
          </div>

          <div className="metrics-bar">
            <div className="metric-chip">
              <UserCheck size={20} className="icon-blue" />
              <div className="metric-info">
                <span className="metric-val">{historialEgresos.length}</span>
                <span className="metric-lbl">Egresos en Vista</span>
              </div>
            </div>
          </div>
        </div>

        <div className="egresos-tabs-bar">
          <button
            className={`tab-btn ${pestanaActiva === 'confirmar' ? 'active' : ''}`}
            onClick={() => setPestanaActiva('confirmar')}
          >
            <LogOut size={16} />
            <span>Registrar Salida</span>
          </button>

          <button
            className={`tab-btn ${pestanaActiva === 'historial' ? 'active' : ''}`}
            onClick={() => setPestanaActiva('historial')}
          >
            <Clock size={16} />
            <span>Historial Ordenado por Fecha</span>
          </button>
        </div>

        {pestanaActiva === 'confirmar' && (
          <form className="filtro-bar" onSubmit={handleBuscarPaciente}>
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Buscar por cédula o nombre del paciente..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-buscar-egreso" disabled={cargando}>
              {cargando ? 'Consultando...' : 'Consultar Paciente'}
            </button>
          </form>
        )}
      </header>

      <main className="egresos-content">
        {pestanaActiva === 'confirmar' && (
          <>
            {mensaje && (
              <div className={`alert-banner ${mensaje.tipo}`}>
                {mensaje.tipo === 'exito' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                <span>{mensaje.texto}</span>
              </div>
            )}

            {pacienteInfo && (
              <div className="paciente-card-glass">
                <div className="paciente-header">
                  <div>
                    <h3>{pacienteInfo.nombre}</h3>
                    <span className="doc-badge">CC: {pacienteInfo.documento}</span>
                  </div>

                  <div className="status-container">
                    <span className={`status-pill-boleta ${pacienteInfo.estaListoDinamica ? 'aprobado' : 'pendiente'}`}>
                      {pacienteInfo.estaListoDinamica ? (
                        <><CheckCircle2 size={16} /> Listo en Dinámica</>
                      ) : (
                        <><ShieldAlert size={16} /> Pendiente Dinámica</>
                      )}
                    </span>

                    <span className={`status-pill-boleta ${pacienteInfo.tienePlus ? 'aprobado' : 'pendiente'}`}>
                      {pacienteInfo.tienePlus ? (
                        <><Sparkles size={16} /> Autorización Plus OK</>
                      ) : (
                        <><XCircle size={16} /> Sin Autorización Plus</>
                      )}
                    </span>
                  </div>
                </div>

                {pacienteInfo.yaEgreso && (
                  <div className="egreso-confirmado-box">
                    <div className="egreso-confirmado-header">
                      <Clock size={18} />
                      <span>Paciente con Egreso Confirmado</span>
                    </div>
                    
                    <div className="egreso-confirmado-grid">
                      <div>
                        <span>Fecha y Hora Salida:</span>
                        <strong>{pacienteInfo.hora_egreso ? new Date(pacienteInfo.hora_egreso).toLocaleString() : 'Fecha no especificada'}</strong>
                      </div>
                      <div>
                        <span>Registrado por:</span>
                        <strong>{pacienteInfo.orientador_egreso || 'Orientador Sistema'}</strong>
                      </div>
                    </div>

                    {pacienteInfo.observaciones && (
                      <div className="egreso-confirmado-obs">
                        <span>Observaciones del Egreso:</span>
                        <p>"{pacienteInfo.observaciones}"</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="paciente-detalles-grid">
                  <div className="detalle-box">
                    <span className="lbl">Área / Pabellón:</span>
                    <span className="val">{pacienteInfo.area || 'Sin especificar'}</span>
                  </div>
                  <div className="detalle-box">
                    <span className="lbl">Cama / Ubicación:</span>
                    <span className="val">{pacienteInfo.cama || 'Cama liberada'}</span>
                  </div>
                </div>

                {pacienteInfo.puedeSalir && (
                  <div className="egreso-opciones-container">
                    {pacienteInfo.tieneVisitasActivas && (
                      <div className="advertencia-visitas-activas">
                        <Users size={18} />
                        <span>Este paciente tiene visitas o acompañantes activos. Al confirmar la salida, el sistema cerrará automáticamente su ingreso.</span>
                      </div>
                    )}

                    <div className="campo-textarea-group">
                      <label>
                        <FileText size={14} /> Observaciones / Notas de Salida:
                      </label>
                      <textarea 
                        rows={2}
                        placeholder="Ej. El paciente se retira caminando junto a su familiar, en silla de ruedas, etc."
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="paciente-footer">
                  {!pacienteInfo.puedeSalir && !pacienteInfo.yaEgreso && (
                    <p className="advertencia-requisitos-salida">
                      * El paciente requiere estar <strong>Listo en Dinámica</strong> y contar con <strong>Autorización Plus</strong> para completar la salida.
                    </p>
                  )}
                  <button 
                    className="btn-finalizar-salida" 
                    disabled={!pacienteInfo.puedeSalir}
                    onClick={handleFinalizarSalida}
                  >
                    <CheckCircle2 size={18} />
                    {pacienteInfo.yaEgreso ? 'Salida Ya Registrada' : 'Confirmar Salida Física'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {pestanaActiva === 'historial' && (
          <div className="historial-container">
            <div className="panel-filtros-glass">
              <div className="filtros-wrapper">
                <div className="buscador-input-box">
                  <Search size={16} className="icon-search" />
                  <input 
                    type="text"
                    placeholder="Filtrar por paciente, documento, área o usuario..."
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                  />
                </div>

                <div className="fechas-grupo">
                  <div className="fecha-picker-item">
                    <Calendar size={14} className="icon-cal" />
                    <span>Desde:</span>
                    <input 
                      type="date" 
                      value={filtroFechaInicio}
                      onChange={(e) => setFiltroFechaInicio(e.target.value)}
                    />
                  </div>

                  <div className="fecha-picker-item">
                    <Calendar size={14} className="icon-cal" />
                    <span>Hasta:</span>
                    <input 
                      type="date" 
                      value={filtroFechaFin}
                      onChange={(e) => setFiltroFechaFin(e.target.value)}
                    />
                  </div>

                  <div className="rangos-rapidos-grupo">
                    <button className="btn-rango-rapido" onClick={() => aplicarRangoFecha(0)}>Hoy</button>
                    <button className="btn-rango-rapido" onClick={() => aplicarRangoFecha(1)}>Ayer</button>
                    <button className="btn-rango-rapido" onClick={() => aplicarRangoFecha(7)}>7 Días</button>
                  </div>

                  <button 
                    className="btn-refresh-historial"
                    onClick={cargarHistorialCompleto}
                    title="Actualizar"
                  >
                    <RefreshCw size={16} className={cargandoHistorial ? 'spin-icon' : ''} />
                  </button>

                  {/* Renderizado condicional: Solo se muestra si es Administrador */}
                  {esAdmin && (
                    <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                      <button 
                        onClick={() => descargarReporte('excel')} 
                        className="btn-rango-rapido"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#107c41', color: '#fff', border: 'none' }}
                      >
                        <FileSpreadsheet size={15} /> Exportar Excel
                      </button>
                      <button 
                        onClick={() => descargarReporte('pdf')} 
                        className="btn-rango-rapido"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#bb2d3b', color: '#fff', border: 'none' }}
                      >
                        <FileText size={15} /> Exportar PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="tabla-historial-container">
              <div className="tabla-scroll-wrapper">
                <table className="tabla-egresos">
                  <thead>
                    <tr>
                      <th>Fecha y Hora Salida</th>
                      <th>Paciente</th>
                      <th>Documento</th>
                      <th>Área / Pabellón</th>
                      <th>Registrado Por</th>
                      <th>Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargandoHistorial ? (
                      <tr>
                        <td colSpan="6" className="td-vacio">
                          Cargando historial de egresos...
                        </td>
                      </tr>
                    ) : egresosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="td-vacio">
                          No se encontraron registros de egresos para el criterio o rango seleccionado.
                        </td>
                      </tr>
                    ) : (
                      egresosFiltrados.map((egreso, index) => (
                        <tr 
                          key={egreso.id_egreso || index}
                          className={index % 2 === 0 ? 'row-even' : 'row-odd'}
                        >
                          <td className="td-fecha" data-label="Fecha y Hora">
                            <div className="cell-content">
                              <Clock size={14} />
                              <span>{new Date(egreso.fecha_salida).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </div>
                          </td>
                          <td className="td-paciente" data-label="Paciente">
                            {egreso.nombre_paciente || egreso.nombre}
                          </td>
                          <td className="td-documento" data-label="Documento">
                            {egreso.documento}
                          </td>
                          <td data-label="Área / Pabellón">
                            <span className="badge-area">
                              <Building2 size={12} />
                              {egreso.area || 'Hospitalización'}
                            </span>
                          </td>
                          <td className="td-orientador" data-label="Registrado Por">
                            {egreso.orientador || egreso.orientador_egreso || 'Orientador Sistema'}
                          </td>
                          <td className="td-observaciones" data-label="Observaciones">
                            {egreso.observaciones ? `"${egreso.observaciones}"` : 'Sin observaciones'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Egresos;