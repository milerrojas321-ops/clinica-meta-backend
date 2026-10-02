const Config = require('../models/configModel');

exports.listarAreas = async (req, res) => {
    try {
        const areas = await Config.getAreas();
        res.json(areas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.guardarArea = async (req, res) => { 
    try {
        const { nombre, max_visitantes } = req.body;
        if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

        const nuevaArea = await Config.crearArea(nombre, max_visitantes);
        res.json(nuevaArea); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.editarArea = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, max_visitantes } = req.body;

        if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

        const areaActualizada = await Config.actualizarArea(id, nombre, max_visitantes);
        res.json(areaActualizada);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.eliminarArea = async (req, res) => {
    try {
        const { id } = req.params;
        await Config.borrarArea(id);
        res.json({ message: "Área eliminada con éxito" });
    } catch (err) {
        console.error("Error al eliminar área:", err);
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
            return res.status(400).json({ 
                message: "No se puede eliminar esta área porque existen pacientes o registros asociados a ella." 
            });
        }
        res.status(500).json({ message: "Error interno en el servidor al intentar eliminar el área." });
    }
};

// --- NUEVAS RUTAS DE CONTROL DE CONFIGURACIÓN ---
exports.obtenerParametros = async (req, res) => {
    try {
        const parametros = await Config.getParametros();
        res.json(parametros);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.actualizarParametro = async (req, res) => {
    try {
        const { clave, valor } = req.body;
        await Config.guardarParametro(clave, valor);
        res.json({ success: true, message: "Configuración actualizada correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};