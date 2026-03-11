// ARQUIVO: frontend/src/components/CostBenefitAnalysis.jsx
import React from 'react';
import { FaDollarSign, FaStar, FaChartLine, FaExclamationCircle } from 'react-icons/fa';
import './CostBenefitAnalysis.css';

const CostBenefitAnalysis = ({ costBenefit }) => {
    if (!costBenefit || !costBenefit.analysis) {
        return null;
    }

    const { valueScore, totalPrice, overallScore, analysis, recommendations, overallRating } = costBenefit;

    // Mapeia rating para descrição
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

            {/* Score de Valor */}
            <div className="value-score-card">
                <div className="value-circle" style={{ borderColor: rating.color }}>
                    <span className="value-icon">{rating.icon}</span>
                    <span className="value-rating">{rating.label}</span>
                </div>
                <div className="value-info">
                    <h4>Score de Valor: <span style={{ color: rating.color }}>{valueScore.toFixed(1)}</span></h4>
                    <p className="value-description">{rating.description}</p>
                    <div className="value-stats">
                        <div className="stat-item">
                            <span className="stat-label">Preço Total:</span>
                            <span className="stat-value">R$ {totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Score de Desempenho:</span>
                            <span className="stat-value">{overallScore}/100</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Análise por Componente */}
            <div className="component-analysis">
                <h4><FaChartLine /> Análise por Componente</h4>
                <div className="components-grid">
                    {analysis.map((comp, index) => {
                        const pricePercentage = comp.pricePercentage || 0;
                        let percentageColor = '#00D9FF';
                        
                        // Cores baseadas na porcentagem do orçamento
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
                                    <span className="component-price">R$ {comp.price?.toFixed(2) || '0.00'}</span>
                                </div>
                                <p className="component-name">{comp.name}</p>
                                
                                {comp.score !== undefined && (
                                    <div className="component-score">
                                        <span className="score-label">Power Score:</span>
                                        <span className="score-value">{comp.score}</span>
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

            {/* Recomendações */}
            {recommendations && recommendations.length > 0 && (
                <div className="recommendations-section">
                    <h4><FaStar /> Oportunidades de Otimização</h4>
                    <div className="recommendations-list">
                        {recommendations.map((rec, index) => {
                            let iconColor = '#00D9FF';
                            let icon = '💡';
                            
                            if (rec.type === 'better_value') {
                                icon = '💰';
                                iconColor = '#FFD700';
                            } else if (rec.type === 'budget_allocation') {
                                icon = '📊';
                                iconColor = '#00D9FF';
                            } else if (rec.type === 'upgrade_priority') {
                                icon = '⬆️';
                                iconColor = rec.priority === 'high' ? '#FF6B6B' : '#FFA500';
                            } else if (rec.type === 'optimization') {
                                icon = '⚡';
                                iconColor = '#00FF88';
                            } else if (rec.type === 'quality') {
                                icon = '✨';
                                iconColor = '#00D9FF';
                            }

                            return (
                                <div key={index} className="recommendation-card">
                                    <div className="rec-header">
                                        <span className="rec-icon" style={{ color: iconColor }}>{icon}</span>
                                        <h5>{rec.component}</h5>
                                        {rec.priority && (
                                            <span className={`priority-badge priority-${rec.priority}`}>
                                                {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="rec-message">{rec.message}</p>
                                    <p className="rec-suggestion">
                                        <strong>Sugestão:</strong> {rec.suggestion}
                                    </p>
                                    
                                    {rec.alternatives && rec.alternatives.length > 0 && (
                                        <div className="alternatives">
                                            <strong>Alternativas:</strong>
                                            {rec.alternatives.map((alt, altIndex) => (
                                                <div key={altIndex} className="alternative-item">
                                                    <span className="alt-name">{alt.name}</span>
                                                    <span className="alt-price">R$ {alt.price?.toFixed(2)}</span>
                                                    {alt.savings > 0 && (
                                                        <span className="alt-savings">
                                                            Economia: R$ {alt.savings.toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {rec.potentialSavings && (
                                        <div className="potential-savings">
                                            💰 Economia potencial: R$ {rec.potentialSavings.toFixed(2)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Dicas de Otimização */}
            <div className="optimization-tips">
                <h4><FaExclamationCircle /> Dicas para Melhorar o Custo-Benefício</h4>
                <ul className="tips-list">
                    <li>
                        <strong>GPU:</strong> Para jogos, invista 40-50% do orçamento na placa de vídeo para melhor desempenho.
                    </li>
                    <li>
                        <strong>CPU:</strong> Escolha uma CPU que não seja gargalo para a GPU, mas evite gastar demais.
                    </li>
                    <li>
                        <strong>RAM:</strong> 16GB é o ideal para jogos modernos. 32GB só se for fazer edição de vídeo/streaming.
                    </li>
                    <li>
                        <strong>Armazenamento:</strong> Um SSD NVMe de 500GB+ faz enorme diferença na experiência de uso.
                    </li>
                    <li>
                        <strong>Fonte:</strong> Não economize na fonte! Uma fonte de qualidade protege todo o investimento.
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default CostBenefitAnalysis;
