import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Settings, MapPin, Shield, Database, Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import './Configuracion.css';

const Configuracion = () => {
const navigate = useNavigate();
const [nuevaArea, setNuevaArea] = useState('');
const [areas, setAreas] = useState([]);

// 1. Cargar áreas al iniciar
useEffect(() => {
    const fetchAreas = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/config/areas');
            setAreas(res.data);
        } catch (error) {
            console.error("Error al cargar áreas", error);
        }
    };
    fetchAreas();
}, []);

// 2. Función para agregar en la BD
const agregarArea = async () => {
    if (nuevaArea.trim()) {
        try {
            const res = await axios.post('http://localhost:3000/api/config/areas', { nombre: nuevaArea });
            setAreas([...areas, res.data]); // <--- Si res.data no trae el ID, aquí nace el error de la "key"
            setNuevaArea('');
        } catch (error) {
            alert("Error al guardar el área");
        }
    }
};

// 3. Función para eliminar en la BD
const eliminarArea = async (id) => {
    try {
        await axios.delete(`http://localhost:3000/api/config/areas/${id}`);
        setAreas(areas.filter(area => area.id !== id));
    } catch (error) {
        alert("No se pudo eliminar");
    }
};


// Validación de seguridad proactiva
useEffect(() => {
    const verificarAcceso = async () => {
    try {
        await axios.get('http://localhost:3000/api/auth/verificar-sesion');
    } catch (error) {
        if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/');
        }
    }
    };
    verificarAcceso();
}, [navigate]);

useEffect(() => {
  const usuario = JSON.parse(localStorage.getItem('usuarioClinica'));

  // Si no hay usuario o el rol no es administrador, lo expulsamos
  if (!usuario || usuario.rol !== 'administrador') {
    navigate('/inicio'); // O a una página de "Acceso Denegado"
    return;
  }
});

// const agregarArea = () => {
//     if (nuevaArea.trim()) {
//     setAreas([...areas, nuevaArea.trim()]);
//     setNuevaArea('');
//     // Aquí podrías hacer un axios.post para guardar en la BD
//     }
// };

// const eliminarArea = (index) => {
//     const nuevasAreas = areas.filter((_, i) => i !== index);
//     setAreas(nuevasAreas);
// };

return (
    <div className="config-container">
    <div className="config-card">
        <header className="config-header">
        <button onClick={() => navigate('/inicio')} className="btn-back">
            <ArrowLeft size={20} />
        </button>
        <h1><Settings size={24} /> Configuración del Sistema</h1>
        </header>

        <div className="config-body">
        {/* SECCIÓN: GESTIÓN DE ÁREAS */}
        <section className="config-section">
            <div className="section-title">
            <MapPin size={18} />
            <h3>Gestión de Áreas Destino</h3>
            </div>
            <p className="section-desc">Añade o elimina las áreas a las que los visitantes pueden dirigirse.</p>
            
            <div className="area-input-group">
            <input 
                type="text" 
                value={nuevaArea} 
                onChange={(e) => setNuevaArea(e.target.value)}
                placeholder="Ej: Sala de espera"
            />
            <button onClick={agregarArea} className="btn-add">
                <Plus size={18} /> Añadir
            </button>
            </div>
                <ul className="area-list">
                    {areas.map((area, index) => (
                        // Usamos el id de la BD, o el índice si el id fallara
                        <li key={area.id || `area-${index}`}> 
                            <span>{area.nombre}</span>
                            <button onClick={() => eliminarArea(area.id)}>Eliminar</button>
                        </li>
                    ))}
                </ul>
        </section>

        {/* SECCIÓN: SEGURIDAD */}
        <section className="config-section">
            <div className="section-title">
            <Shield size={18} />
            <h3>Seguridad de Sesión</h3>
            </div>
            <div className="config-option">
            <span>Tiempo de expiración del token</span>
            <select className="select-modern">
                <option value="60">1 Minuto (Pruebas)</option>
                <option value="3600">1 Hora (Producción)</option>
                <option value="28800">8 Horas (Turno completo)</option>
            </select>
            </div>
        </section>

        {/* SECCIÓN: MANTENIMIENTO */}
        <section className="config-section">
            <div className="section-title">
            <Database size={18} />
            <h3>Base de Datos</h3>
            </div>
            <p className="section-desc">Respalda la información para evitar pérdidas por fallos en MySQL.</p>
            <button className="btn-backup" onClick={() => alert('Generando archivo SQL...')}>
            <Save size={18} /> Crear Backup Ahora
            </button>
        </section>
        </div>
    </div>
    </div>
);
};

export default Configuracion;