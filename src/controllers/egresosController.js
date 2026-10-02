const axios = require('axios');
const db = require('../database/db');
const EgresoModel = require('../models/egresosModel');
const ReportesService = require('../services/reportesService');

/**
 * Exporta el historial de egresos a Excel
 */
const exportarEgresosExcel = async (req, res) => {
  const { fechaInicio, fechaFin, busqueda } = req.query;
  try {
    const egresos = await EgresoModel.obtenerHistorial(fechaInicio, fechaFin, busqueda);

    const columnas = [
      { header: 'ID Consulta', key: 'id_consulta', width: 12 },
      { header: 'Documento', key: 'documento', width: 15 },
      { header: 'Nombre Paciente', key: 'nombre_paciente', width: 30 },
      { header: 'Área / Pabellón', key: 'area', width: 20 },
      { header: 'Orientador', key: 'orientador', width: 25 },
      { header: 'Fecha Salida', key: 'fecha_salida_formateada', width: 22 },
      { header: 'Observaciones', key: 'observaciones', width: 35 }
    ];

    const datosFormateados = egresos.map(e => ({
      ...e,
      fecha_salida_formateada: new Date(e.fecha_salida).toLocaleString('es-CO')
    }));

    await ReportesService.generarExcel({
      res,
      nombreHoja: 'Egresos',
      titulo: 'Historial de Egresos de Pacientes',
      columnas,
      datos: datosFormateados,
      nombreArchivo: `Egresos_ClinicaMeta_${new Date().toISOString().split('T')[0]}`
    });
  } catch (error) {
    console.error('Error exportando Excel de egresos:', error);
    res.status(500).json({ mensaje: 'Error al exportar a Excel.' });
  }
};

/**
 * Exporta el historial de egresos a PDF
 */
const exportarEgresosPDF = async (req, res) => {
  const { fechaInicio, fechaFin, busqueda } = req.query;
  try {
    const egresos = await EgresoModel.obtenerHistorial(fechaInicio, fechaFin, busqueda);

    const headers = [
      { label: "Documento", property: "documento", width: 80 },
      { label: "Paciente", property: "nombre_paciente", width: 130 },
      { label: "Área", property: "area", width: 90 },
      { label: "Orientador", property: "orientador", width: 100 },
      { label: "Fecha Salida", property: "fecha_salida", width: 110 }
    ];

    const rows = egresos.map(e => [
      e.documento || '',
      e.nombre_paciente || '',
      e.area || 'Hospitalización',
      e.orientador || 'Orientador Sistema',
      new Date(e.fecha_salida).toLocaleString('es-CO')
    ]);

    await ReportesService.generarPDF({
      res,
      titulo: 'Historial Oficial de Egresos',
      headers,
      rows,
      nombreArchivo: `Egresos_ClinicaMeta_${new Date().toISOString().split('T')[0]}`,
      orientacion: 'landscape'
    });
  } catch (error) {
    console.error('Error exportando PDF de egresos:', error);
    res.status(500).json({ mensaje: 'Error al exportar a PDF.' });
  }
};

// Mantenemos las funciones existentes...
const obtenerEgresosHoy = async (req, res) => {
  try {
    const egresos = await EgresoModel.obtenerHoy();
    res.json(egresos);
  } catch (error) {
    console.error('Error al obtener egresos del día:', error);
    res.status(500).json({ mensaje: 'Error al consultar el historial de egresos.' });
  }
};

const obtenerHistorialEgresos = async (req, res) => {
  const { fechaInicio, fechaFin, busqueda } = req.query;
  try {
    const historial = await EgresoModel.obtenerHistorial(fechaInicio, fechaFin, busqueda);
    res.json(historial);
  } catch (error) {
    console.error('Error al consultar el historial de egresos:', error);
    res.status(500).json({ mensaje: 'Error interno al consultar el historial.' });
  }
};

const buscarPacienteDinamica = async (req, res) => {
  const { criterio } = req.query;
  if (!criterio) return res.status(400).json({ mensaje: 'El parámetro de búsqueda es obligatorio.' });

  try {
    let paciente = await EgresoModel.buscarPacienteEnDinamica(criterio);

    if (!paciente) {
      return res.status(200).json({ 
        encontrado: false, 
        mensaje: 'No se encontró ningún paciente con ese criterio que tenga consulta activa.' 
      });
    }

    let estaListoDinamica = paciente.estado_dinamica === 'listo_para_salida';

    if ((paciente.estado === 'Activo' || paciente.estado_consulta === 'Activo') && paciente.documento && !estaListoDinamica) {
      try {
        const urlWebhook = `http://192.168.11.137:5678/webhook/validar-salida-paciente?documento=${paciente.documento}`;
        const responseDinamica = await axios.get(urlWebhook, { timeout: 3000 });

        if (responseDinamica.data && (responseDinamica.data.ORDEN_SALIDA_CONSECUTIVO || responseDinamica.data.INGRESO_CONSECUTIVO)) {
          await db.query(
            `UPDATE consultas SET estado_dinamica = 'listo_para_salida' WHERE id_consulta = ?`,
            [paciente.id_consulta]
          );
          estaListoDinamica = true;
          paciente.estado_dinamica = 'listo_para_salida';
        }
      } catch (errWebhook) {
        console.warn(`[Webhook Dinámica] No se pudo validar la orden para ${paciente.documento}:`, errWebhook.message);
      }
    }

    const estadoActual = paciente.estado || paciente.estado_consulta;
    const yaEgreso = paciente.total_egresos > 0 || estadoActual === 'Alta' || estadoActual === 'Inactivo';
    const tienePlus = Boolean(paciente.autoriza_plus) || estaListoDinamica;
    const puedeSalir = !yaEgreso && estaListoDinamica;

    res.json({
      encontrado: true,
      ...paciente,
      estaListoDinamica,
      tienePlus,
      yaEgreso,
      puedeSalir,
      tieneVisitasActivas: paciente.visitas_activas > 0
    });
  } catch (error) {
    console.error('Error al buscar paciente:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor al consultar paciente.' });
  }
};

const confirmarSalida = async (req, res) => {
  const { id_consulta, id_paciente, documento, nombre, id_usuario, observaciones } = req.body;
  const targetConsulta = id_consulta || id_paciente;

  if (!targetConsulta || !documento || !id_usuario) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios para registrar el egreso.' });
  }

  try {
    await EgresoModel.registrarSalida(targetConsulta, documento, nombre, id_usuario, observaciones || '');
    try {
      await db.query(
        `UPDATE consultas SET estado_dinamica = 'egresado' WHERE id_consulta = ?`,
        [targetConsulta]
      );
    } catch (errOpt) {
      console.warn('Aviso al actualizar estado_dinamica:', errOpt.message);
    }

    res.json({ mensaje: 'Salida física registrada exitosamente.' });
  } catch (error) {
    console.error('Error al registrar salida:', error);
    res.status(500).json({ mensaje: 'Error al procesar la salida física del paciente.' });
  }
};

module.exports = {
  obtenerEgresosHoy,
  obtenerHistorialEgresos,
  buscarPacienteDinamica,
  confirmarSalida,
  exportarEgresosExcel,
  exportarEgresosPDF
};