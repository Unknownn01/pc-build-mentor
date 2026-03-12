// ARQUIVO: frontend/src/components/GameSimulation.jsx
import React from 'react';
import { FaGamepad, FaCheckCircle, FaTimesCircle, FaTrophy } from 'react-icons/fa';
import './GameSimulation.css';

const GameSimulation = ({ gamePerformance }) => {
    if (!gamePerformance || gamePerformance.length === 0) {
        return null;
    }

    const demandLevelInfo = {
        'ultra-high': { label: 'Ultra Exigente', color: '#FF3838', icon: '🔥' },
        'high': { label: 'Exigente', color: '#FF6B6B', icon: '⚡' },
        'medium': { label: 'Moderado', color: '#FFA500', icon: '⭐' },
        'low': { label: 'Leve', color: '#00FF88', icon: '✓' }
    };

    const getFpsColor = (fps) => {
        if (fps >= 100) return '#00FF88';
        if (fps >= 60) return '#00D9FF';
        if (fps >= 45) return '#FFA500';
        if (fps >= 30) return '#FF6B6B';
        return '#FF3838';
    };

    const getPlayabilityIcon = (playable, fps) => {
        if (!playable || fps < 30) return <FaTimesCircle className="not-playable-icon" />;
        if (fps >= 60) return <FaCheckCircle className="excellent-icon" />;
        return <FaCheckCircle className="playable-icon" />;
    };

    const playableGames = gamePerformance.filter(g => g.playable);
    const unplayableGames = gamePerformance.filter(g => !g.playable);

    return (
        <div className="game-simulation">
            <h3 className="simulation-title">
                <FaGamepad /> Simulação de Desempenho em Jogos
            </h3>

            <div className="simulation-summary">
                <div className="summary-card">
                    <FaTrophy className="summary-icon" />
                    <div className="summary-info">
                        <span className="summary-number">{playableGames.length}</span>
                        <span className="summary-label">Jogos Compatíveis</span>
                    </div>
                </div>
                <div className="summary-card">
                    <FaGamepad className="summary-icon" />
                    <div className="summary-info">
                        <span className="summary-number">{gamePerformance.length}</span>
                        <span className="summary-label">Total Testados</span>
                    </div>
                </div>
            </div>

            {playableGames.length > 0 && (
                <div className="games-section playable-section">
                    <h4>✅ Jogos que Rodarão Bem</h4>
                    <div className="games-grid">
                        {playableGames.map((game, index) => {
                            const demandInfo = demandLevelInfo[game.demandLevel] || demandLevelInfo['medium'];
                            
                            // Blindagem para acesso seguro aos FPS recomendados
                            const resKey = game.recommended?.resolution?.toLowerCase().replace(' ', '_') || '1080p';
                            const setKey = game.recommended?.settings?.toLowerCase().split('/')[0] || 'high';
                            const recommendedFps = game.fps[`${resKey}_${setKey}`] || game.fps['1080p_high'] || 0;
                            
                            return (
                                <div key={index} className="game-card playable">
                                    <div className="game-header">
                                        <h5 className="game-name">{game.game}</h5>
                                        {getPlayabilityIcon(game.playable, recommendedFps)}
                                    </div>
                                    
                                    <div className="game-demand">
                                        <span className="demand-badge" style={{ background: demandInfo.color }}>
                                            {demandInfo.icon} {demandInfo.label}
                                        </span>
                                    </div>

                                    <div className="game-recommended">
                                        <div className="recommended-item">
                                            <span className="rec-label">Resolução Ideal:</span>
                                            <span className="rec-value">{game.recommended?.resolution || '1080p'}</span>
                                        </div>
                                        <div className="recommended-item">
                                            <span className="rec-label">Preset:</span>
                                            <span className="rec-value">{game.recommended?.settings || 'High'}</span>
                                        </div>
                                    </div>

                                    <div className="game-fps-details">
                                        <div className="fps-main-display">
                                            <span className="fps-large" style={{ color: getFpsColor(recommendedFps) }}>
                                                {recommendedFps} FPS
                                            </span>
                                        </div>
                                        <div className="fps-grid">
                                            {/* Renderização condicional para não poluir com 0 FPS */}
                                            {Object.entries(game.fps).map(([res, val]) => (
                                                val > 0 && (
                                                    <div key={res} className="fps-item">
                                                        <span className="fps-label">{res.replace('_', ' ')}</span>
                                                        <span className="fps-value" style={{ color: getFpsColor(val) }}>{val}</span>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {unplayableGames.length > 0 && (
                <div className="games-section unplayable-section">
                    <h4>⚠️ Jogos com Desempenho Limitado</h4>
                    <div className="games-grid">
                        {unplayableGames.map((game, index) => {
                            const demandInfo = demandLevelInfo[game.demandLevel] || demandLevelInfo['medium'];
                            return (
                                <div key={index} className="game-card unplayable">
                                    <div className="game-header">
                                        <h5 className="game-name">{game.game}</h5>
                                        <FaTimesCircle className="not-playable-icon" />
                                    </div>
                                    <div className="game-demand">
                                        <span className="demand-badge" style={{ background: demandInfo.color }}>
                                            {demandInfo.icon} {demandInfo.label}
                                        </span>
                                    </div>
                                    <div className="unplayable-reason">
                                        {!game.meetsMinRequirements ? (
                                            <p>❌ Abaixo do Requisito Mínimo</p>
                                        ) : (
                                            <p>⚠️ FPS Insuficiente (Gargalo)</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameSimulation;