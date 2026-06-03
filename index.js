const express = require('express');
const cors = require('cors'); // 1. IMPORTACION DE CORS
const db = require('./src/database/db');
const visitanteRoutes = require('./src/routes/visitanteRoutes');
const visitaRoutes = require('./src/routes/visitaRoutes');
const authRoutes = require('./src/routes/authRoutes');
const configRoutes = require('./src/routes/configRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARES
app.use(cors()); // 3. ACTIVACION DE CORS
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// RUTAS
app.use('/api/visitantes', visitanteRoutes);
app.use('/api/visitas', visitaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
// Ruta de prueba inicial
app.get('/', (req, res) => {
    res.send('Servidor de la Clínica Meta funcionando correctamente 🏥');
});

// Ruta para verificar la base de datos
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        res.json({
            status: 'Conectado',
            message: 'La base de datos respondió correctamente',
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            status: 'Error',
            message: 'No se pudo conectar a la base de datos',
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en: http://localhost:${PORT}`);
});