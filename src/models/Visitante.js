const db = require('../database/db');

const Visitante = {
    crearOActualizar: async (datos) => {
        // Extraemos 'cedula' (del frontend) o 'numero_documento'
        const { nombres, apellidos, cedula, numero_documento, telefono, foto } = datos;
        
        // Usamos el que venga con datos
        const docReal = cedula || numero_documento;

        // 3. Definimos la consulta SQL usando los nombres REALES de tu tabla en phpMyAdmin
        const query = `
            INSERT INTO visitantes (tipo_documento, numero_documento, nombres, apellidos, telefono, foto_perfil_url)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                telefono = VALUES(telefono),
                foto_perfil_url = VALUES(foto_perfil_url)
        `;

        // 4. Ejecutamos la consulta. 
        // Pasamos 'cedula' a la columna 'numero_documento' (segunda posición)
        const [result] = await db.query(query, [
            'CC', 
            docReal, 
            nombres, 
            apellidos, 
            telefono, 
            foto // La imagen que viene de la cámara
        ]);

        // 5. Retornamos el ID para que el controlador lo use en la tabla 'visitas'
        if (result.insertId === 0) {
            const [rows] = await db.query('SELECT id_visitante FROM visitantes WHERE numero_documento = ?', [docReal]);
            return rows[0].id_visitante;
        }
        
        return result.insertId;
    }
};

module.exports = Visitante;