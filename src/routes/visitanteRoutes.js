const express = require('express');
const router = express.Router();
const visitanteController = require('../controllers/visitanteController');

// Definimos la ruta POST para registrar
router.post('/registro', visitanteController.registrarVisitante);

router.get('/buscar/:cedula', visitanteController.buscarPorCedula);

// Definimos la ruta GET para ver la lista
router.get('/lista', visitanteController.obtenerVisitantes);

module.exports = router;