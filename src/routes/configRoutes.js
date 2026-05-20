const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

router.get('/areas', configController.listarAreas);
router.post('/areas', configController.guardarArea);
router.delete('/areas/:id', configController.eliminarArea);

module.exports = router;