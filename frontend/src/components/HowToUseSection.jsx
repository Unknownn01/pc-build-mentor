import React from 'react';
import { FaCog, FaListUl, FaShoppingCart } from 'react-icons/fa';
import './HowToUseSection.css';

function HowToUseSection() {
  return (
    <section className="how-to-use-section">
      <h2>Como Usar o PC Build Mentor</h2>
      <div className="how-to-cards-container">
        <div className="how-to-card">
          <FaCog className="how-to-icon" />
          <h4>Selecione Componentes</h4>
          <p>Escolha entre uma ampla gama de componentes de alta qualidade, garantindo compatibilidade e desempenho ideal.</p>
        </div>
        <div className="how-to-card">
          <FaListUl className="how-to-icon" />
          <h4>Personalize Sua Montagem</h4>
          <p>Ajuste sua configuração com refrigeração personalizada, iluminação e acessórios para combinar com seu estilo.</p>
        </div>
        <div className="how-to-card">
          <FaShoppingCart className="how-to-icon" />
          <h4>Peça e Monte</h4>
          <p>Receba seus componentes e siga nosso guia passo a passo para montar o PC dos seus sonhos.</p>
        </div>
      </div>
    </section>
  );
}

export default HowToUseSection;