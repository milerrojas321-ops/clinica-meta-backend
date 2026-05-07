const mysql = require('mysql2');

// Creamos un "Pool" de conexiones para mejorar el rendimiento
const pool = mysql.createPool({
    host: 'localhost',      // Tu servidor local
    user: 'root',           // Tu usuario de MySQL Workbench (por defecto es root)
    password: '', // <--- CLAVE DE MYSQL
    database: 'clinica_meta_registro', // El nombre que le diste a la BD
    waitForConnections: true,
    connectionLimit: 10,    // Máximo de conexiones simultáneas
    queueLimit: 0
});

// Convertimos el pool para usar Promesas (esto facilita el código moderno)
const db = pool.promise();

// Prueba de conexión rápida
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error conectando a la base de datos de la Clínica:', err.message);
    } else {
        console.log('Conexión exitosa a la base de datos clinica_meta_registro');
        connection.release(); // Liberamos la conexión de prueba
    }
});

module.exports = db;