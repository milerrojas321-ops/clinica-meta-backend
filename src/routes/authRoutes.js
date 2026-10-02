// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const middlewareImport = require('../middlewares/authMiddleware');
const verificarToken = typeof middlewareImport === 'function' 
  ? middlewareImport 
  : (middlewareImport.verificarToken || middlewareImport.autenticarToken || ((req, res, next) => next()));

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/backup', authController.generarBackup);
router.get('/verificar-sesion', verificarToken, authController.verificarSesion);

// Nuevas rutas para gestión de estado de usuarios
router.get('/usuarios', verificarToken, authController.obtenerUsuarios);
router.patch('/usuarios/:id/estado', verificarToken, authController.cambiarEstadoUsuario);

module.exports = router;