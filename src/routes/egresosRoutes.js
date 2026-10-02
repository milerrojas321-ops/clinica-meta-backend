const express = require('express');
const router = express.Router();
const { 
  obtenerEgresosHoy, 
  obtenerHistorialEgresos,
  buscarPacienteDinamica, 
  confirmarSalida,
  exportarEgresosExcel,
  exportarEgresosPDF
} = require('../controllers/egresosController');
const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware');

router.get('/hoy', obtenerEgresosHoy);
router.get('/historial', obtenerHistorialEgresos);
router.get('/buscar-dinamica', buscarPacienteDinamica);
router.post('/confirmar-salida', confirmarSalida);

// Rutas de exportación de archivos (Solo Administrador)
router.get('/exportar-excel', verificarToken, verificarAdmin, exportarEgresosExcel);
router.get('/exportar-pdf', verificarToken, verificarAdmin, exportarEgresosPDF);

module.exports = router;