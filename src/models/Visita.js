const db = require('../database/db');

const Visita = {
    // Aquí movemos la consulta del INSERT
    registrarEntrada: async (datos) => {
        const { id_visitante, id_usuario, nombre_paciente, area_destino } = datos;
        const query = `
            INSERT INTO visitas (id_visitante, id_usuario, nombre_paciente, area_destino, fecha_entrada)
            VALUES (?, ?, ?, ?, NOW())
        `;
        const [result] = await db.query(query, [id_visitante, id_usuario, nombre_paciente, area_destino]);
        return result.insertId;
    },

    // Aquí movemos la consulta del SELECT con el JOIN
    obtenerHistorialCompleto: async () => {
        const query = `
            SELECT  v.id_visita, vi.nombres, vi.apellidos, v.nombre_paciente, 
                    v.area_destino, v.fecha_entrada
            FROM visitas v
            JOIN visitantes vi ON v.id_visitante = vi.id_visitante
            ORDER BY v.fecha_entrada DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    }
};

module.exports = Visita;