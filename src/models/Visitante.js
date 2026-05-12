const db = require('../database/db');

const Visitante = {
    // src/models/Visitante.js
crearOActualizar: async (datos) => {
    const { nombres, apellidos, cedula, numero_documento, telefono, foto, foto_perfil_url } = datos;
    
    // Unificamos el documento y la foto independientemente de cómo vengan del front o controller
    const docReal = cedula || numero_documento;
    const fotoReal = foto || foto_perfil_url; 

    const query = `
        INSERT INTO visitantes (tipo_documento, numero_documento, nombres, apellidos, telefono, foto_perfil_url)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            telefono = VALUES(telefono),
            foto_perfil_url = VALUES(foto_perfil_url) -- Aquí se actualiza la foto en el perfil maestro
    `;

    const [result] = await db.query(query, [
        'CC', 
        docReal, 
        nombres, 
        apellidos, 
        telefono, 
        fotoReal 
    ]);

    // Retornamos el id_visitante para que la tabla 'visitas' pueda crear la relación
    if (result.insertId === 0) {
        const [rows] = await db.query('SELECT id_visitante FROM visitantes WHERE numero_documento = ?', [docReal]);
        return rows[0].id_visitante;
    }
    
    return result.insertId;
},

    obtenerTodos: async () => {
    // Concatenamos nombres y apellidos para que coincida con el frontend
    const sql = `
        SELECT 
            id_visitante as id, 
            CONCAT(nombres, ' ', apellidos) as nombre_completo, 
            tipo_documento, 
            numero_documento, 
            telefono, 
            foto_perfil_url as foto 
        FROM visitantes
    `;
    const [rows] = await db.query(sql);
    return rows;
}
};

module.exports = Visitante;