const ControlCamasModel = require('../models/controlCamasModel');

const getControlCamas = async (req, res) => {
  try {
    const rows = await ControlCamasModel.obtenerControlCamas();

    // Parse de la propiedad lista_visitantes para entregar un Array estructurado al cliente
    const dataFormatted = rows.map((item) => ({
      ...item,
      lista_visitantes: typeof item.lista_visitantes === 'string'
        ? JSON.parse(item.lista_visitantes || '[]')
        : item.lista_visitantes || []
    }));

    res.json(dataFormatted);
  } catch (error) {
    console.error('Error al obtener control de camas:', error);
    res.status(500).json({ error: 'Error al consultar el estado de camas' });
  }
};

module.exports = { getControlCamas };