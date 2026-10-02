const db = require('../database/db');

const EgresoModel = {
  // Obtener los egresos del día actual
  obtenerHoy: async () => {
    const [rows] = await db.query(
      `SELECT 
        e.id_egreso, 
        e.id_consulta, 
        e.documento, 
        e.nombre AS nombre_paciente, 
        e.fecha_salida,
        e.observaciones,
        COALESCE(u.nombre_completo, 'Orientador Sistema') AS orientador
       FROM egresos e
       LEFT JOIN usuarios u ON e.id_usuario = u.id_usuario
       WHERE DATE(e.fecha_salida) = CURDATE() 
       ORDER BY e.fecha_salida DESC`
    );
    return rows;
  },

  // Obtener historial completo con rango de fechas y filtro de búsqueda
  obtenerHistorial: async (fechaInicio, fechaFin, busqueda) => {
    let query = `
      SELECT 
        e.id_egreso,
        e.id_consulta,
        e.documento,
        e.nombre AS nombre_paciente,
        e.fecha_salida,
        e.observaciones,
        a.nombre AS area,
        COALESCE(u.nombre_completo, 'Orientador Sistema') AS orientador
      FROM egresos e
      INNER JOIN consultas c ON e.id_consulta = c.id_consulta
      INNER JOIN areas a ON c.id_area = a.id
      LEFT JOIN usuarios u ON e.id_usuario = u.id_usuario
      WHERE 1=1
    `;

    const params = [];

    if (fechaInicio && fechaFin) {
      query += ` AND DATE(e.fecha_salida) BETWEEN ? AND ?`;
      params.push(fechaInicio, fechaFin);
    }

    if (busqueda && busqueda.trim() !== '') {
      query += ` AND (e.nombre LIKE ? OR e.documento LIKE ? OR u.nombre_completo LIKE ? OR a.nombre LIKE ?)`;
      const term = `%${busqueda.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY e.fecha_salida DESC`;

    const [rows] = await db.query(query, params);
    return rows;
  },

  // Buscar paciente con la información detallada de su consulta y egreso previo
  buscarPacienteEnDinamica: async (criterio) => {
    const [rows] = await db.query(
      `SELECT 
        c.id_consulta,
        p.Id_paciente AS id_paciente, 
        p.numero_documento AS documento, 
        CONCAT(p.nombres, ' ', p.apellidos) AS nombre, 
        a.nombre AS area, 
        c.cama, 
        c.estado AS estado_consulta,
        c.estado_dinamica, 
        c.autoriza_plus,
        e.fecha_salida AS hora_egreso,
        e.observaciones,
        COALESCE(u.nombre_completo, 'Orientador Sistema') AS orientador_egreso,
        (SELECT COUNT(*) 
         FROM egresos e_sub 
         WHERE e_sub.id_consulta = c.id_consulta
        ) AS total_egresos,
        (SELECT COUNT(*) 
         FROM visitas vi 
         WHERE vi.id_consulta = c.id_consulta 
           AND vi.fecha_salida IS NULL
        ) AS visitas_activas
       FROM consultas c
       INNER JOIN pacientes p ON c.id_paciente = p.Id_paciente
       INNER JOIN areas a ON c.id_area = a.id
       LEFT JOIN egresos e ON c.id_consulta = e.id_consulta
       LEFT JOIN usuarios u ON e.id_usuario = u.id_usuario
       WHERE (p.numero_documento = ? OR CONCAT(p.nombres, ' ', p.apellidos) LIKE ?)
       ORDER BY c.id_consulta DESC
       LIMIT 1`,
      [criterio, `%${criterio}%`]
    );
    return rows[0] || null;
  },

  // Registrar el egreso en la BD e inhabilitar de forma automática todas las visitas activas
  registrarSalida: async (id_consulta, documento, nombre, id_usuario, observaciones) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Insertar el egreso (respetando las columnas exactas de tu tabla)
      const [result] = await connection.query(
        `INSERT INTO egresos (id_consulta, documento, nombre, fecha_salida, id_usuario, observaciones) 
         VALUES (?, ?, ?, NOW(), ?, ?)`,
        [id_consulta, documento, nombre, id_usuario, observaciones || null]
      );

      // 2. Actualizar la consulta a estado 'Alta' y liberar la cama
      await connection.query(
        `UPDATE consultas 
         SET estado = 'Alta', cama = '' 
         WHERE id_consulta = ?`,
        [id_consulta]
      );

      // 3. Cierre automático de acompañantes o visitas activas vinculadas
      await connection.query(
        `UPDATE visitas 
         SET fecha_salida = NOW() 
         WHERE id_consulta = ? 
           AND fecha_salida IS NULL`,
        [id_consulta]
      );

      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = EgresoModel;