// models/Usuario.js
const db = require('../database/db');

const Usuario = {
    buscarPorUsername: async (username) => {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE username = ?', [username]);
        return rows[0];
    },

    // Obtener todos los usuarios (usando únicamente id_usuario)
    obtenerTodos: async () => {
        const [rows] = await db.query(
            'SELECT id_usuario, nombre_completo, username, rol, activo FROM usuarios ORDER BY id_usuario DESC'
        );
        return rows;
    },

    crearUsuario: async (nuevoUsuario) => {
        const { nombre_completo, username, password, rol } = nuevoUsuario;
        const query = `INSERT INTO usuarios (nombre_completo, username, password, rol, activo) VALUES (?, ?, ?, ?, 1)`;
        const [result] = await db.query(query, [nombre_completo, username, password, rol]);
        return result.insertId;
    },

    cambiarEstado: async (id, activo) => {
        const query = `UPDATE usuarios SET activo = ? WHERE id_usuario = ?`;
        const [result] = await db.query(query, [activo, id]);
        return result;
    }
};

module.exports = Usuario;