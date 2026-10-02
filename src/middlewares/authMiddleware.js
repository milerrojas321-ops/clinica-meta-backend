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

const verificarAdmin = (req, res, next) => {
    // Verifica si req.user tiene rol administrador
    if (req.user && req.user.rol === 'administrador') {
        next();
    } else {
        return res.status(403).json({ mensaje: "Acceso denegado. Se requieren permisos de administrador." });
    }
};

module.exports = {
    verificarToken,
    verificarAdmin
};