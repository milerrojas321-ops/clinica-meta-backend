// controllers/authController.js
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

                // VALIDACIÓN DE USUARIO DESACTIVADO
                if (usuarioEncontrado.activo === 0 || usuarioEncontrado.activo === false) {
                    return res.status(403).json({ 
                        success: false, 
                        mensaje: 'Tu cuenta ha sido desactivada. Contacta al administrador.' 
                    });
                }

                const coinciden = await bcrypt.compare(password, usuarioEncontrado.password);

                if (coinciden) {
                    const idReal = usuarioEncontrado.id_usuario;

                    const userPayload = { 
                        id_usuario: idReal,
                        nombre_completo: usuarioEncontrado.nombre_completo, 
                        username: usuarioEncontrado.username,              
                        rol: usuarioEncontrado.rol 
                    };

                    const tiempoFinal = tiempoExpiracion || '1h';

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

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const query = `
                INSERT INTO usuarios (nombre_completo, username, password, rol, activo) 
                VALUES (?, ?, ?, ?, 1)
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

    // LISTAR TODOS LOS USUARIOS
    obtenerUsuarios: async (req, res) => {
        try {
            const [usuarios] = await db.query(
                'SELECT id_usuario, nombre_completo, username, rol, activo FROM usuarios ORDER BY id_usuario DESC'
            );
            return res.json({ success: true, usuarios });
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            return res.status(500).json({ success: false, msg: "Error al listar usuarios" });
        }
    },

    // CAMBIAR ESTADO ACTIVO/INACTIVO
    cambiarEstadoUsuario: async (req, res) => {
        const { id } = req.params;
        const { activo } = req.body;

        try {
            const estadoNumerico = activo ? 1 : 0;
            await db.query(
                'UPDATE usuarios SET activo = ? WHERE id_usuario = ?', 
                [estadoNumerico, id]
            );
            return res.json({ 
                success: true, 
                msg: `Usuario ${activo ? 'activado' : 'desactivado'} con éxito.` 
            });
        } catch (error) {
            console.error("Error al cambiar estado:", error);
            return res.status(500).json({ success: false, msg: "Error al actualizar estado del usuario" });
        }
    },

    verificarSesion: (req, res) => {
        return res.json({ 
            success: true, 
            valida: true, 
            usuario: req.usuario || null 
        });
    },

    generarBackup: async (req, res) => {
        const dbHost = '192.168.11.247';
        const dbUser = 'visitas';
        const dbPassword = 'visitas';
        const dbName = 'control_visitas'; 
        
        const fecha = new Date().toISOString().slice(0,10);
        const nombreArchivo = `backup_${dbName}_${fecha}.sql`;

        const carpetaBackups = path.join(__dirname, '../backups');
        if (!fs.existsSync(carpetaBackups)){
            fs.mkdirSync(carpetaBackups, { recursive: true });
        }

        const rutaArchivo = path.join(carpetaBackups, nombreArchivo);

        const mysqldumpExecutable = `"C:\\databases\\mysql\\bin\\mysqldump.exe"`;
        const comando = `${mysqldumpExecutable} -h ${dbHost} -u ${dbUser} -p${dbPassword} ${dbName} > "${rutaArchivo}"`;

        exec(comando, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error al ejecutar mysqldump: ${error.message}`);
                return res.status(500).json({ success: false, mensaje: 'Error al generar la copia de seguridad.' });
            }

            res.download(rutaArchivo, nombreArchivo, (err) => {
                if (err) {
                    console.error(`Error al enviar el archivo: ${err}`);
                }
                if (fs.existsSync(rutaArchivo)) {
                    fs.unlinkSync(rutaArchivo); 
                }
            });
        });
    }
};

module.exports = authController;