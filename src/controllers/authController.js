const db = require('../database/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const authController = {
    login: async (req, res) => {
        const { usuario, password, tiempoExpiracion } = req.body;
        const query = 'SELECT * FROM usuarios WHERE username = ?';
        
        try {
            const [result] = await db.query(query, [usuario]);

            if (result.length > 0) {
                const usuarioEncontrado = result[0];
                const coinciden = await bcrypt.compare(password, usuarioEncontrado.password);

                if (coinciden) {
                    const userPayload = { 
                        id: usuarioEncontrado.id, 
                        nombre_completo: usuarioEncontrado.nombre_completo, 
                        username: usuarioEncontrado.username,              
                        rol: usuarioEncontrado.rol 
                    };

                    const tiempoFinal = tiempoExpiracion || '1h';

                    // Generamos el token usando la variable dinámica
                    const token = jwt.sign(
                        userPayload, 
                        'TU_PALABRA_SECRETA_SUPER_SEGURA', 
                        { expiresIn: tiempoFinal }
                    );

                    return res.json({ 
                        success: true, 
                        user: userPayload,
                        token: token 
                    });
                } else {
                    return res.status(401).json({ success: false, mensaje: 'Credenciales inválidas' });
                }
            } else {
                return res.status(401).json({ success: false, mensaje: 'Credenciales inválidas' });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, mensaje: 'Error en el servidor' });
        }
    },

register: async (req, res) => {
        const { nombre_completo, username, password, rol } = req.body;

        if (!nombre_completo || !username || !password || !rol) {
            return res.status(400).json({ 
                success: false, 
                msg: "Todos los campos son obligatorios." 
            });
        }

        try {
            // Verificar si el usuario ya existe
            const [usuarioExistente] = await db.query(
                'SELECT * FROM usuarios WHERE username = ?', 
                [username]
            );

            if (usuarioExistente.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    msg: "El nombre de usuario ya está registrado." 
                });
            }

            // Encriptar la contraseña por seguridad
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Insertar en la base de datos
            const query = `
                INSERT INTO usuarios (nombre_completo, username, password, rol) 
                VALUES (?, ?, ?, ?)
            `;
            await db.query(query, [nombre_completo, username, hashedPassword, rol]);

            return res.status(201).json({
                success: true,
                msg: "¡Usuario autorizado y registrado con éxito!"
            });

        } catch (error) {
            console.error("Error en el registro:", error);
            return res.status(500).json({
                success: false,
                msg: "Hubo un error interno en el servidor."
            });
        }
    },
    generarBackup: async (req, res) => {
        // Configuración de tu base de datos (Ajusta con tus credenciales de phpMyAdmin)
        const dbUser = 'root';
        const dbPassword = ''; // Deja vacío si en XAMPP no tienes contraseña
        const dbName = 'clinica_meta_registro'; // 🚨 REVISA: Pon el nombre exacto de tu BD
        
        // Creamos un nombre de archivo único con la fecha de hoy
        const fecha = new Date().toISOString().slice(0,10);
        const nombreArchivo = `backup_${dbName}_${fecha}.sql`;
        const rutaArchivo = path.join(__dirname, `../backups/${nombreArchivo}`);

        // Asegurar que la carpeta 'backups' exista en tu proyecto backend
        const carpetaBackups = path.join(__dirname, '../backups');
        if (!fs.existsSync(carpetaBackups)){
            fs.mkdirSync(carpetaBackups);
        }

        // Construimos el comando de mysqldump (Apto para Windows/XAMPP)
        // Si tienes contraseña usas: `mysqldump -u ${dbUser} -p${dbPassword} ${dbName} > "${rutaArchivo}"`
        const comando = `"C:\\xampp\\mysql\\bin\\mysqldump" -u ${dbUser} ${dbName} > "${rutaArchivo}"`;

        // Ejecutamos el comando en la terminal del servidor
        exec(comando, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error al ejecutar mysqldump: ${error.message}`);
                return res.status(500).json({ success: false, mensaje: 'Error al generar la copia de seguridad.' });
            }

            // Si todo salió bien, enviamos el archivo generado para que el navegador lo descargue
            res.download(rutaArchivo, nombreArchivo, (err) => {
                if (err) {
                    console.error(`Error al enviar el archivo: ${err}`);
                }
                // Opcional: Eliminar el archivo del servidor después de descargarlo para no llenar espacio
                fs.unlinkSync(rutaArchivo); 
            });
        });
    }
};

module.exports = authController;