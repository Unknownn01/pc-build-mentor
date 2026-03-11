// ARQUIVO: frontend/src/components/ComponentDetailModal.jsx
// Modal para exibir detalhes completos de um componente

import React from 'react';
import { 
    FaTimes, FaStar, FaMicrochip, FaBolt, FaPlug, 
    FaMemory, FaHdd, FaCheckCircle, FaThermometerHalf, FaList 
} from 'react-icons/fa';
import './ComponentDetailModal.css';
import { API_BASE_URL } from '../config'; // Ajuste o caminho se necessário

function ComponentDetailModal({ component, category, onClose}) {
    if (!component) return null;

    const renderDetails = () => {
        switch (category) {
            case 'cpu':
            case 'processador': // Garantindo compatibilidade com nome do banco
                return (
                    <>
                        <div className="detail-row">
                            <FaStar className="detail-icon" />
                            <span className="detail-label">Power Score:</span>
                            <span className="detail-value score-badge">
                                {component.specs?.power_score}/100
                            </span>
                        </div>
                        <div className="detail-row">
                            <FaMicrochip className="detail-icon" />
                            <span className="detail-label">Núcleos:</span>
                            <span className="detail-value">
                                {component.specs?.nucleos} cores
                            </span>
                        </div>
                        <div className="detail-row">
                            <FaBolt className="detail-icon" />
                            <span className="detail-label">Clock Base:</span>
                            <span className="detail-value">
                                {component.specs?.clock_base_ghz} GHz
                            </span>
                        </div>
                        <div className="detail-row">
                            <FaPlug className="detail-icon" />
                            <span className="detail-label">TDP:</span>
                            <span className="detail-value">
                                {component.specs?.tdp_w}W
                            </span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Soquete:</span>
                            <span className="detail-value">{component.specs?.soquete}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Ano de Lançamento:</span>
                            <span className="detail-value">{component.specs?.ano_lancamento}</span>
                        </div>
                    </>
                );
            
            case 'placaDeVideo':
                return (
                    <>
                        <div className="detail-row">
                            <FaStar className="detail-icon" />
                            <span className="detail-label">Power Score:</span>
                            <span className="detail-value score-badge">{component.specs?.power_score}/100</span>
                        </div>
                        <div className="detail-row">
                            <FaMemory className="detail-icon" />
                            <span className="detail-label">VRAM:</span>
                            <span className="detail-value">{component.specs?.vram_gb}GB</span>
                        </div>
                        <div className="detail-row">
                            <FaBolt className="detail-icon" />
                            <span className="detail-label">Clock Boost:</span>
                            <span className="detail-value">{component.specs?.clock_boost_mhz} MHz</span>
                        </div>
                        <div className="detail-row">
                            <FaPlug className="detail-icon" />
                            <span className="detail-label">TDP:</span>
                            <span className="detail-value">{component.specs?.tdp_w}W</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Ano de Lançamento:</span>
                            <span className="detail-value">{component.specs?.ano_lancamento}</span>
                        </div>
                    </>
                );
            
            case 'memoria':
            case 'memoria_ram':
                return (
                    <>
                        <div className="detail-row">
                            <FaMemory className="detail-icon" />
                            <span className="detail-label">Capacidade:</span>
                            <span className="detail-value">{component.specs?.capacidade_gb} GB</span>
                        </div>
                        <div className="detail-row">
                            <FaBolt className="detail-icon" />
                            <span className="detail-label">Frequência:</span>
                            <span className="detail-value">{component.specs?.frequencia_mhz} MHz</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Tipo:</span>
                            <span className="detail-value">{component.specs?.tipo}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Latência (CAS):</span>
                            <span className="detail-value">CL {component.specs?.cas_latency || component.specs?.latencia}</span>
                        </div>
                    </>
                );
            
            case 'armazenamento':
            return (
                <>
                    <div className="detail-row">
                        <FaHdd className="detail-icon" />
                        <span className="detail-label">Capacidade:</span>
                        <span className="detail-value">
                            {component.specs?.capacidade_gb || component.specs?.capacidade || "N/A"} GB
                        </span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Tipo:</span>
                        <span className="detail-value">{component.specs?.tipo || "SSD"}</span>
                    </div>
                    
                    {/* Renderização Condicional: Só mostra se tiver dados */}
                    {(component.specs?.velocidade_leitura_mbps || component.specs?.leitura) && (
                        <div className="detail-row">
                            <FaBolt className="detail-icon" />
                            <span className="detail-label">Leitura:</span>
                            <span className="detail-value">
                                {component.specs?.velocidade_leitura_mbps || component.specs?.leitura} MB/s
                            </span>
                        </div>
                    )}

                    {(component.specs?.velocidade_gravacao_mbps || component.specs?.gravacao) && (
                        <div className="detail-row">
                            <span className="detail-label">Gravação:</span>
                            <span className="detail-value">
                                {component.specs?.velocidade_gravacao_mbps || component.specs?.gravacao} MB/s
                            </span>
                        </div>
                    )}
                </>
            );
            
            case 'placaMae':
            case 'placa_mae':
                return (
                    <>
                        <div className="detail-row">
                            <FaMicrochip className="detail-icon" />
                            <span className="detail-label">Plataforma:</span>
                            <span className="detail-value">
                                {/* Ex: AMD ou Intel */}
                                {component.specs?.plataforma || "Universal"} - {component.specs?.soquete_cpu || component.specs?.soquete}
                            </span>
                        </div>

                        {/* Chipset (Se tiver) */}
                        {(component.specs?.chipset || component.specs?.Chipset) && (
                            <div className="detail-row">
                                <FaMicrochip className="detail-icon" />
                                <span className="detail-label">Chipset:</span>
                                <span className="detail-value">{component.specs?.chipset || component.specs?.Chipset}</span>
                            </div>
                        )}

                        <div className="detail-row">
                            <FaMemory className="detail-icon" />
                            <span className="detail-label">RAM:</span>
                            <span className="detail-value">
                                {component.specs?.tipo_ram || "DDR4"} ({component.specs?.slots_ram || 4} slots)
                            </span>
                        </div>

                        {/* Informações Extras do Raio-X */}
                        <div className="detail-row">
                            <FaHdd className="detail-icon" />
                            <span className="detail-label">Armazenamento:</span>
                            <span className="detail-value">
                                {component.specs?.slots_m2 || 1}x M.2
                            </span>
                        </div>
                        
                        <div className="detail-row">
                            <FaList className="detail-icon" />
                            <span className="detail-label">Expansão:</span>
                            <span className="detail-value">
                                {component.specs?.slots_pcie || 1}x PCIe
                            </span>
                        </div>

                        {(component.specs?.dissipacao_vrm) && (
                            <div className="detail-row">
                                <FaThermometerHalf className="detail-icon" />
                                <span className="detail-label">VRM:</span>
                                <span className="detail-value">{component.specs?.dissipacao_vrm}</span>
                            </div>
                        )}

                        <div className="detail-row">
                            <span className="detail-label">Formato:</span>
                            <span className="detail-value">
                                {component.specs?.formato || component.specs?.fator_forma || "ATX"}
                            </span>
                        </div>
                    </>
                );
            
            case 'fonte':
            case 'fonte_alimentacao':
                return (
                    <>
                        <div className="detail-row">
                            <FaBolt className="detail-icon" />
                            <span className="detail-label">Potência:</span>
                            <span className="detail-value">
                                {component.specs?.potencia_w || component.specs?.potencia || "N/A"}W
                            </span>
                        </div>
                        <div className="detail-row">
                            <FaCheckCircle className="detail-icon" /> {/* Agora vai funcionar! */}
                            <span className="detail-label">Certificação:</span>
                            <span className="detail-value">
                                {component.specs?.certificacao || component.specs?.selo_80plus || "Padrão"}
                            </span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Modular:</span>
                            <span className="detail-value">
                                {component.specs?.modularidade || component.specs?.modular || "Não"}
                            </span>
                        </div>
                    </>
                );
            
            case 'gabinete':
            return (
                <>
                    <div className="detail-row">
                        <span className="detail-label">Formato:</span>
                        <span className="detail-value">
                            {/* Tenta specs.formato, specs.tipo, ou na raiz */}
                            {component.specs?.formato || component.specs?.tipo || component.formato || "Mid Tower"}
                        </span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Cor:</span>
                        <span className="detail-value">
                            {/* Tenta todas as variações de Cor */}
                            {component.specs?.cor || component.specs?.Cor || component.specs?.color || component.cor || "Preto"}
                        </span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Lateral:</span>
                        <span className="detail-value">
                            {/* Tenta lateral, material_lateral, painel... */}
                            {component.specs?.material_lateral || component.specs?.painel_lateral || component.specs?.lateral || component.specs?.Lateral || component.lateral || "Vidro/Acrílico"}
                        </span>
                    </div>
                </>
            );
            
            case 'cooler':
            case 'refrigeracao':
                return (
                    <>
                        <div className="detail-row">
                            <FaFan className="detail-icon" />
                            <span className="detail-label">Tipo:</span>
                            <span className="detail-value">{component.specs?.tipo}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Soquetes Suportados:</span>
                            <span className="detail-value">{component.specs?.soquetes_suportados}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Altura:</span>
                            <span className="detail-value">{component.specs?.altura_mm}mm</span>
                        </div>
                        {component.tamanho_radiador_mm && (
                            <div className="detail-row">
                                <span className="detail-label">Tamanho Radiador:</span>
                                <span className="detail-value">{component.specs?.tamanho_radiador_mm}mm</span>
                            </div>
                        )}
                    </>
                );
            
            default:
                return null;
        }
    };


    return (
        <div className="component-detail-modal-overlay" onClick={onClose}>
            <div className="component-detail-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="modal-header">
                    {/* Título Inteligente */}
                    <h2>
                        {/* Antes: component.modelo_especifico */}
                        {component.specs?.modelo_especifico
                            ? `${component.marca} ${component.specs.modelo_especifico} ${component.specs?.nome_chip || ''}`
                            : component.nome
                        }
                    </h2>
                    
                    {/* Badge de Chipset */}
                    <span className="component-brand">
                        {/* Antes: component.chipset */}
                        {component.specs?.chipset
                            ? component.specs.chipset
                            : component.marca
                        }
                    </span>
                </div>
                <div className="modal-image">
                    {/* Lógica "inteligente" para a Imagem */}
                    <img 
                        src={`${API_BASE_URL}/images/${component.imagem_url}`}
                        alt={component.nome}
                        className="component-image"
                        
                    />
                </div>

                <div className="modal-details">
                    {renderDetails()}
                </div>

                <div className="modal-footer">
                    <div className="price-section">
                        <span className="price-label">Preço:</span>
                        <span className="price-value">R$ {component.preco?.toFixed(2)}</span>
                    </div>
                </div>

            </div>
            {/* --- INÍCIO DO DEBUG --- */}
                <div style={{ 
                    backgroundColor: '#000', 
                    color: '#0f0', 
                    padding: '15px', 
                    marginTop: '20px', 
                    borderRadius: '8px',
                    fontSize: '12px',
                    border: '1px solid #0f0'
                }}>
                    <h4 style={{margin: '0 0 10px 0'}}>🕵️‍♂️ RAIO-X DO BANCO DE DADOS:</h4>
                    <pre>{JSON.stringify(component.specs, null, 2)}</pre>
                </div>
                {/* --- FIM DO DEBUG --- */}

                {/* Cole isso ANTES de fechar a última </div> do modal */}
        </div>
    );
    
}

export default ComponentDetailModal;