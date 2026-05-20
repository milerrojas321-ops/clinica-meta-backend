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
        const { nombre } = req.body;
        if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });

        // Llamamos al modelo para que guarde en MySQL
        const nuevaArea = await Config.crearArea(nombre);
        
        // Enviamos el objeto con ID a React para que no falle la "key"
        res.json(nuevaArea); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.eliminarArea = async (req, res) => {
    try {
        const { id } = req.params;
        // Llamamos al modelo para borrar
        await Config.borrarArea(id);
        res.json({ message: "Área eliminada con éxito" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};