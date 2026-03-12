// ARQUIVO: frontend/src/components/PerformanceAnalysis.jsx
import React from 'react';
import { FaTrophy, FaStar, FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import './PerformanceAnalysis.css';

const PerformanceAnalysis = ({ analysis }) => {
    // Blindagem inicial: Se o objeto base ou o score não existirem, oculta o componente
    if (!analysis || !analysis.overallScore) {
        return null;
    }

    // Extração segura com valores padrão
    const { 
        overallScore = {}, 
        bottleneckAnalysis = { severity: 'info', strengths: [], bottlenecks: [], warnings: [] }, 
        resolutionCapability = { capabilities: [] }, 
        summary = {} 
    } = analysis;

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

            {/* Score Geral com Círculo de Progressão */}
            <div className="overall-score-card">
                <div className="score-circle" style={{ borderColor: tierInfo.color }}>
                    <span className="score-number">{overallScore.score || 0}</span>
                    <span className="score-label">/ 100</span>
                </div>
                <div className="score-info">
                    <h4 style={{ color: tierInfo.color }}>
                        {tierInfo.icon} {tierInfo.label}
                    </h4>
                    <p className="score-description">{resolutionCapability.message || 'Análise de resolução pendente'}</p>
                </div>
            </div>

            {/* Barras de Contribuição: Crucial para o TCC mostrar o equilíbrio */}
            <div className="score-breakdown">
                <h4>Contribuição dos Componentes</h4>
                <div className="breakdown-bars">
                    {['gpu', 'cpu', 'ram', 'storage'].map(comp => (
                        <div className="breakdown-item" key={comp}>
                            <span className="breakdown-label">{comp.toUpperCase()}</span>
                            <div className="breakdown-bar">
                                <div 
                                    className={`breakdown-fill ${comp}-fill`} 
                                    style={{ width: `${overallScore.breakdown?.[comp] || 0}%` }}
                                >
                                    {overallScore.breakdown?.[comp] || 0}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Capacidade de Resolução Visual */}
            <div className="resolution-capability">
                <h4>Capacidade de Resolução</h4>
                <div className="resolution-primary">
                    <span className="resolution-badge">{resolutionCapability.primary || 'N/A'}</span>
                    <span className="resolution-text">Resolução Ideal</span>
                </div>
                <div className="resolution-details">
                    {resolutionCapability.capabilities?.map((cap, index) => (
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

            {/* Análise de Gargalo - O diferencial do seu projeto */}
            <div className={`bottleneck-analysis ${severityStyles[bottleneckAnalysis.severity] || 'severity-info'}`}>
                <h4>
                    {bottleneckAnalysis.severity === 'good' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                    Análise de Gargalos
                </h4>

                {/* Seção de Pontos Fortes */}
                {bottleneckAnalysis.strengths?.length > 0 && (
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

                {/* Seção de Gargalos Críticos */}
                {bottleneckAnalysis.bottlenecks?.length > 0 && (
                    <div className="bottlenecks-section">
                        <h5>🚨 Gargalos Detectados</h5>
                        {bottleneckAnalysis.bottlenecks.map((b, index) => (
                            <div key={index} className={`bottleneck-item severity-${b.severity}`}>
                                <div className="bottleneck-header">
                                    <strong>{b.message}</strong>
                                    <span className="severity-badge">{b.severity?.toUpperCase()}</span>
                                </div>
                                <p className="bottleneck-description">{b.description}</p>
                                <p className="bottleneck-impact"><strong>Impacto:</strong> {b.impact}</p>
                                <p className="bottleneck-suggestion">💡 <strong>Sugestão:</strong> {b.suggestion}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Rodapé de Resumo Rápido */}
            <div className="quick-summary">
                <div className="summary-stat">
                    <span className="stat-label">Jogos Compatíveis</span>
                    <span className="stat-value">{summary.playableGames || 0}/{summary.totalGames || 0}</span>
                </div>
                <div className="summary-stat">
                    <span className="stat-label">Tier</span>
                    <span className="stat-value">{tierInfo.label}</span>
                </div>
                <div className="summary-stat">
                    <span className="stat-label">Resolução</span>
                    <span className="stat-value">{summary.primaryResolution || 'N/A'}</span>
                </div>
            </div>
        </div>
    );
};

export default PerformanceAnalysis;