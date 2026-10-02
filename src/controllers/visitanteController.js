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

  buscarVisitantes: async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || q.trim() === '') {
        return res.json([]);
      }
      const resultados = await Visitante.buscarPorCriterio(q);
      res.json(resultados);
    } catch (error) {
      res.status(500).json({ error: 'Error en la búsqueda', details: error.message });
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
      res.status(500).json({ error: 'Error al obtener visitantes', details: error.message });
    }
  },

  // Controlador agregado para gestionar la petición del historial
  obtenerHistorialVisitante: async (req, res) => {
    try {
      const { id } = req.params;
      const historial = await Visitante.obtenerHistorial(id);
      res.json(historial);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el historial', details: error.message });
    }
  }
};

module.exports = visitanteController;