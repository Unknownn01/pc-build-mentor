// ARQUIVO: frontend/src/components/SmartRecommendations.jsx
import React from 'react';
import { FaLightbulb, FaCheckCircle, FaExclamationTriangle, FaArrowUp, FaRocket } from 'react-icons/fa';
import './SmartRecommendations.css';

const SmartRecommendations = ({ recommendations }) => {
    if (!recommendations) {
        return null;
    }

    const { whatYouDidRight, whatCanBeImproved, upgradePriorities, futureUpgrades } = recommendations;

    return (
        <div className="smart-recommendations">
            <h3 className="recommendations-title">
                <FaLightbulb /> Recomendações Inteligentes
            </h3>

            {/* O que você fez certo */}
            {whatYouDidRight && whatYouDidRight.length > 0 && (
                <div className="recommendations-section success-section">
                    <h4>
                        <FaCheckCircle /> O que Você Fez Certo
                    </h4>
                    <div className="recommendations-grid">
                        {whatYouDidRight.map((item, index) => (
                            <div key={index} className="recommendation-card success-card">
                                <div className="card-icon">{item.icon}</div>
                                <h5>{item.title}</h5>
                                <p>{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* O que pode ser melhorado */}
            {whatCanBeImproved && whatCanBeImproved.length > 0 && (
                <div className="recommendations-section improvement-section">
                    <h4>
                        <FaExclamationTriangle /> O que Pode Ser Melhorado
                    </h4>
                    <div className="improvements-list">
                        {whatCanBeImproved.map((item, index) => {
                            const priorityClass = item.priority === 'critical' ? 'priority-critical' :
                                                 item.priority === 'high' ? 'priority-high' :
                                                 item.priority === 'medium' ? 'priority-medium' : 'priority-low';
                            
                            return (
                                <div key={index} className={`improvement-card ${priorityClass}`}>
                                    <div className="improvement-header">
                                        <div className="header-left">
                                            <span className="improvement-icon">{item.icon}</span>
                                            <h5>{item.title}</h5>
                                        </div>
                                        {item.priority && (
                                            <span className={`priority-badge ${priorityClass}`}>
                                                {item.priority === 'critical' ? 'CRÍTICO' :
                                                 item.priority === 'high' ? 'ALTO' :
                                                 item.priority === 'medium' ? 'MÉDIO' : 'BAIXO'}
                                            </span>
                                        )}
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

            {/* Prioridades de Upgrade */}
            {upgradePriorities && upgradePriorities.length > 0 && (
                <div className="recommendations-section upgrade-section">
                    <h4>
                        <FaArrowUp /> Prioridades de Upgrade
                    </h4>
                    <div className="upgrade-priorities">
                        {upgradePriorities.map((upgrade, index) => (
                            <div key={index} className="upgrade-card">
                                <div className="upgrade-priority-badge">
                                    Prioridade {upgrade.priority}
                                </div>
                                <div className="upgrade-content">
                                    <h5>{upgrade.component}</h5>
                                    <p className="upgrade-reason">{upgrade.reason}</p>
                                    <div className="upgrade-details">
                                        <div className="upgrade-impact">
                                            <span className="detail-label">Impacto:</span>
                                            <span className="detail-value impact-value">{upgrade.impact}</span>
                                        </div>
                                        <div className="upgrade-suggestion-text">
                                            <span className="detail-label">Sugestão:</span>
                                            <span className="detail-value">{upgrade.suggestion}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upgrades Futuros */}
            {futureUpgrades && futureUpgrades.length > 0 && (
                <div className="recommendations-section future-section">
                    <h4>
                        <FaRocket /> Planejamento de Upgrades Futuros
                    </h4>
                    <div className="future-upgrades">
                        {futureUpgrades.map((future, index) => (
                            <div key={index} className="future-card">
                                <div className="future-icon">{future.icon}</div>
                                <div className="future-content">
                                    <h5>{future.title}</h5>
                                    <p className="future-description">{future.description}</p>
                                    {future.options && future.options.length > 0 && (
                                        <ul className="future-options">
                                            {future.options.map((option, optIndex) => (
                                                <li key={optIndex}>{option}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Resumo Final */}
            <div className="final-summary">
                <h4>📝 Resumo</h4>
                <div className="summary-stats">
                    <div className="summary-stat success">
                        <span className="stat-number">{whatYouDidRight?.length || 0}</span>
                        <span className="stat-label">Acertos</span>
                    </div>
                    <div className="summary-stat warning">
                        <span className="stat-number">{whatCanBeImproved?.length || 0}</span>
                        <span className="stat-label">Melhorias</span>
                    </div>
                    <div className="summary-stat info">
                        <span className="stat-number">{upgradePriorities?.length || 0}</span>
                        <span className="stat-label">Upgrades</span>
                    </div>
                </div>
                <p className="summary-message">
                    {whatYouDidRight && whatYouDidRight.length > whatCanBeImproved?.length ? (
                        <>✨ Excelente trabalho! Sua build está bem equilibrada. Continue assim!</>
                    ) : whatCanBeImproved && whatCanBeImproved.length > 0 ? (
                        <>💡 Há algumas oportunidades de melhoria. Revise as sugestões acima para otimizar sua build.</>
                    ) : (
                        <>🎯 Adicione mais componentes para receber recomendações personalizadas.</>
                    )}
                </p>
            </div>
        </div>
    );
};

export default SmartRecommendations;
