const db = require('../database/db');

const sincronizarOcupacionCamas = async () => {
  try {
    const [registrosDinamica] = await db.query(`SELECT * FROM ocupacion_camas`);

    if (!registrosDinamica || registrosDinamica.length === 0) {
      return;
    }

    for (const reg of registrosDinamica) {
      // 1. Insertar o actualizar Paciente
      await db.query(
        `INSERT INTO pacientes (numero_documento, nombres, apellidos, fecha_nacimiento)
         VALUES (?, ?, '', ?)
         ON DUPLICATE KEY UPDATE 
            nombres = VALUES(nombres),
            fecha_nacimiento = VALUES(fecha_nacimiento)`,
        [reg.PACIENTE_DOCUMENTO, reg.PACIENTE_NOMBRE, reg.PACIENTE_FECHA_NACIMIENTO]
      );

      // Obtener el ID del paciente
      const [[paciente]] = await db.query(
        `SELECT Id_paciente FROM pacientes WHERE numero_documento = ?`,
        [reg.PACIENTE_DOCUMENTO]
      );

      if (!paciente) continue;

      // 2. Asegurar existencia del Área en la tabla local
      await db.query(
        `INSERT IGNORE INTO areas (nombre, max_visitantes) VALUES (?, 2)`,
        [reg.CAMA_GRUPO_NOMBRE]
      );

      const [[area]] = await db.query(
        `SELECT id FROM areas WHERE nombre = ?`,
        [reg.CAMA_GRUPO_NOMBRE]
      );

      // 3. Insertar o actualizar Consulta
      await db.query(
        `INSERT INTO consultas (id_consulta, id_paciente, id_area, cama, estado, fecha_ingreso)
         VALUES (?, ?, ?, ?, 'Activo', ?)
         ON DUPLICATE KEY UPDATE
            id_area = VALUES(id_area),
            cama = VALUES(cama),
            estado = 'Activo'`,
        [reg.INGRESO_NUMERO, paciente.Id_paciente, area.id, reg.CAMA_CODIGO, reg.INGRESO_FECHA]
      );
    }

    console.log(`[Cron Job] Sincronización exitosa: ${registrosDinamica.length} registros procesados.`);
  } catch (error) {
    console.error('[Cron Job Error] Falló la sincronización de ocupación de camas:', error.message);
  }
};

module.exports = { sincronizarOcupacionCamas };