const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ mensaje: "Token no proporcionado" });
    }

try {
    const decoded = jwt.verify(token, 'TU_PALABRA_SECRETA_SUPER_SEGURA');
        req.user = decoded; // Guardamos los datos del usuario en la petición
    next();
    } catch (error) {
        return res.status(401).json({ mensaje: "Token inválido o expirado" });
    }
};

module.exports = verificarToken;