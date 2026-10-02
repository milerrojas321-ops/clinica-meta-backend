const db = require('../database/db');

const Config = {
    getAreas: async () => {
        const [rows] = await db.query('SELECT * FROM areas ORDER BY id ASC');
        return rows;
    },

    crearArea: async (nombre, max_visitantes) => {
        const limite = max_visitantes ? parseInt(max_visitantes) : 1;
        const [result] = await db.query(
            'INSERT INTO areas (nombre, max_visitantes) VALUES (?, ?)', 
            [nombre, limite]
        );
        return { id: result.insertId, nombre, max_visitantes: limite };
    },

    actualizarArea: async (id, nombre, max_visitantes) => {
        const limite = max_visitantes ? parseInt(max_visitantes) : 1;
        await db.query(
            'UPDATE areas SET nombre = ?, max_visitantes = ? WHERE id = ?', 
            [nombre, limite, id]
        );
        return { id, nombre, max_visitantes: limite };
    },

    borrarArea: async (id) => {
        const [result] = await db.query('DELETE FROM areas WHERE id = ?', [id]);
        return result;
    },

    // --- NUEVAS FUNCIONES PARA CONFIGURACIÓN GLOBAL ---
    getParametros: async () => {
        const [rows] = await db.query('SELECT * FROM configuraciones_sistema');
        const configObj = {};
        rows.forEach(r => {
            configObj[r.clave] = r.valor === 'true' || r.valor === '1';
        });
        return configObj;
    },

    guardarParametro: async (clave, valor) => {
        const valStr = String(valor);
        const [result] = await db.query(
            `INSERT INTO configuraciones_sistema (clave, valor) 
             VALUES (?, ?) 
             ON DUPLICATE KEY UPDATE valor = ?`,
            [clave, valStr, valStr]
        );
        return result;
    }
};

module.exports = Config;