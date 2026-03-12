// ARQUIVO: frontend/src/components/SmartRecommendations.jsx
import React from 'react';
import { FaLightbulb, FaCheckCircle, FaExclamationTriangle, FaArrowUp, FaRocket } from 'react-icons/fa';
import './SmartRecommendations.css';

const SmartRecommendations = ({ recommendations }) => {
    // Blindagem: Se não houver dados, o componente não renderiza nada
    if (!recommendations) {
        return null;
    }

    const { 
        whatYouDidRight = [], 
        whatCanBeImproved = [], 
        upgradePriorities = [], 
        futureUpgrades = [] 
    } = recommendations;

    return (
        <div className="smart-recommendations">
            <h3 className="recommendations-title">
                <FaLightbulb /> Recomendações Inteligentes
            </h3>

            {/* Seção de Acertos - Reforça a confiança do usuário */}
            {whatYouDidRight.length > 0 && (
                <div className="recommendations-section success-section">
                    <h4><FaCheckCircle /> O que Você Fez Certo</h4>
                    <div className="recommendations-grid">
                        {whatYouDidRight.map((item, index) => (
                            <div key={index} className="recommendation-card success-card">
                                <div className="card-icon">{item.icon || '✅'}</div>
                                <h5>{item.title}</h5>
                                <p>{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Seção de Melhorias - Onde o "Mentor" atua */}
            {whatCanBeImproved.length > 0 && (
                <div className="recommendations-section improvement-section">
                    <h4><FaExclamationTriangle /> O que Pode Ser Melhorado</h4>
                    <div className="improvements-list">
                        {whatCanBeImproved.map((item, index) => {
                            const priority = item.priority?.toLowerCase() || 'low';
                            const priorityClass = `priority-${priority}`;
                            
                            return (
                                <div key={index} className={`improvement-card ${priorityClass}`}>
                                    <div className="improvement-header">
                                        <div className="header-left">
                                            <span className="improvement-icon">{item.icon || '💡'}</span>
                                            <h5>{item.title}</h5>
                                        </div>
                                        <span className={`priority-badge ${priorityClass}`}>
                                            {priority === 'critical' ? 'CRÍTICO' :
                                             priority === 'high' ? 'ALTO' :
                                             priority === 'medium' ? 'MÉDIO' : 'BAIXO'}
                                        </span>
                                    </div>
                                    <p className="improvement-description">{item.description}</p>
                                    {item.impact && (
                                        <p className="improvement-impact">
                                            <strong>Impacto:</strong> {item.impact}
                                        </p>
                                    )}
                                    {item.suggestion && (
                                        <div className="improvement-suggestion">
                                            <strong>💡 Sugestão:</strong> {item.suggestion}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Prioridades de Upgrade - Foco em Gargalos */}
            {upgradePriorities.length > 0 && (
                <div className="recommendations-section upgrade-section">
                    <h4><FaArrowUp /> Prioridades de Upgrade</h4>
                    <div className="upgrade-priorities">
                        {upgradePriorities.map((upgrade, index) => (
                            <div key={index} className="upgrade-card">
                                <div className="upgrade-priority-badge">
                                    P{upgrade.priority || index + 1}
                                </div>
                                <div className="upgrade-content">
                                    <h5>{upgrade.component}</h5>
                                    <p className="upgrade-reason">{upgrade.reason}</p>
                                    <div className="upgrade-details">
                                        <span className="detail-label">Sugestão:</span>
                                        <span className="detail-value">{upgrade.suggestion}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Resumo Final Dinâmico */}
            <div className="final-summary">
                <h4>📝 Resumo da Mentoria</h4>
                <div className="summary-stats">
                    <div className="summary-stat success">
                        <span className="stat-number">{whatYouDidRight.length}</span>
                        <span className="stat-label">Acertos</span>
                    </div>
                    <div className="summary-stat warning">
                        <span className="stat-number">{whatCanBeImproved.length}</span>
                        <span className="stat-label">Melhorias</span>
                    </div>
                </div>
                <p className="summary-message">
                    {whatYouDidRight.length >= whatCanBeImproved.length ? 
                        "✨ Ótima build! Os acertos superam as ressalvas. Você está no caminho certo!" : 
                        "💡 Sua build tem potencial, mas considere as melhorias sugeridas para evitar gargalos."}
                </p>
            </div>
        </div>
    );
};

export default SmartRecommendations;