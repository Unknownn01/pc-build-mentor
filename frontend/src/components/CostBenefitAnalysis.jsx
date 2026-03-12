// ARQUIVO: frontend/src/components/CostBenefitAnalysis.jsx
import React from 'react';
import { FaDollarSign, FaStar, FaChartLine, FaExclamationCircle } from 'react-icons/fa';
import './CostBenefitAnalysis.css';

const CostBenefitAnalysis = ({ costBenefit }) => {
    // Blindagem: Se não houver dados, não renderiza nada para não quebrar a tela
    if (!costBenefit || !costBenefit.analysis) {
        return null;
    }

    const { valueScore, totalPrice, overallScore, analysis, recommendations, overallRating } = costBenefit;

    const ratingInfo = {
        'excellent': { label: 'Excelente', color: '#00FF88', icon: '🏆', description: 'Custo-benefício excepcional!' },
        'very_good': { label: 'Muito Bom', color: '#00D9FF', icon: '⭐', description: 'Ótima relação custo-benefício' },
        'good': { label: 'Bom', color: '#FFD700', icon: '👍', description: 'Bom equilíbrio entre preço e desempenho' },
        'fair': { label: 'Razoável', color: '#FFA500', icon: '✓', description: 'Custo-benefício aceitável' },
        'poor': { label: 'Fraco', color: '#FF6B6B', icon: '⚠️', description: 'Pode melhorar o custo-benefício' }
    };

    const rating = ratingInfo[overallRating] || ratingInfo['fair'];

    return (
        <div className="cost-benefit-analysis">
            <h3 className="analysis-title">
                <FaDollarSign /> Análise de Custo-Benefício
            </h3>

            <div className="value-score-card">
                <div className="value-circle" style={{ borderColor: rating.color }}>
                    <span className="value-icon">{rating.icon}</span>
                    <span className="value-rating">{rating.label}</span>
                </div>
                <div className="value-info">
                    {/* .toFixed(1) com fallback para 0 caso o valor venha nulo */}
                    <h4>Score de Valor: <span style={{ color: rating.color }}>{(valueScore || 0).toFixed(1)}</span></h4>
                    <p className="value-description">{rating.description}</p>
                    <div className="value-stats">
                        <div className="stat-item">
                            <span className="stat-label">Preço Total:</span>
                            <span className="stat-value">R$ {(totalPrice || 0).toFixed(2)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Score de Desempenho:</span>
                            <span className="stat-value">{overallScore || 0}/100</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="component-analysis">
                <h4><FaChartLine /> Análise por Componente</h4>
                <div className="components-grid">
                    {analysis.map((comp, index) => {
                        const pricePercentage = comp.pricePercentage || 0;
                        let percentageColor = '#00D9FF';
                        
                        if (comp.component === 'GPU') {
                            if (pricePercentage < 35) percentageColor = '#FFA500';
                            else if (pricePercentage > 65) percentageColor = '#FF6B6B';
                            else percentageColor = '#00FF88';
                        } else if (comp.component === 'CPU') {
                            if (pricePercentage > 35) percentageColor = '#FFA500';
                            else percentageColor = '#00D9FF';
                        }

                        return (
                            <div key={index} className="component-card">
                                <div className="component-header">
                                    <h5>{comp.component}</h5>
                                    {/* Fallback para preço zero se não existir */}
                                    <span className="component-price">R$ {(comp.price || 0).toFixed(2)}</span>
                                </div>
                                <p className="component-name">{comp.name}</p>
                                
                                {/* Ajuste: Aceita 'score' ou 'powerScore' */}
                                {(comp.score !== undefined || comp.powerScore !== undefined) && (
                                    <div className="component-score">
                                        <span className="score-label">Power Score:</span>
                                        <span className="score-value">{comp.score || comp.powerScore}</span>
                                    </div>
                                )}
                                
                                {comp.capacity !== undefined && (
                                    <div className="component-specs">
                                        <span>{comp.capacity}GB @ {comp.frequency}MHz</span>
                                    </div>
                                )}
                                
                                {comp.type && (
                                    <div className="component-specs">
                                        <span>{comp.type}</span>
                                    </div>
                                )}
                                
                                {comp.power && (
                                    <div className="component-specs">
                                        <span>{comp.power}W - {comp.certification}</span>
                                    </div>
                                )}
                                
                                <div className="budget-percentage">
                                    <div className="percentage-bar">
                                        <div 
                                            className="percentage-fill" 
                                            style={{ 
                                                width: `${Math.min(pricePercentage, 100)}%`,
                                                background: percentageColor
                                            }}
                                        ></div>
                                    </div>
                                    <span className="percentage-text" style={{ color: percentageColor }}>
                                        {pricePercentage.toFixed(1)}% do orçamento
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recomendações de Custo-Benefício */}
            {recommendations && recommendations.length > 0 && (
                <div className="recommendations-section">
                    <h4><FaStar /> Oportunidades de Otimização</h4>
                    <div className="recommendations-list">
                        {recommendations.map((rec, index) => (
                            <div key={index} className="recommendation-card">
                                <div className="rec-header">
                                    <span className="rec-icon">💡</span>
                                    <h5>{rec.component}</h5>
                                    {rec.priority && (
                                        <span className={`priority-badge priority-${rec.priority}`}>
                                            {rec.priority === 'high' ? 'Alta' : 'Média'}
                                        </span>
                                    )}
                                </div>
                                <p className="rec-message">{rec.message}</p>
                                <p className="rec-suggestion">
                                    <strong>Sugestão:</strong> {rec.suggestion}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CostBenefitAnalysis;