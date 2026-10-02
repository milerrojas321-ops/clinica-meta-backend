const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

router.get('/areas', configController.listarAreas);
router.post('/areas', configController.guardarArea);
router.put('/areas/:id', configController.editarArea);
router.delete('/areas/:id', configController.eliminarArea);

// Rutas de parámetros del sistema
router.get('/parametros', configController.obtenerParametros);
router.post('/parametros', configController.actualizarParametro);

module.exports = router;