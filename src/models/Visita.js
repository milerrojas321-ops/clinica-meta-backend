const db = require('../database/db');

const Visita = {
    buscarActivaPorVisitante: async (id_visitante) => {
        const sql = `
            SELECT id_visita 
            FROM visitas 
            WHERE id_visitante = ? AND fecha_salida IS NULL 
            LIMIT 1
        `;
        const [rows] = await db.query(sql, [id_visitante]);
        return rows[0];
    },

    contarActivasPorConsulta: async (id_consulta) => {
        const sql = `
            SELECT COUNT(*) AS total 
            FROM visitas 
            WHERE id_consulta = ? AND fecha_salida IS NULL
        `;
        const [rows] = await db.query(sql, [id_consulta]);
        return rows[0] ? rows[0].total : 0;
    },

    buscarAcompananteActivo: async (id_consulta) => {
        const sql = `
            SELECT 
                v.id_visita, 
                vt.nombres, 
                vt.apellidos, 
                vt.numero_documento,
                v.fecha_entrada 
            FROM visitas v
            INNER JOIN visitantes vt ON v.id_visitante = vt.id_visitante
            WHERE v.id_consulta = ? AND v.es_acompanante = 1 AND v.fecha_salida IS NULL
            LIMIT 1
        `;
        const [rows] = await db.query(sql, [id_consulta]);
        return rows[0];
    },

    obtenerLimiteArea: async (nombre_area) => {
        const sql = `
            SELECT max_visitantes 
            FROM areas 
            WHERE LOWER(nombre) = LOWER(?) 
            LIMIT 1
        `;
        const [rows] = await db.query(sql, [nombre_area]);
        return rows[0] ? rows[0].max_visitantes : null;
    },

    obtenerHistorialPorVisitante: async (id_visitante) => {
        const sql = `
            SELECT 
                v.id_visita,
                v.fecha_entrada,
                v.fecha_salida,
                v.area_destino,
                v.es_acompanante,
                CONCAT(p.nombres, ' ', p.apellidos) AS nombre_paciente
            FROM visitas v
            INNER JOIN consultas c ON v.id_consulta = c.id_consulta
            INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
            WHERE v.id_visitante = ?
            ORDER BY v.fecha_entrada DESC
        `;
        const [rows] = await db.query(sql, [id_visitante]);
        return rows;
    },

    registrarEntrada: async (datos) => {
        const sql = `
            INSERT INTO visitas (id_visitante, id_consulta, id_usuario, area_destino, foto_perfil_url, es_acompanante, fecha_entrada)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        const [result] = await db.query(sql, [
            datos.id_visitante,
            datos.id_consulta,
            datos.id_usuario,
            datos.area_destino,
            datos.foto_perfil_url,
            datos.es_acompanante ? 1 : 0
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

    obtenerHistorialCompleto: async () => {
        const sql = `
            SELECT 
                v.id_visita,
                vt.nombres,
                vt.apellidos,
                vt.numero_documento,
                CONCAT(vt.nombres, ' ', vt.apellidos) AS visitante_completo,
                CONCAT(p.nombres, ' ', p.apellidos) AS nombre_paciente,
                v.area_destino,
                v.foto_perfil_url,
                v.es_acompanante,
                v.fecha_entrada,
                v.fecha_salida
            FROM visitas v
            INNER JOIN visitantes vt ON v.id_visitante = vt.id_visitante
            INNER JOIN consultas c ON v.id_consulta = c.id_consulta
            INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
            ORDER BY v.fecha_entrada DESC
        `;
        const [rows] = await db.query(sql);
        return rows;
    },

    obtenerActivas: async () => {
        const sql = `
            SELECT 
                v.id_visita,
                vt.nombres AS visitante_nombres,
                vt.apellidos AS visitante_apellidos,
                CONCAT(vt.nombres, ' ', vt.apellidos) AS visitante_completo,
                CONCAT(p.nombres, ' ', p.apellidos) AS nombre_paciente,
                v.foto_perfil_url,
                v.fecha_entrada,
                v.area_destino,
                v.es_acompanante
            FROM visitas v
            INNER JOIN visitantes vt ON v.id_visitante = vt.id_visitante
            INNER JOIN consultas c ON v.id_consulta = c.id_consulta
            INNER JOIN pacientes p ON c.id_paciente = p.id_paciente
            WHERE v.fecha_salida IS NULL
            ORDER BY v.fecha_entrada DESC
        `;
        const [rows] = await db.query(sql);
        return rows;
    }
};

module.exports = Visita;