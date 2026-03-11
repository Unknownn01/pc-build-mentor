// ARQUIVO: frontend/src/components/GameSimulation.jsx
import React from 'react';
import { FaGamepad, FaCheckCircle, FaTimesCircle, FaTrophy } from 'react-icons/fa';
import './GameSimulation.css';

const GameSimulation = ({ gamePerformance }) => {
    if (!gamePerformance || gamePerformance.length === 0) {
        return null;
    }

    // Mapeia nível de demanda para cor e descrição
    const demandLevelInfo = {
        'ultra-high': { label: 'Ultra Exigente', color: '#FF3838', icon: '🔥' },
        'high': { label: 'Exigente', color: '#FF6B6B', icon: '⚡' },
        'medium': { label: 'Moderado', color: '#FFA500', icon: '⭐' },
        'low': { label: 'Leve', color: '#00FF88', icon: '✓' }
    };

    // Função para determinar cor do FPS
    const getFpsColor = (fps) => {
        if (fps >= 100) return '#00FF88';
        if (fps >= 60) return '#00D9FF';
        if (fps >= 45) return '#FFA500';
        if (fps >= 30) return '#FF6B6B';
        return '#FF3838';
    };

    // Função para determinar ícone de jogabilidade
    const getPlayabilityIcon = (playable, fps) => {
        if (!playable) return <FaTimesCircle className="not-playable-icon" />;
        if (fps >= 60) return <FaCheckCircle className="excellent-icon" />;
        return <FaCheckCircle className="playable-icon" />;
    };

    // Separa jogos por categoria
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

            {/* Jogos Jogáveis */}
            {playableGames.length > 0 && (
                <div className="games-section playable-section">
                    <h4>✅ Jogos que Rodarão Bem</h4>
                    <div className="games-grid">
                        {playableGames.map((game, index) => {
                            const demandInfo = demandLevelInfo[game.demandLevel] || demandLevelInfo['medium'];
                            const recommendedFps = game.fps[`${game.recommended.resolution.toLowerCase().replace(' ', '_')}_${game.recommended.settings.toLowerCase().split('/')[0]}`] || 
                                                   game.fps['1080p_high'];
                            
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
                                            <span className="rec-label">Resolução:</span>
                                            <span className="rec-value">{game.recommended.resolution}</span>
                                        </div>
                                        <div className="recommended-item">
                                            <span className="rec-label">Qualidade:</span>
                                            <span className="rec-value">{game.recommended.settings}</span>
                                        </div>
                                    </div>

                                    <div className="game-fps-details">
                                        <h6>Desempenho Estimado:</h6>
                                        <div className="fps-grid">
                                            {game.fps['1080p_ultra'] > 0 && (
                                                <div className="fps-item">
                                                    <span className="fps-label">1080p Ultra</span>
                                                    <span 
                                                        className="fps-value" 
                                                        style={{ color: getFpsColor(game.fps['1080p_ultra']) }}
                                                    >
                                                        {game.fps['1080p_ultra']} FPS
                                                    </span>
                                                </div>
                                            )}
                                            {game.fps['1080p_high'] > 0 && (
                                                <div className="fps-item">
                                                    <span className="fps-label">1080p High</span>
                                                    <span 
                                                        className="fps-value" 
                                                        style={{ color: getFpsColor(game.fps['1080p_high']) }}
                                                    >
                                                        {game.fps['1080p_high']} FPS
                                                    </span>
                                                </div>
                                            )}
                                            {game.fps['1440p_high'] > 0 && (
                                                <div className="fps-item">
                                                    <span className="fps-label">1440p High</span>
                                                    <span 
                                                        className="fps-value" 
                                                        style={{ color: getFpsColor(game.fps['1440p_high']) }}
                                                    >
                                                        {game.fps['1440p_high']} FPS
                                                    </span>
                                                </div>
                                            )}
                                            {game.fps['4k_high'] > 0 && game.fps['4k_high'] >= 30 && (
                                                <div className="fps-item">
                                                    <span className="fps-label">4K High</span>
                                                    <span 
                                                        className="fps-value" 
                                                        style={{ color: getFpsColor(game.fps['4k_high']) }}
                                                    >
                                                        {game.fps['4k_high']} FPS
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Jogos Não Jogáveis */}
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
                                            <p>❌ Não atende aos requisitos mínimos</p>
                                        ) : (
                                            <p>⚠️ Desempenho abaixo do ideal</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Legenda de FPS */}
            <div className="fps-legend">
                <h5>Legenda de FPS:</h5>
                <div className="legend-items">
                    <div className="legend-item">
                        <span className="legend-color" style={{ background: '#00FF88' }}></span>
                        <span>100+ FPS - Excelente</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color" style={{ background: '#00D9FF' }}></span>
                        <span>60-99 FPS - Ótimo</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color" style={{ background: '#FFA500' }}></span>
                        <span>45-59 FPS - Bom</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color" style={{ background: '#FF6B6B' }}></span>
                        <span>30-44 FPS - Aceitável</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color" style={{ background: '#FF3838' }}></span>
                        <span>{'<'}30 FPS - Ruim</span>
                    </div>
                </div>
            </div>

            <div className="simulation-note">
                <p>
                    <strong>Nota:</strong> Os valores de FPS são estimativas baseadas nos componentes selecionados. 
                    O desempenho real pode variar dependendo de drivers, otimizações do jogo e configurações do sistema.
                </p>
            </div>
        </div>
    );
};

export default GameSimulation;
