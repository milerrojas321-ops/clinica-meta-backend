const db = require('../database/db');

const ControlCamasModel = {
    obtenerControlCamas: async () => {
        const query = `
        SELECT 
            c.id_consulta,
            p.id_paciente,
            p.numero_documento AS documento,
            c.cama,
            c.estado,
            CONCAT(p.nombres, ' ', p.apellidos) AS paciente,
            a.id AS id_area,
            a.nombre AS area,
            a.max_visitantes,
            COUNT(v.id_visita) AS visitantes_actuales,
            CONCAT('[', 
                COALESCE(
                    GROUP_CONCAT(
                        IF(v.id_visita IS NOT NULL,
                            JSON_OBJECT(
                                'id_visita', v.id_visita,
                                'visitante', CONCAT(vt.nombres, ' ', vt.apellidos),
                                'foto', vt.foto_perfil_url,
                                'es_acompanante', IF(v.es_acompanante = 1, true, false),
                                'fecha_entrada', DATE_FORMAT(v.fecha_entrada, '%Y-%m-%d %H:%i:%s')
                            ),
                            NULL
                        )
                        SEPARATOR ','
                    ), 
                    ''
                ), 
            ']') AS lista_visitantes
        FROM consultas c
        INNER JOIN pacientes p ON c.id_paciente = p.Id_paciente
        INNER JOIN areas a ON c.id_area = a.id
        LEFT JOIN visitas v ON v.id_consulta = c.id_consulta AND v.fecha_salida IS NULL
        LEFT JOIN visitantes vt ON v.id_visitante = vt.id_visitante
        WHERE c.estado = 'Activo' AND c.cama IS NOT NULL AND c.cama != ''
        GROUP BY c.id_consulta, p.id_paciente, p.numero_documento, c.cama, c.estado, p.nombres, p.apellidos, a.id, a.nombre, a.max_visitantes;
        `;
        const [rows] = await db.query(query);
        return rows;
    }
};

module.exports = ControlCamasModel;