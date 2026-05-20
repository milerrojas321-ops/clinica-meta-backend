const db = require('../database/db');

const Config = {
    // Obtener todas las áreas
    getAreas: async () => {
        const [rows] = await db.query('SELECT * FROM areas');
        return rows;
    },

    // Insertar nueva área
    crearArea: async (nombre) => {
        const [result] = await db.query('INSERT INTO areas (nombre) VALUES (?)', [nombre]);
        return { id: result.insertId, nombre }; // Devolvemos el ID generado
    },

    // Eliminar área por ID
    borrarArea: async (id) => {
        const [result] = await db.query('DELETE FROM areas WHERE id = ?', [id]);
        return result;
    }
};

module.exports = Config;