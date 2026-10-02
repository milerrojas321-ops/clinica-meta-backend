const db = require('../database/db');

const Visitante = {
  crearOActualizar: async (datos) => {
    const { nombres, apellidos, cedula, numero_documento, telefono, foto, foto_perfil_url, actualizarFoto } = datos;
    
    const docReal = numero_documento || cedula;
    const fotoReal = foto_perfil_url || foto || null;
    const telReal = telefono || '';

    // Si hay foto o debe actualizarse
    if (actualizarFoto || fotoReal) {
      const query = `
        INSERT INTO visitantes (tipo_documento, numero_documento, nombres, apellidos, telefono, foto_perfil_url, fecha_foto)
        VALUES ('CC', ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
            nombres = VALUES(nombres),
            apellidos = VALUES(apellidos),
            telefono = VALUES(telefono),
            foto_perfil_url = VALUES(foto_perfil_url),
            fecha_foto = NOW()
      `;
      const [result] = await db.query(query, [docReal, nombres, apellidos, telReal, fotoReal]);
      
      if (result.insertId === 0) {
        const [rows] = await db.query('SELECT id_visitante FROM visitantes WHERE numero_documento = ?', [docReal]);
        return rows[0].id_visitante;
      }
      return result.insertId;
    } else {
      const query = `
        INSERT INTO visitantes (tipo_documento, numero_documento, nombres, apellidos, telefono)
        VALUES ('CC', ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            nombres = VALUES(nombres),
            apellidos = VALUES(apellidos),
            telefono = VALUES(telefono)
      `;
      const [result] = await db.query(query, [docReal, nombres, apellidos, telReal]);
      
      if (result.insertId === 0) {
        const [rows] = await db.query('SELECT id_visitante FROM visitantes WHERE numero_documento = ?', [docReal]);
        return rows[0].id_visitante;
      }
      return result.insertId;
    }
  },

  buscarPorCriterio: async (criterio) => {
    const sql = `
      SELECT 
        id_visitante AS id, 
        id_visitante,
        nombres,
        apellidos,
        CONCAT(nombres, ' ', apellidos) AS nombre_completo, 
        tipo_documento, 
        numero_documento, 
        telefono, 
        foto_perfil_url AS foto,
        foto_perfil_url,
        fecha_foto,
        DATEDIFF(NOW(), fecha_foto) AS dias_foto
      FROM visitantes
      WHERE numero_documento LIKE ? OR nombres LIKE ? OR apellidos LIKE ?
      LIMIT 5
    `;
    const busqueda = `%${criterio}%`;
    const [rows] = await db.query(sql, [busqueda, busqueda, busqueda]);
    return rows;
  },

  buscarPorDocumento: async (cedula) => {
    const sql = `
      SELECT 
        id_visitante AS id, 
        id_visitante,
        nombres,
        apellidos,
        CONCAT(nombres, ' ', apellidos) AS nombre_completo, 
        tipo_documento, 
        numero_documento, 
        telefono, 
        foto_perfil_url AS foto,
        foto_perfil_url,
        fecha_foto,
        DATEDIFF(NOW(), fecha_foto) AS dias_foto
      FROM visitantes
      WHERE numero_documento = ?
    `;
    const [rows] = await db.query(sql, [cedula]);
    return rows[0] || null;
  },

  obtenerTodos: async () => {
    const sql = `
      SELECT 
        id_visitante AS id, 
        id_visitante,
        nombres,
        apellidos,
        CONCAT(nombres, ' ', apellidos) AS nombre_completo, 
        tipo_documento, 
        numero_documento, 
        telefono, 
        foto_perfil_url AS foto,
        foto_perfil_url,
        fecha_foto
      FROM visitantes
    `;
    const [rows] = await db.query(sql);
    return rows;
  },

  obtenerHistorial: async (id_visitante) => {
    try {
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
        INNER JOIN pacientes p ON c.id_paciente = p.Id_paciente
        WHERE v.id_visitante = ?
        ORDER BY v.fecha_entrada DESC
      `;
      const [rows] = await db.query(sql, [id_visitante]);
      return rows;
    } catch (error) {
      console.error("Error en SQL obtenerHistorial:", error);
      throw error;
    }
  }
};

module.exports = Visitante;