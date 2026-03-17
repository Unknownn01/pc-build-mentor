import React, { useState, useEffect } from 'react';
import { 
    FaTimes, FaStar, FaMicrochip, FaBolt, FaPlug, 
    FaMemory, FaHdd, FaCheckCircle, FaTrophy, FaChartLine 
} from 'react-icons/fa';
import axios from 'axios';
import './ComponentDetailModal.css';
import PriceHistoryChart from './PriceHistoryChart'; // Verifique se o arquivo existe nesta pasta
import { API_BASE_URL } from '../config';

function ComponentDetailModal({ component, category, onClose }) {
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        if (component?.id) {
            setLoadingHistory(true);
            axios.get(`${API_BASE_URL}/api/pecas/${component.id}/historico`)
                .then(res => {
                    setHistory(res.data);
                    setLoadingHistory(false);
                })
                .catch(err => {
                    console.error("Erro ao carregar histórico:", err);
                    setLoadingHistory(false);
                });
        }
    }, [component]);

    if (!component) return null;

    // Pega o CB Score de dentro do specs (seu campo mágico)
    const cbScore = component.specs?.cb_score || 0;
    const powerScore = component.specs?.power_score || component.power_score || 0;

    const renderDetails = () => {
        const specs = component.specs || {};
        // Normalizamos a categoria para evitar erros de digitação
        const cat = category?.toLowerCase();

        return (
            <>
                <div className="detail-row">
                    <FaStar className="detail-icon" />
                    <span className="detail-label">Power Score:</span>
                    <span className="detail-value score-badge">{powerScore}/100</span>
                </div>

                {/* CB SCORE - SEMPRE VISÍVEL SE FOR MAIOR QUE 0 */}
                {cbScore > 0 && (
                    <div className={`detail-row cb-highlight ${cbScore >= 35 ? 'is-best' : ''}`}>
                        <FaTrophy className="detail-icon" />
                        <span className="detail-label">Custo-Benefício:</span>
                        <span className="detail-value">
                            {cbScore} pts {cbScore >= 35 && <span className="best-buy-tag">💎</span>}
                        </span>
                    </div>
                )}

                <hr className="detail-divider" />

                {/* Filtro por categoria corrigido */}
                {(cat === 'cpu' || cat === 'processador') && (
                    <>
                        <div className="detail-row"><FaMicrochip className="detail-icon" /><span className="detail-label">Núcleos:</span><span className="detail-value">{specs.nucleos} cores</span></div>
                        <div className="detail-row"><FaBolt className="detail-icon" /><span className="detail-label">Clock:</span><span className="detail-value">{specs.clock_base_ghz} GHz</span></div>
                    </>
                )}

                {(cat === 'placadevideo' || cat === 'placa_video') && (
                    <>
                        <div className="detail-row"><FaMemory className="detail-icon" /><span className="detail-label">VRAM:</span><span className="detail-value">{specs.vram_gb} GB</span></div>
                        <div className="detail-row"><FaPlug className="detail-icon" /><span className="detail-label">TDP:</span><span className="detail-value">{specs.tdp_w}W</span></div>
                    </>
                )}
                
                {/* Fallback para mostrar outras specs se não for CPU/GPU */}
                {!['cpu', 'processador', 'placadevideo', 'placa_video'].includes(cat) && (
                    <div className="detail-row">
                        <span className="detail-label">Marca:</span>
                        <span className="detail-value">{component.marca || 'N/A'}</span>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="component-detail-modal-overlay" onClick={onClose}>
            <div className="component-detail-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>

                <div className="modal-header">
                    <h2>{component.nome}</h2>
                    <span className="component-brand">{component.marca}</span>
                </div>

                <div className="modal-body-scrollable">
                    <div className="modal-image">
                        <img src={`${API_BASE_URL}/images/${component.imagem_url}`} alt={component.nome} />
                    </div>

                    <div className="modal-details">
                        {renderDetails()}
                        
                        <div className="chart-section">
                            <div className="chart-header">
                                <FaChartLine />
                                <h3>Histórico de Preços</h3>
                            </div>
                            {loadingHistory ? (
                                <div className="chart-loading">Buscando preços...</div>
                            ) : (
                                <div className="chart-wrapper">
                                    <PriceHistoryChart data={history} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <div className="price-section">
                        <span className="price-label">Preço Atual:</span>
                        <span className="price-value">R$ {component.preco?.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ComponentDetailModal;