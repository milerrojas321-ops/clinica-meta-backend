const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verificarToken = require('../middlewares/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/backup', authController.generarBackup);
router.get('/verificar-sesion', verificarToken, (req, res) => {
    res.json({ valida: true });
});

module.exports = router;