const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '192.168.11.247', // <--- Forzamos IPv4 para evitar ECONNREFUSED ::1
    user: 'visitas',
    password: 'visitas', 
    database: 'control_visitas',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const db = pool.promise();

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error conectando a la base de datos de la Clínica:', err.message);
    } else {
        console.log('Conexión exitosa a la base de datos control_visitas');
        connection.release();
    }
});

module.exports = db;