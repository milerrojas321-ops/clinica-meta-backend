import React from 'react';

const TarjetaMenu = ({ titulo, descripcion, icono, ruta, color, alHacerClick }) => {
  return (
    <div 
      className="menu-card" 
      onClick={() => alHacerClick(ruta)}
      style={{ '--hover-color': color }}
    >
      <div className="card-icon" style={{ color: color }}>
        {icono}
      </div>
      <div className="card-info">
        <h3>{titulo}</h3>
        <p>{descripcion}</p>
      </div>
    </div>
  );
};

export default TarjetaMenu;