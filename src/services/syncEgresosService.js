const db = require('../database/db');

const sincronizarBoletasSalida = async () => {
  try {
    // 1. Obtener las ordenes de salida desde la entidad/tabla de Dinámica
    // (Asegúrate de ajustar 'ordenes_salida' al nombre exacto de la entidad en Dinámica)
    const [ordenesSalida] = await db.query(`SELECT * FROM ordenes_salida`);

    if (!ordenesSalida || ordenesSalida.length === 0) {
      return;
    }

    for (const orden of ordenesSalida) {
      // 2. Marcar la consulta como lista para salida usando INGRESO_CONSECUTIVO
      await db.query(
        `UPDATE consultas 
         SET estado_dinamica = 'listo_para_salida' 
         WHERE id_consulta = ? AND estado = 'Activo'`,
        [orden.INGRESO_CONSECUTIVO]
      );
    }

    console.log(`[Cron Job Egresos] Boletas actualizadas: ${ordenesSalida.length}`);
  } catch (error) {
    console.error('[Cron Job Egresos Error] Falló la sincronización:', error.message);
  }
};

module.exports = { sincronizarBoletasSalida };