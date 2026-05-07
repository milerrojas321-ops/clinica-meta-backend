// controllers/authController.js
const db = require('../database/db');

const authController = {
    login: async (req, res) => {
        const { usuario, password } = req.body;
        const query = 'SELECT * FROM usuarios WHERE username = ? AND password = ?';
        
        try {
            // Usamos await porque tu db.js usa promesas
            const [result] = await db.query(query, [usuario, password]);

            if (result.length > 0) {
                const user = { 
                    id: result[0].id, 
                    nombre: result[0].nombre_completo,
                    rol: result[0].rol 
                };
                res.json({ success: true, user });
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