import React from 'react';
import { FaMagic, FaTools } from 'react-icons/fa';
import './WelcomeModal.css';

function WelcomeModal({ onSelectMode }) {
    const handleSelect = (mode) => {
        localStorage.setItem('pcbuildmentor_mode', mode);
        localStorage.setItem('pcbuildmentor_onboarded', 'true');
        onSelectMode(mode);
    };

    return (
        <div className="welcome-modal-backdrop">
            <div className="welcome-modal-content">
                <h2>Bem-vindo ao PC Build Mentor! 👋</h2>
                <p className="welcome-subtitle">Como você prefere montar seu PC hoje?</p>

                <div className="welcome-options">
                    <button className="welcome-option easy" onClick={() => handleSelect('easy')}>
                        <FaMagic className="welcome-icon" />
                        <h3>Modo Fácil</h3>
                        <p>Para você que quer montar o melhor PC, mas não entende muito de hardware. Vamos te guiar passo a passo.</p>
                    </button>

                    <button className="welcome-option advanced" onClick={() => handleSelect('advanced')}>
                        <FaTools className="welcome-icon" />
                        <h3>Modo Avançado</h3>
                        <p>Para você que já entende de computadores e prefere montar tudo sozinho, peça por peça.</p>
                    </button>
                </div>

                <p className="welcome-footer">Você pode trocar de modo a qualquer momento na tela de Montador.</p>
            </div>
        </div>
    );
}

export default WelcomeModal;