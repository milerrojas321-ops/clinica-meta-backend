const express = require('express');
const router = express.Router();
const visitanteController = require('../controllers/visitanteController');

// Rutas de consulta GET
router.get('/', visitanteController.obtenerVisitantes);
router.get('/buscar', visitanteController.buscarVisitantes);
router.get('/buscar/:cedula', visitanteController.buscarPorCedula);
router.get('/:id/historial', visitanteController.obtenerHistorialVisitante);

// Rutas de envío POST
router.post('/registro', visitanteController.registrarVisitante);

module.exports = router;