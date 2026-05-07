import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import './RegistroIngreso.css';

const RegistroIngreso = () => {
  const [datosEscaner, setDatosEscaner] = useState({
    stringCapturado: '',
    nombres: '',
    apellidos: '',
    numero_documento: '' // Cambiado de cedula a numero_documento
  });

  const [datosManuales, setDatosManuales] = useState({
    telefono: '',
    nombre_paciente: '', // Ajustado a la DB
    area_destino: 'UCI'   // Ajustado a la DB
  });

  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);

  const capturarFoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  const reintentarFoto = () => setImgSrc(null);

  const manejarEscaneo = (e) => {
    const stringRaw = e.target.value;
    if (stringRaw.length > 50) {
        setDatosEscaner({
            stringCapturado: stringRaw,
            nombres: 'JUAN CARLOS',
            apellidos: 'PEREZ',
            numero_documento: '12345678'
        });
    } else {
        setDatosEscaner({...datosEscaner, stringCapturado: stringRaw});
    }
  };

  const manejarCambioManual = (e) => {
    setDatosManuales({ ...datosManuales, [e.target.name]: e.target.value });
  };

  const confirmarRegistro = async () => {
    if (!imgSrc) {
      alert("Por favor, toma la foto del visitante antes de continuar.");
      return;
    }

    const datosFinales = {
      ...datosEscaner,
      ...datosManuales,
      foto_perfil_url: imgSrc // Nombre exacto de la columna en la DB
    };

    try {
      // Importante: id_usuario debe existir en tu tabla usuarios (usamos 1 por defecto)
      const respuesta = await axios.post('http://localhost:3000/api/visitas/ingreso', {
        ...datosFinales,
        id_usuario: 1 
      });
      alert('¡Ingreso exitoso en Clínica Meta!');
      setImgSrc(null);
      setDatosEscaner({ stringCapturado: '', nombres: '', apellidos: '', numero_documento: '' });
    } catch (error) {
      console.error(error);
      alert('Error al registrar la visita: ' + (error.response?.data?.details || 'Error interno'));
    }
  };

  const simularEscaneo = () => {
    const nombresFicticios = ["MILLER STIVEN", "DANILO", "MARIA PAULA", "CARLOS ANDRES"];
    const azar = Math.floor(Math.random() * nombresFicticios.length);
    setDatosEscaner({
        stringCapturado: "PubDSK_SIMULADO_DATA_PDF417_CLINICA_META_2026",
        nombres: nombresFicticios[azar],
        apellidos: "GONZALEZ",
        numero_documento: Math.floor(Math.random() * 1000000000).toString()
    });
  };

  return (
    <div className="contenedor-principal">
      <h1>CLÍNICA META - Registro de Visitas</h1>
      <div className="panel-flexible">
        <div className="panel-escaner">
          <h2>PASO 1: ESCANEO</h2>
          <button onClick={simularEscaneo} className="btn-simular">⚡ SIMULAR ESCANEO</button>
          <textarea value={datosEscaner.stringCapturado} onChange={manejarEscaneo} placeholder="Escanee la cédula..." />
          <div className="campos-autocompletados">
            <input type="text" value={datosEscaner.nombres} readOnly placeholder="Nombres" />
            <input type="text" value={datosEscaner.numero_documento} readOnly placeholder="Documento" />
          </div>
        </div>

        <div className="panel-manual">
          <h2>PASO 2: DATOS</h2>
          <input type="text" name="telefono" placeholder="Teléfono" onChange={manejarCambioManual} />
          <input type="text" name="nombre_paciente" placeholder="Nombre Paciente" onChange={manejarCambioManual} />
          <select name="area_destino" onChange={manejarCambioManual}>
            <option value="UCI">UCI</option>
            <option value="Piso 4">Piso 4</option>
          </select>
        </div>

        <div className="panel-foto">
          <h2>PASO 3: FOTO</h2>
          <div className="visor-camara">
            {!imgSrc ? (
              <><Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="webcam-view" />
                <button onClick={capturarFoto} className="btn-foto">CAPTURAR</button></>
            ) : (
              <><img src={imgSrc} alt="Visitante" className="foto-previa" />
                <button onClick={reintentarFoto} className="btn-reintentar">TOMAR OTRA</button></>
            )}
          </div>
          <button onClick={confirmarRegistro} className="btn-confirmar">CONFIRMAR TODO</button>
        </div>
      </div>
    </div>
  );
};

export default RegistroIngreso;