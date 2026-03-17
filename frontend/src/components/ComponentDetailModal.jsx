import React, { useState, useEffect } from 'react';
import { 
    FaTimes, FaStar, FaMicrochip, FaBolt, FaPlug, 
    FaMemory, FaHdd, FaCheckCircle, FaTrophy, FaChartLine, FaBox
} from 'react-icons/fa';
import axios from 'axios';
import './ComponentDetailModal.css';
import PriceHistoryChart from './PriceHistoryChart';
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

    const specs = component.specs || {};
    const cbScore = specs.cb_score || 0;
    const powerScore = specs.power_score || component.power_score || 0;
    const cat = category?.toLowerCase();

    // Componente interno para renderizar cada linha de especificação
    const Detail = ({ icon: Icon, label, value, suffix = "" }) => {
        if (value === undefined || value === null || value === "N/A" || value === "") return null;
        return (
            <div className="detail-row">
                <Icon className="detail-icon" />
                <span className="detail-label">{label}:</span>
                <span className="detail-value">{value}{suffix}</span>
            </div>
        );
    };

    const renderDetails = () => {
        return (
            <>
                {/* --- SCORE E CUSTO-BENEFÍCIO --- */}
                <Detail icon={FaStar} label="Power Score" value={powerScore} suffix="/100" />
                
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

                {/* --- ESPECIFICAÇÕES POR CATEGORIA (SYNC COM PRISMA) --- */}

                {/* PROCESSADORES */}
                {(cat === 'cpu' || cat === 'processador') && (
                    <>
                        <Detail icon={FaMicrochip} label="Soquete" value={specs.soquete} />
                        <Detail icon={FaCheckCircle} label="Núcleos" value={specs.nucleos} />
                        <Detail icon={FaBolt} label="Clock Base" value={specs.clock_base_ghz} suffix=" GHz" />
                        <Detail icon={FaPlug} label="TDP" value={specs.tdp_w} suffix="W" />
                        <Detail icon={FaChartLine} label="Lançamento" value={specs.ano_lancamento} />
                    </>
                )}

                {/* PLACAS DE VÍDEO */}
                {(cat === 'placadevideo' || cat === 'placa_video') && (
                    <>
                        <Detail icon={FaMicrochip} label="Chipset" value={specs.nome_chip} />
                        <Detail icon={FaMemory} label="VRAM" value={specs.vram_gb} suffix=" GB" />
                        <Detail icon={FaBolt} label="Clock Boost" value={specs.clock_boost_mhz} suffix=" MHz" />
                        <Detail icon={FaPlug} label="TDP/Consumo" value={specs.tdp_w} suffix="W" />
                        <Detail icon={FaChartLine} label="Lançamento" value={specs.ano_lancamento} />
                    </>
                )}

                {/* PLACAS-MÃE */}
                {(cat === 'placamae' || cat === 'placa_mae') && (
                    <>
                        <Detail icon={FaMicrochip} label="Soquete CPU" value={specs.soquete_cpu} />
                        <Detail icon={FaBox} label="Formato" value={specs.formato} />
                        <Detail icon={FaMemory} label="Tipo RAM" value={specs.tipo_ram} />
                        <Detail icon={FaPlug} label="Slots RAM" value={specs.slots_ram} />
                        <Detail icon={FaHdd} label="Slots M.2" value={specs.slots_m2} />
                        <Detail icon={FaBolt} label="VRM" value={specs.dissipacao_vrm} />
                    </>
                )}

                {/* MEMÓRIA RAM */}
                {(cat === 'memoria_ram' || cat === 'memoria') && (
                    <>
                        <Detail icon={FaMemory} label="Capacidade" value={specs.capacidade_gb} suffix=" GB" />
                        <Detail icon={FaBolt} label="Frequência" value={specs.frequencia_mhz} suffix=" MHz" />
                        <Detail icon={FaCheckCircle} label="Padrão" value={specs.tipo} />
                        <Detail icon={FaPlug} label="Módulos" value={specs.modulos} />
                    </>
                )}

                {/* ARMAZENAMENTO */}
                {(cat === 'armazenamento') && (
                    <>
                        <Detail icon={FaHdd} label="Capacidade" value={specs.capacidade_gb} suffix=" GB" />
                        <Detail icon={FaCheckCircle} label="Tipo" value={specs.tipo} />
                    </>
                )}

                {/* FONTES */}
                {(cat === 'fonte_alimentacao' || cat === 'fonte') && (
                    <>
                        <Detail icon={FaBolt} label="Potência" value={specs.potencia_w} suffix="W" />
                        <Detail icon={FaCheckCircle} label="Certificação" value={specs.certificacao} />
                        <Detail icon={FaBox} label="Formato" value={specs.formato} />
                    </>
                )}

                {/* GABINETES */}
                {(cat === 'gabinete') && (
                    <>
                        <Detail icon={FaBox} label="Tamanho" value={specs.formato} />
                        <Detail icon={FaMicrochip} label="Placas Suportadas" value={specs.formatos_placa_mae_suportados} />
                        <Detail icon={FaChartLine} label="GPU Max" value={specs.max_gpu_length_mm} suffix=" mm" />
                        <Detail icon={FaBolt} label="Cooler Max" value={specs.max_cooler_height_mm} suffix=" mm" />
                    </>
                )}

                {/* COOLERS */}
                {(cat === 'refrigeracao' || cat === 'cooler') && (
                    <>
                        <Detail icon={FaBolt} label="Tipo" value={specs.tipo} />
                        <Detail icon={FaMicrochip} label="Soquetes" value={specs.soquetes_suportados} />
                        <Detail icon={FaBox} label="Radiador" value={specs.tamanho_radiador_mm} suffix=" mm" />
                        <Detail icon={FaChartLine} label="Altura" value={specs.altura_mm} suffix=" mm" />
                    </>
                )}

                <hr className="detail-divider" />
                <Detail icon={FaCheckCircle} label="Marca" value={component.marca || specs.marca} />
            </>
        );
    };

    return (
        <div className="component-detail-modal-overlay" onClick={onClose}>
            <div className="component-detail-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>

                <div className="modal-header">
                    <h2>{component.nome}</h2>
                    <span className="component-brand">{component.marca || specs.marca}</span>
                </div>

                <div className="modal-body-scrollable">
                    <div className="modal-image">
                        <img 
                            src={`${API_BASE_URL}/images/${component.imagem_url}`} 
                            alt={component.nome}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Sem+Imagem'; }}
                        />
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
                        <span className="price-value">R$ {component.preco?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ComponentDetailModal;