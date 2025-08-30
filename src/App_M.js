import React from 'react';
import { FaTools, FaDatabase, FaSpinner } from "react-icons/fa";

const iconStyle = {
  fontSize: 70,
  margin: "0 15px",
  color: "#4CAF50",
  animation: "spin 2s linear infinite",
};

const iconDatabaseStyle = {
  ...iconStyle,
  color: "#2196F3",
  animation: "bounce 1.2s infinite",
};

const iconToolsStyle = {
  ...iconStyle,
  color: "#FFC107",
  animation: "wobble 1.6s infinite",
};

export default function MaintenancePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 34 }}>
        <FaTools style={iconToolsStyle} />
        <FaDatabase style={iconDatabaseStyle} />
        <FaSpinner style={iconStyle} />
      </div>
      <h1 style={{ color: '#4CAF50', marginBottom: 16 }}>Página en Mantenimiento</h1>
      <p style={{ fontSize: 20, color: '#666', textAlign: "center" }}>
        Estamos realizando tareas de mantenimiento en la base de datos.<br />
        Por favor, vuelve a intentarlo más tarde.
      </p>
      {/* Animaciones CSS */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-30px);}
          }
          @keyframes wobble {
            0%, 100% { transform: rotate(-10deg);}
            50% { transform: rotate(10deg);}
          }
        `}
      </style>
    </div>
  );
}