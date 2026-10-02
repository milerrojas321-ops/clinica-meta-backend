const Paciente = require('../models/Paciente');

const pacienteController = {
  buscarPacientes: async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || q.trim() === '') {
        return res.json([]);
      }
      const pacientes = await Paciente.buscarPorCriterio(q);
      res.json(pacientes);
    } catch (error) {
      res.status(500).json({ error: 'Error al buscar paciente', details: error.message });
    }
  }
};

module.exports = pacienteController;