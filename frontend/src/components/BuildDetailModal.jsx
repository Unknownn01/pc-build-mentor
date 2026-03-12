// ARQUIVO: frontend/src/components/BuildDetailModal.jsx
import React, { useMemo } from 'react';
import { FaTimes, FaSave, FaCheckCircle, FaBalanceScale, FaExclamationTriangle, FaWrench } from 'react-icons/fa';
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

function BuildDetailModal({ build, onClose, onSave, onChoose, currentUser }) {
    
    // 1. Lógica para extrair as peças (Blindagem contra String/Objeto e pecas/buildData)
    const buildData = useMemo(() => {
        if (!build) return {};
        // Tenta pegar de 'pecas' (Postgres) ou 'buildData' (Antigo)
        const rawData = build.pecas || build.buildData;
        
        if (typeof rawData === 'string') {
            try {
                return JSON.parse(rawData);
            } catch (e) {
                console.error("Erro no parse do JSON:", e);
                return {};
            }
        }
        return rawData || {};
    }, [build]);

    // 2. Cálculo do Preço Total (usando o valor do banco ou calculando na hora)
    const precoTotalExibicao = useMemo(() => {
        if (!build) return 0;
        // Se o banco já trouxe o precoTotal pronto (Postgres), usa ele
        if (build.precoTotal) return parseFloat(build.precoTotal);
        
        // Caso contrário, calcula somando as peças
        return Object.values(buildData).reduce((total, peca) => {
            return total + (peca ? parseFloat(peca.preco || 0) : 0);
        }, 0);
    }, [build, buildData]);

    // 3. Análise de Gargalo (Ajustada para a nova estrutura de specs)
    const bottleneckAnalysis = useMemo(() => {
        const { cpu, placaDeVideo } = buildData;
        
        // Busca o score dentro do objeto specs
        const cpuScore = cpu?.specs?.power_score || cpu?.power_score;
        const gpuScore = placaDeVideo?.specs?.power_score || placaDeVideo?.power_score;
    
        if (!cpuScore || !gpuScore) {
            return { message: "Faltam peças-chave (CPU/GPU) para a análise de gargalo.", severity: 'info' };
        }
        
        const ratio = parseInt(cpuScore) / parseInt(gpuScore);
       
        if (ratio > 1.15 && ratio <= 1.5) return { message: "Combinação ideal para jogos! A GPU entregará seu máximo desempenho.", severity: 'good' };
        if (ratio < 0.85) return { message: "Gargalo de CPU detectado: A placa de vídeo pode ser limitada pelo processador.", severity: 'warning' };
        if (ratio > 1.5) return { message: "CPU muito acima da GPU: Você tem margem para uma placa de vídeo muito mais forte.", severity: 'warning' };
        return { message: "Sistema Equilibrado: CPU e GPU estão em harmonia.", severity: 'good' };
    }, [buildData]);

    if (!build) return null;

    return (
        <div className="modal-backdrop-shared" onClick={onClose}>
            <div className="modal-content-shared" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn-shared" onClick={onClose}><FaTimes /></button>
                
                <h2>{build.nome || build.buildName || "Build Detalhada"}</h2>
                
                <div className="modal-details-list-shared">
                    {Object.entries(buildData).map(([key, value]) => (
                        value && (
                            <div key={key} className="modal-detail-item-shared">
                                <strong>{CATEGORIA_NAMES[key] || key}:</strong>
                                <span>
                                    {key === 'placaDeVideo'
                                        ? (value.modelo_especifico && value.nome_chip 
                                            ? `${value.marca} ${value.modelo_especifico} ${value.nome_chip}` 
                                            : value.nome)
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

                <p className="modal-total-price-shared">
                    Preço Total: R$ {precoTotalExibicao.toFixed(2)}
                </p>
                
                <div className="modal-actions-footer">
                    {currentUser && onSave && (
                        <button className="btn-salvar-modal" onClick={() => onSave(build)}>
                            <FaSave /> Salvar na minha conta
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BuildDetailModal;