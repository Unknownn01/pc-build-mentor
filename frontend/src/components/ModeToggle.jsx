import React from 'react';
import { FaMagic, FaTools } from 'react-icons/fa';
import './ModeToggle.css';

function ModeToggle({ mode, setMode }) {
    const handleToggle = (newMode) => {
        localStorage.setItem('pcbuildmentor_mode', newMode);
        setMode(newMode);
    };

    return (
        <div className="mode-toggle-bar">
            <div className="mode-toggle-label">
                {mode === 'easy' ? (
                    <span className="mode-badge easy"><FaMagic /> MODO FÁCIL</span>
                ) : (
                    <span className="mode-badge advanced"><FaTools /> MODO AVANÇADO</span>
                )}
            </div>
            <div className="mode-toggle-switch">
                <button
                    className={`mode-toggle-btn ${mode === 'easy' ? 'active-easy' : ''}`}
                    onClick={() => handleToggle('easy')}
                >
                    <FaMagic /> Fácil
                </button>
                <button
                    className={`mode-toggle-btn ${mode === 'advanced' ? 'active-advanced' : ''}`}
                    onClick={() => handleToggle('advanced')}
                >
                    <FaTools /> Avançado
                </button>
            </div>
        </div>
    );
}

export default ModeToggle;