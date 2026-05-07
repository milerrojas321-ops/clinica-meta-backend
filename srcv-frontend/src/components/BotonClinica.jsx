import React from 'react';
import './BotonClinica.css';

const BotonClinica = ({ texto, alHacerClick, tipo = "primary", icono }) => {
  return (
    <button className={`btn-clinica ${tipo}`} onClick={alHacerClick}>
      {icono && <span className="btn-icon">{icono}</span>}
      {texto}
    </button>
  );
};

export default BotonClinica;