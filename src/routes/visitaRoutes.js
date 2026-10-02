const express = require('express');
const router = express.Router();
const visitaController = require('../controllers/visitaController');
const visitanteController = require('../controllers/visitanteController');
const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware');

router.post('/ingreso', verificarToken, visitaController.registrarVisita);
router.get('/', verificarToken, visitaController.obtenerHistorial);
router.get('/visitantes', verificarToken, visitanteController.obtenerVisitantes);
router.get('/activas', verificarToken, visitaController.obtenerActivas);
router.get('/acompanante/:id_paciente', verificarToken, visitaController.obtenerAcompananteActivo);
router.put('/salida/:id', verificarToken, visitaController.registrarSalida);

// Rutas de exportación (Solo Administrador)
router.get('/exportar-excel', verificarToken, verificarAdmin, visitaController.exportarVisitasExcel);
router.get('/exportar-pdf', verificarToken, verificarAdmin, visitaController.exportarVisitasPDF);

module.exports = router;