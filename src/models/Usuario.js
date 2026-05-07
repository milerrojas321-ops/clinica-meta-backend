const db = require('../database/db');

const Usuario = {
    buscarPorUsername: async (username) => {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE username = ?', [username]);
        return rows[0];
    },

    crearUsuario: async (nuevoUsuario) => {
        const { nombre_completo, username, password, rol } = nuevoUsuario;
        const query = `INSERT INTO usuarios (nombre_completo, username, password, rol) VALUES (?, ?, ?, ?)`;
        const [result] = await db.query(query, [nombre_completo, username, password, rol]);
        return result.insertId;
    }
};

module.exports = Usuario;