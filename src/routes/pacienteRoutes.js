const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');

router.get('/buscar', pacienteController.buscarPacientes);

module.exports = router;