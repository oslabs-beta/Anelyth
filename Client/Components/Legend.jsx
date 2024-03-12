import React from 'react';
import '../Styles/D3.css';

const Legend = () => {
  return (
    <div className="legend">
      <div className="legend-item">
        <div className="legend-color" style={{ backgroundColor: "#4169E1" }}></div>
        <div className="legend-label">Backend/Server</div>
      </div>
      <div className="legend-item">
        <div className="legend-color" style={{ backgroundColor: "lightgreen" }}></div>
        <div className="legend-label">Frontend</div>
      </div>
    </div>
  );
};

export default Legend;
