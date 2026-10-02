const db = require('../database/db');

const Paciente = {
  buscarPorCriterio: async (criterio) => {
    const sql = `
      SELECT 
        p.Id_paciente AS id,
        p.Id_paciente AS id_paciente,
        c.id_consulta,
        p.numero_documento,
        p.nombres,
        p.apellidos,
        CONCAT(p.nombres, ' ', p.apellidos) AS nombre_completo,
        c.cama,
        c.estado,
        c.permite_visitas,
        a.id AS id_area,
        a.nombre AS nombre_area,
        a.max_visitantes
      FROM pacientes p
      INNER JOIN consultas c ON p.Id_paciente = c.id_paciente
      INNER JOIN areas a ON c.id_area = a.id
      WHERE (p.numero_documento LIKE ? OR p.nombres LIKE ? OR p.apellidos LIKE ?)
        AND c.estado = 'Activo'
      LIMIT 5
    `;
    const busqueda = `%${criterio}%`;
    const [rows] = await db.query(sql, [busqueda, busqueda, busqueda]);
    return rows;
  }
};

module.exports = Paciente;