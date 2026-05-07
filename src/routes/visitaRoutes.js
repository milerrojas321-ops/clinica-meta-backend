const express = require('express');
const router = express.Router();
const visitaController = require('../controllers/visitaController');

router.post('/ingreso', visitaController.registrarVisita);
// Ruta para ver todas las visitas registradas
router.get('/historial', visitaController.obtenerHistorial);

router.put('/salida', visitaController.registrarSalida); // Usamos PUT porque estamos actualizando un dato existente

module.exports = router;