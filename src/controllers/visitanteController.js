const Visitante = require('../models/Visitante');

const visitanteController = {
    registrarVisitante: async (req, res) => {
        try {
            const id = await Visitante.crearOActualizar(req.body);
            res.status(201).json({
                message: 'Visitante procesado con éxito',
                id: id
            });
        } catch (error) {
            res.status(500).json({ error: 'Error al registrar visitante', details: error.message });
        }
    },

    buscarPorCedula: async (req, res) => {
        try {
            const { cedula } = req.params;
            const visitante = await Visitante.buscarPorDocumento(cedula);

            if (visitante) {
                res.json({ encontrado: true, data: visitante });
            } else {
                res.status(404).json({ encontrado: false, message: 'Visitante no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Error en la búsqueda', details: error.message });
        }
    },

    obtenerVisitantes: async (req, res) => {
        try {
            const visitantes = await Visitante.obtenerTodos();
            res.json(visitantes);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener visitantes' });
        }
    },


    obtenerTodos: async () => {
    // Concatenamos nombres y apellidos para que coincida con el frontend
    const sql = `
        SELECT 
            id_visitante as id, 
            CONCAT(nombres, ' ', apellidos) as nombre_completo, 
            tipo_documento, 
            numero_documento, 
            telefono, 
            foto_perfil_url as foto 
        FROM visitantes
    `;
    const [rows] = await db.query(sql);
    return rows;
}

};

module.exports = visitanteController;