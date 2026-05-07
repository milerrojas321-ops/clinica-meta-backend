const Visitante = require('../models/Visitante');
const Visita = require('../models/Visita');

const visitaController = {
    registrarVisita: async (req, res) => {
        try {
            // Pasamos todo req.body que ya incluye nombres, cedula, telefono y foto
            const idVisitante = await Visitante.crearOActualizar(req.body);

            await Visita.registrarEntrada({
                id_visitante: idVisitante,
                id_usuario: 1, // Usuario por defecto para la prueba
                nombre_paciente: req.body.nombrePaciente,
                area_destino: req.body.areaDestino
            });

            res.status(201).json({
                success: true,
                message: 'Ingreso registrado correctamente en Clínica Meta'
            });
        } catch (error) {
            console.error("ERROR:", error);
            res.status(500).json({ 
                success: false, 
                error: 'Error en el servidor', 
                details: error.message 
            });
        }
    },
    

    obtenerHistorial: async (req, res) => {
        try {
            // El controlador no sabe cómo se hace el JOIN, solo pide los datos
            const historial = await Visita.obtenerHistorialCompleto();
            res.json(historial);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener historial', details: error.message });
        }
    },

    // 3. REGISTRAR SALIDA (Recuperado y adaptado)
    registrarSalida: async (req, res) => {
        try {
            const { id_visitante } = req.body;
            // El modelo se encarga de buscar la visita activa y ponerle fecha_salida
            const exito = await Visita.marcarSalida(id_visitante);

            if (exito) {
                res.json({ message: 'Salida registrada correctamente' });
            } else {
                res.status(404).json({ message: 'No se encontró una visita activa para este visitante' });
            }
        } catch (error) {
            console.error("Error al registrar salida:", error);
            res.status(500).json({ error: 'Error al procesar la salida' });
        }
    }
};

module.exports = visitaController;