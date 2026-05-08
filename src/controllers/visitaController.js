// src/controllers/visitaController.js
const Visitante = require('../models/Visitante');
const Visita = require('../models/Visita');

const visitaController = {
    // src/controllers/visitaController.js
registrarVisita: async (req, res) => {
    try {
        const idVisitante = await Visitante.crearOActualizar(req.body);

        await Visita.registrarEntrada({
            id_visitante: idVisitante,
            id_usuario: 1, 

            nombre_paciente: req.body.nombre_paciente, 
            area_destino: req.body.area_destino,
            foto_perfil_url: req.body.foto_perfil_url
        });

        res.status(201).json({ success: true, message: 'Ingreso registrado' });
    } catch (error) {
        console.error("ERROR:", error);
        res.status(500).json({ success: false, details: error.message });
    }
},
    
        obtenerHistorial: async (req, res) => {
        try {
            const historial = await Visita.obtenerHistorialCompleto();
            // Verifica que historial no sea undefined o null antes de enviar
            res.json(historial || []); 
        } catch (error) {
            console.error("Error en backend:", error);
            res.status(500).json({ error: 'Error al obtener historial' });
        }
    },

    // 3. REGISTRAR SALIDA (Recuperado y adaptado)
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