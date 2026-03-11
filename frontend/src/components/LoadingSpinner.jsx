// frontend/src/components/LoadingSpinner.jsx
import React from 'react';
import './LoadingSpinner.css'; // Vamos criar este CSS

const LoadingSpinner = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner-container">
        <img 
          src="/images/logo_minimalista.png" // ✨ Seu logo PNG transparente ✨
          alt="Loading..." 
          className="loading-spinner-logo" 
        />
        {/* Opcional: Adicione um texto ou um spinner CSS se quiser */}
        {/* <div className="spinner-animation"></div> */}
        {/* <p className="loading-text">Carregando...</p> */}
      </div>
    </div>
  );
};

export default LoadingSpinner;