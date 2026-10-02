const Visitante = require('../models/Visitante');
const Visita = require('../models/Visita');
const Config = require('../models/configModel');
const db = require('../database/db');
const ReportesService = require('../services/reportesService');

const visitaController = {
    exportarVisitasExcel: async (req, res) => {
        try {
            const historial = await Visita.obtenerHistorialCompleto();

            const columnas = [
                { header: 'Documento', key: 'numero_documento', width: 15 },
                { header: 'Visitante', key: 'visitante_completo', width: 28 },
                { header: 'Paciente Visitado', key: 'nombre_paciente', width: 28 },
                { header: 'Área / Destino', key: 'area_destino', width: 20 },
                { header: 'Acompañante', key: 'tipo_visita', width: 15 },
                { header: 'Fecha Entrada', key: 'fecha_entrada_fmt', width: 20 },
                { header: 'Fecha Salida', key: 'fecha_salida_fmt', width: 20 }
            ];

            const datosFormateados = historial.map(v => ({
                ...v,
                tipo_visita: v.es_acompanante ? 'Sí' : 'No',
                fecha_entrada_fmt: v.fecha_entrada ? new Date(v.fecha_entrada).toLocaleString('es-CO') : '',
                fecha_salida_fmt: v.fecha_salida ? new Date(v.fecha_salida).toLocaleString('es-CO') : 'En instalaciones'
            }));

            await ReportesService.generarExcel({
                res,
                nombreHoja: 'Historial Visitas',
                titulo: 'Historial General de Visitas e Ingresos',
                columnas,
                datos: datosFormateados,
                nombreArchivo: `Historial_Visitas_${new Date().toISOString().split('T')[0]}`
            });
        } catch (error) {
            console.error('Error exportando Excel de visitas:', error);
            res.status(500).json({ error: 'Error al exportar historial de visitas a Excel' });
        }
    },

    exportarVisitasPDF: async (req, res) => {
        try {
            const historial = await Visita.obtenerHistorialCompleto();

            const headers = [
                { label: "Documento", property: "doc", width: 80 },
                { label: "Visitante", property: "visitante", width: 120 },
                { label: "Paciente", property: "paciente", width: 120 },
                { label: "Área", property: "area", width: 80 },
                { label: "Entrada", property: "entrada", width: 100 }
            ];

            const rows = historial.map(v => [
                v.numero_documento || '',
                v.visitante_completo || `${v.nombres || ''} ${v.apellidos || ''}`.trim(),
                v.nombre_paciente || 'No especificado',
                v.area_destino || '',
                v.fecha_entrada ? new Date(v.fecha_entrada).toLocaleString('es-CO') : ''
            ]);

            await ReportesService.generarPDF({
                res,
                titulo: 'Historial General de Control de Accesos',
                headers,
                rows,
                nombreArchivo: `Historial_Visitas_${new Date().toISOString().split('T')[0]}`,
                orientacion: 'landscape'
            });
        } catch (error) {
            console.error('Error exportando PDF de visitas:', error);
            res.status(500).json({ error: 'Error al exportar historial de visitas a PDF' });
        }
    },

    obtenerAcompananteActivo: async (req, res) => {
        try {
            const { id_paciente } = req.params;
            const acompanante = await Visita.buscarAcompananteActivo(id_paciente);
            res.json({ tieneAcompanante: !!acompanante, acompanante: acompanante || null });
        } catch (error) {
            res.status(500).json({ error: 'Error al consultar acompañante' });
        }
    },

    registrarVisita: async (req, res) => {
        try {
            const fotoARegistrar = req.body.foto || req.body.foto_perfil_url;
            const { id_consulta, id_paciente, area_destino, es_acompanante } = req.body;
            const targetConsulta = id_consulta || id_paciente;

            // Validar si la foto es requerida según configuración
            const parametros = await Config.getParametros();
            const fotoObligatoria = parametros.requiere_foto_visitante ?? false;

            if (fotoObligatoria && !fotoARegistrar) {
                return res.status(400).json({
                    success: false,
                    message: 'La fotografía del visitante es obligatoria según la configuración del sistema.'
                });
            }

            if (targetConsulta) {
                const [consultaExistente] = await db.query(
                    `SELECT id_consulta, estado FROM consultas WHERE id_consulta = ?`,
                    [targetConsulta]
                );

                if (!consultaExistente || consultaExistente.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'La consulta médica seleccionada ya no existe en el sistema.'
                    });
                }

                const estadoConsulta = consultaExistente[0].estado;
                if (estadoConsulta === 'Alta' || estadoConsulta === 'Inactivo') {
                    return res.status(400).json({
                        success: false,
                        message: `No se pueden registrar visitas para esta consulta porque su estado actual es '${estadoConsulta}'.`
                    });
                }
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'No se proporcionó un ID de consulta válido.'
                });
            }

            let relevoSalidaId = req.body.id_relevo_salida;
            
            if (es_acompanante && !relevoSalidaId && targetConsulta) {
                const acompananteExistente = await Visita.buscarAcompananteActivo(targetConsulta);
                if (acompananteExistente) {
                    relevoSalidaId = acompananteExistente.id_visita;
                }
            }

            const idVisitante = await Visitante.crearOActualizar({
                ...req.body,
                foto: fotoARegistrar || null
            });

            const visitaActiva = await Visita.buscarActivaPorVisitante(idVisitante);
            if (visitaActiva) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'El visitante ya se encuentra dentro de las instalaciones.' 
                });
            }

            if (es_acompanante && relevoSalidaId) {
                await Visita.registrarSalida(relevoSalidaId);
            }

            if (!relevoSalidaId && targetConsulta && area_destino) {
                const maxPermitido = await Visita.obtenerLimiteArea(area_destino);
                if (maxPermitido !== null) {
                    const visitasActuales = await Visita.contarActivasPorConsulta(targetConsulta);
                    if (visitasActuales >= maxPermitido) {
                        return res.status(400).json({
                            success: false,
                            message: `El paciente ya alcanzó el cupo máximo de visitantes simultáneos (${maxPermitido}) permitidos en el área ${area_destino}.`
                        });
                    }
                }
            }

            await Visita.registrarEntrada({
                id_visitante: idVisitante,
                id_consulta: targetConsulta,
                id_usuario: req.user?.id_usuario || req.user?.id || 1,
                area_destino: area_destino,
                foto_perfil_url: fotoARegistrar || null,
                es_acompanante: es_acompanante
            });

            res.status(201).json({ 
                success: true, 
                message: es_acompanante && relevoSalidaId 
                    ? 'Relevo de acompañante realizado con éxito' 
                    : 'Ingreso registrado correctamente' 
            });
        } catch (error) {
            console.error("ERROR:", error);
            res.status(500).json({ success: false, details: error.message });
        }
    },

    obtenerHistorial: async (req, res) => {
        try {
            const historial = await Visita.obtenerHistorialCompleto();
            res.json(historial || []); 
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener historial' });
        }
    },

    obtenerActivas: async (req, res) => {
        try {
            const activas = await Visita.obtenerActivas();
            res.json(activas || []);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener visitas activas' });
        }
    },

    registrarSalida: async (req, res) => {
        const { id } = req.params;
        try {
            await Visita.registrarSalida(id);
            res.json({ message: 'Salida registrada correctamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al registrar salida' });
        }
    }
};

module.exports = visitaController;