// ARQUIVO: frontend/src/components/PerformanceAnalysis.jsx
import React from 'react';
import { FaTrophy, FaStar, FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import './PerformanceAnalysis.css';

const PerformanceAnalysis = ({ analysis }) => {
    if (!analysis || !analysis.overallScore) {
        return null;
    }

    const { overallScore, bottleneckAnalysis, resolutionCapability, summary } = analysis;

    // Mapeia tier para descrição em português
    const tierDescriptions = {
        'ultra': { label: 'Ultra High-End', color: '#FFD700', icon: '👑' },
        'high': { label: 'High-End', color: '#00D9FF', icon: '🚀' },
        'medium-high': { label: 'Médio-Alto', color: '#00FF88', icon: '⭐' },
        'medium': { label: 'Médio', color: '#FFA500', icon: '✓' },
        'low-medium': { label: 'Médio-Baixo', color: '#FF6B6B', icon: '⚠️' },
        'low': { label: 'Entrada', color: '#999', icon: '📱' },
        'incomplete': { label: 'Incompleto', color: '#666', icon: '❓' }
    };

    const tierInfo = tierDescriptions[overallScore.tier] || tierDescriptions['incomplete'];

    // Mapeia severidade para estilo
    const severityStyles = {
        'critical': 'severity-critical',
        'high': 'severity-high',
        'medium': 'severity-medium',
        'low': 'severity-low',
        'good': 'severity-good',
        'info': 'severity-info'
    };

    return (
        <div className="performance-analysis">
            <h3 className="analysis-title">
                <FaTrophy /> Análise de Desempenho
            </h3>

            {/* Score Geral */}
            <div className="overall-score-card">
                <div className="score-circle" style={{ borderColor: tierInfo.color }}>
                    <span className="score-number">{overallScore.score}</span>
                    <span className="score-label">/ 100</span>
                </div>
                <div className="score-info">
                    <h4 style={{ color: tierInfo.color }}>
                        {tierInfo.icon} {tierInfo.label}
                    </h4>
                    <p className="score-description">{resolutionCapability.message}</p>
                </div>
            </div>

            {/* Breakdown de Componentes */}
            <div className="score-breakdown">
                <h4>Contribuição dos Componentes</h4>
                <div className="breakdown-bars">
                    <div className="breakdown-item">
                        <span className="breakdown-label">GPU</span>
                        <div className="breakdown-bar">
                            <div 
                                className="breakdown-fill gpu-fill" 
                                style={{ width: `${overallScore.breakdown.gpu}%` }}
                            >
                                {overallScore.breakdown.gpu}
                            </div>
                        </div>
                    </div>
                    <div className="breakdown-item">
                        <span className="breakdown-label">CPU</span>
                        <div className="breakdown-bar">
                            <div 
                                className="breakdown-fill cpu-fill" 
                                style={{ width: `${overallScore.breakdown.cpu}%` }}
                            >
                                {overallScore.breakdown.cpu}
                            </div>
                        </div>
                    </div>
                    <div className="breakdown-item">
                        <span className="breakdown-label">RAM</span>
                        <div className="breakdown-bar">
                            <div 
                                className="breakdown-fill ram-fill" 
                                style={{ width: `${overallScore.breakdown.ram}%` }}
                            >
                                {overallScore.breakdown.ram}
                            </div>
                        </div>
                    </div>
                    <div className="breakdown-item">
                        <span className="breakdown-label">Storage</span>
                        <div className="breakdown-bar">
                            <div 
                                className="breakdown-fill storage-fill" 
                                style={{ width: `${overallScore.breakdown.storage}%` }}
                            >
                                {overallScore.breakdown.storage}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Capacidade de Resolução */}
            <div className="resolution-capability">
                <h4>Capacidade de Resolução</h4>
                <div className="resolution-primary">
                    <span className="resolution-badge">{resolutionCapability.primary}</span>
                    <span className="resolution-text">Resolução Ideal</span>
                </div>
                <div className="resolution-details">
                    {resolutionCapability.capabilities && resolutionCapability.capabilities.map((cap, index) => (
                        <div 
                            key={index} 
                            className={`resolution-item ${cap.viable ? 'viable' : 'not-viable'}`}
                        >
                            <div className="resolution-header">
                                <span className="resolution-name">{cap.resolution}</span>
                                {cap.viable ? <FaCheckCircle className="viable-icon" /> : <FaInfoCircle className="not-viable-icon" />}
                            </div>
                            <div className="resolution-specs">
                                <span className="quality-badge">{cap.quality}</span>
                                <span className="fps-badge">{cap.fps}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Análise de Gargalos */}
            <div className={`bottleneck-analysis ${severityStyles[bottleneckAnalysis.severity]}`}>
                <h4>
                    {bottleneckAnalysis.severity === 'good' && <FaCheckCircle />}
                    {bottleneckAnalysis.severity === 'info' && <FaInfoCircle />}
                    {(bottleneckAnalysis.severity === 'low' || bottleneckAnalysis.severity === 'medium') && <FaExclamationTriangle />}
                    {(bottleneckAnalysis.severity === 'high' || bottleneckAnalysis.severity === 'critical') && <FaExclamationTriangle />}
                    Análise de Gargalos
                </h4>

                {/* Pontos Fortes */}
                {bottleneckAnalysis.strengths && bottleneckAnalysis.strengths.length > 0 && (
                    <div className="strengths-section">
                        <h5>✅ Pontos Fortes</h5>
                        {bottleneckAnalysis.strengths.map((strength, index) => (
                            <div key={index} className="strength-item">
                                <strong>{strength.message}</strong>
                                <p>{strength.description}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Gargalos Críticos */}
                {bottleneckAnalysis.bottlenecks && bottleneckAnalysis.bottlenecks.length > 0 && (
                    <div className="bottlenecks-section">
                        <h5>🚨 Gargalos Detectados</h5>
                        {bottleneckAnalysis.bottlenecks.map((bottleneck, index) => (
                            <div key={index} className={`bottleneck-item severity-${bottleneck.severity}`}>
                                <div className="bottleneck-header">
                                    <strong>{bottleneck.message}</strong>
                                    <span className="severity-badge">{bottleneck.severity === 'critical' ? 'CRÍTICO' : 'ALTO'}</span>
                                </div>
                                <p className="bottleneck-description">{bottleneck.description}</p>
                                <p className="bottleneck-impact"><strong>Impacto:</strong> {bottleneck.impact}</p>
                                <p className="bottleneck-suggestion">💡 <strong>Sugestão:</strong> {bottleneck.suggestion}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Avisos */}
                {bottleneckAnalysis.warnings && bottleneckAnalysis.warnings.length > 0 && (
                    <div className="warnings-section">
                        <h5>⚠️ Avisos</h5>
                        {bottleneckAnalysis.warnings.map((warning, index) => (
                            <div key={index} className="warning-item">
                                <strong>{warning.message}</strong>
                                <p>{warning.description}</p>
                                <p className="warning-suggestion">💡 {warning.suggestion}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Resumo Rápido */}
            <div className="quick-summary">
                <div className="summary-stat">
                    <span className="stat-label">Jogos Compatíveis</span>
                    <span className="stat-value">{summary.playableGames}/{summary.totalGames}</span>
                </div>
                <div className="summary-stat">
                    <span className="stat-label">Tier</span>
                    <span className="stat-value">{tierInfo.label}</span>
                </div>
                <div className="summary-stat">
                    <span className="stat-label">Resolução Ideal</span>
                    <span className="stat-value">{summary.primaryResolution}</span>
                </div>
            </div>
        </div>
    );
};

export default PerformanceAnalysis;
