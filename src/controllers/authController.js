// controllers/authController.js
const db = require('../database/db');
const jwt = require('jsonwebtoken');

const authController = {
    login: async (req, res) => {
        const { usuario, password } = req.body;
        const query = 'SELECT * FROM usuarios WHERE username = ? AND password = ?';
        
        try {
            const [result] = await db.query(query, [usuario, password]);

            if (result.length > 0) {
                // 1. Definir los datos del usuario
                const userPayload = { 
                    id: result[0].id, 
                    nombre: result[0].nombre_completo,
                    rol: result[0].rol 
                };

                // 2. GENERAR EL TOKEN (Esto te faltaba dentro de la función)
                const token = jwt.sign(
                    userPayload, 
                    'TU_PALABRA_SECRETA_SUPER_SEGURA', 
                    { expiresIn: '1h' }
                );

                // 3. ENVIAR TODO AL FRONTEND
                // Asegúrate de enviar 'token' para que Login.jsx lo reciba
                res.json({ 
                    success: true, 
                    user: userPayload,
                    token: token 
                });

            } else {
                res.status(401).json({ success: false, mensaje: 'Credenciales inválidas' });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, mensaje: 'Error en el servidor' });
        }
    }
};

module.exports = authController;