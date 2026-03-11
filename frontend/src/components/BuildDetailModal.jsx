// ARQUIVO: frontend/src/components/BuildDetailModal.jsx
// (COM A ORDEM DOS HOOKS CORRIGIDA)

import React, { useMemo } from 'react';
import { FaTimes, FaSave, FaCheckCircle, FaBalanceScale, FaExclamationTriangle } from 'react-icons/fa';
import './BuildDetailModal.css';

const CATEGORIA_NAMES = {
    cpu: 'CPU',
    cooler: 'Cooler',
    placaMae: 'Placa-mãe',
    memoria: 'Memória',
    armazenamento: 'Armazenamento',
    placaDeVideo: 'Placa de Vídeo',
    gabinete: 'Gabinete',
    fonte: 'Fonte de Alimentação',
};

function BuildDetailModal({ build, onClose, onSave, currentUser }) {
    // A LÓGICA AGORA É EXECUTADA PRIMEIRO, ANTES DE QUALQUER 'return'
    const buildData = useMemo(() => {
        if (!build?.buildData) return {};
        return typeof build.buildData === 'string' ? JSON.parse(build.buildData) : build.buildData;
    }, [build]);

    const precoTotal = useMemo(() => {
        if (!build) return 0;
        const data = typeof build.buildData === 'string' ? JSON.parse(build.buildData) : build.buildData;
        return Object.values(data).reduce((total, peca) => total + (peca ? parseFloat(peca.preco) : 0), 0);
    }, [build]);

    const bottleneckAnalysis = useMemo(() => {
        const { cpu, placaDeVideo } = buildData;
        
        // Agora buscamos dentro de .specs
        const cpuScore = cpu?.specs?.power_score ? parseInt(cpu.specs.power_score) : null;
        const gpuScore = placaDeVideo?.specs?.power_score ? parseInt(placaDeVideo.specs.power_score) : null;
    
        if (!cpuScore || !gpuScore) {
            return { message: "Faltam peças-chave (CPU/GPU com pontuação) para a análise.", severity: 'info' };
        }
        
        const ratio = cpuScore / gpuScore;
       
        if (ratio > 1.15 && ratio <= 1.5) return { message: "Combinação ideal para jogos! Sua Placa de Vídeo será o foco, garantindo o máximo de qualidade gráfica.", severity: 'good' };
        if (ratio < 0.85) return { message: "Gargalo de CPU: Sua CPU pode limitar o potencial da Placa de Vídeo.", severity: 'warning' };
        if (ratio > 1.5) return { message: "CPU Subutilizada: Sua CPU é muito mais potente que a GPU. Considere uma placa de vídeo mais forte.", severity: 'warning' };
        return { message: "Combinação Equilibrada: CPU e GPU trabalham bem em conjunto.", severity: 'good' };
    }, [buildData]);

    // O RETORNO CONDICIONAL AGORA VEM DEPOIS DE TODOS OS HOOKS
    if (!build) return null;

    return (
        <div className="modal-backdrop-shared" onClick={onClose}>
            <div className="modal-content-shared" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn-shared" onClick={onClose}><FaTimes /></button>
                <h2>{build.nome || build.buildName}</h2>
                
                <div className="modal-details-list-shared">
                    {Object.entries(buildData).map(([key, value]) => (
  // Garante que o valor existe antes de tentar renderizar
                        value && (
                            <div key={key} className="modal-detail-item-shared">
                            <strong>{CATEGORIA_NAMES[key] || key}:</strong>
                            
                            {/* Lógica inteligente para exibir o nome correto */}
                            <span>
                            {key === 'placaDeVideo'
                                ? (value.modelo_especifico && value.nome_chip 
                                    ? `${value.marca} ${value.modelo_especifico} ${value.nome_chip}` 
                                    : value.nome) // Se não tiver os campos extras, usa o .nome normal
                                : value.nome
                            }
                            </span>
                            </div>
                        )
                        ))}
                </div>

                <div className={`bottleneck-section-modal ${bottleneckAnalysis.severity}`}>
                    <div className="bottleneck-message-modal">
                        {bottleneckAnalysis.severity === 'good' && <FaCheckCircle />}
                        {bottleneckAnalysis.severity === 'info' && <FaBalanceScale />}
                        {bottleneckAnalysis.severity === 'warning' && <FaExclamationTriangle />}
                        <p>{bottleneckAnalysis.message}</p>
                    </div>
                </div>

                <p className="modal-total-price-shared">Preço Total: R$ {parseFloat(precoTotal).toFixed(2)}</p>
                
                {currentUser && onSave &&
                  <button className="btn-salvar-modal" onClick={() => onSave(build)}>
                      <FaSave /> Salvar esta Build
                  </button>
                }
            </div>
        </div>
    );
}

export default BuildDetailModal;