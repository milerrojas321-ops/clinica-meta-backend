const db = require('../database/db');

const Visita = {
    // Aquí movemos la consulta del INSERT
    registrarEntrada: async (datos) => {
        const sql = `
        INSERT INTO visitas (id_visitante, id_usuario, nombre_paciente, area_destino, foto_perfil_url, fecha_entrada)
        VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    const [result] = await db.query(sql, [
        datos.id_visitante,
        datos.id_usuario,
        datos.nombre_paciente,
        datos.area_destino,
        datos.foto_perfil_url // El string base64 de la foto
    ]);
    return result;
},

registrarSalida: async (id_visita) => {
    const sql = `
        UPDATE visitas 
        SET fecha_salida = NOW() 
        WHERE id_visita = ? AND fecha_salida IS NULL
    `;
    const [result] = await db.query(sql, [id_visita]);
    return result;
},

    // Aquí movemos la consulta del SELECT con el JOIN
    // src/models/Visita.js
    obtenerHistorialCompleto: async () => {
        const sql = `
            SELECT 
                v.id_visita,
                vt.nombres,
                vt.apellidos,
                vt.numero_documento,
                v.nombre_paciente,
                v.area_destino,
                v.foto_perfil_url, -- Asegúrate de incluir esta columna
                v.fecha_entrada,
                v.fecha_salida
            FROM visitas v
            JOIN visitantes vt ON v.id_visitante = vt.id_visitante
            ORDER BY v.fecha_entrada DESC
        `;
        const [rows] = await db.query(sql);
        return rows;
    }
};

module.exports = Visita;