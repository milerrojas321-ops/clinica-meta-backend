const express = require('express');
const router = express.Router();
const visitaController = require('../controllers/visitaController');
const visitanteController = require('../controllers/visitanteController');
const verificarToken = require('../middlewares/authMiddleware');

router.post('/ingreso', verificarToken, visitaController.registrarVisita);

router.get('/', verificarToken, visitaController.obtenerHistorial);

router.get('/visitantes', verificarToken, visitanteController.obtenerVisitantes);

router.put('/salida/:id', verificarToken, visitaController.registrarSalida); // Usamos PUT porque estamos actualizando un dato existente



module.exports = router;