// ARQUIVO 5: frontend/src/components/Hero.jsx
// Componente para a seção principal da Homepage.

import React from 'react';
import './hero.css';
import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Monte o PC dos Seus Sonhos</h1>
        <p className="hero-subtitle">Crie o PC gamer definitivo com nosso construtor intuitivo. Selecione componentes, personalize sua build e guie sua visão.</p>
        <Link to="/montador">
            <button className="btn-comecar"> {/* <-- Coloque a classe aqui */}
                Começar a Montar
            </button>
        </Link>
      </div>
    </section>
  );
}

export default Hero;