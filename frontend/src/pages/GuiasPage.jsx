// ARQUIVO: frontend/src/pages/GuiasPage.jsx
// (ATUALIZADO COM FILTROS DE PREÇO)

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWrench } from 'react-icons/fa';
import BuildDetailModal from '../components/BuildDetailModal.jsx';
import './GuiasPage.css';
import { API_BASE_URL } from '../config'; // Ajuste o caminho se necessário

function GuiasPage({ buildsProntas, currentUser, isLoading, setBuild }) {
    const [filtroUso, setFiltroUso] = useState('Todos');
    const [filtroPreco, setFiltroPreco] = useState('Todos');
    const [viewingBuild, setViewingBuild] = useState(null);
    const navigate = useNavigate();

    const usosPrincipais = useMemo(() => {
        if (!buildsProntas || buildsProntas.length === 0) return ['Todos'];
        const usos = buildsProntas.map(b => b.uso_principal).filter(Boolean);
        return ['Todos', ...new Set(usos)];
    }, [buildsProntas]);

    // Definir faixas de preço
    const faixasPreco = useMemo(() => [
        { label: 'Todos', min: 0, max: Infinity },
        { label: 'Até R$ 3.000', min: 0, max: 3000 },
        { label: 'R$ 3.000 - R$ 4.000', min: 3000, max: 4000 },
        { label: 'R$ 4.000 - R$ 5.000', min: 4000, max: 5000 },
        { label: 'R$ 5.000 - R$ 6.000', min: 5000, max: 6000 },
        { label: 'R$ 6.000 - R$ 8.000', min: 6000, max: 8000 },
        { label: 'R$ 8.000 - R$ 10.000', min: 8000, max: 10000 },
        { label: 'R$ 10.000 - R$ 15.000', min: 10000, max: 15000 },
        { label: 'Acima de R$ 15.000', min: 15000, max: Infinity }
    ], []);

    const buildsFiltradas = useMemo(() => {
        if (!buildsProntas) return [];
        
        let resultado = [...buildsProntas];

        // Filtrar por uso
        if (filtroUso !== 'Todos') {
            resultado = resultado.filter(b => b.uso_principal === filtroUso);
        }

        // Filtrar por preço
        if (filtroPreco !== 'Todos') {
            const faixa = faixasPreco.find(f => f.label === filtroPreco);
            if (faixa) {
                resultado = resultado.filter(b => {
                    const preco = parseFloat(b.preco_simulado);
                    return preco >= faixa.min && preco < faixa.max;
                });
            }
        }

        return resultado;
    }, [buildsProntas, filtroUso, filtroPreco,faixasPreco]);

    const handleChooseBuild = (build) => {
        const buildData = typeof build.buildData === 'string' ? JSON.parse(build.buildData) : build.buildData;
        setBuild(buildData);
        navigate('/montador');
    };

    if (isLoading) return <div className="loading-screen">Carregando guias...</div>;

    return (
        <div className="guias-container">
            <div className="guias-header">
                <h1>PCs Pré-montados</h1>
                <p>Builds de PC selecionadas por especialistas para cada orçamento e necessidade.</p>
            </div>

            <div className="filtros-container-guias">
                {/* Filtro de Propósito */}
                <div className="filtro-secao">
                    <h3>Propósito</h3>
                    <div className="filtros-uso">
                        {usosPrincipais.map(uso => (
                            <button 
                                key={uso} 
                                className={`filtro-btn ${filtroUso === uso ? 'active' : ''}`} 
                                onClick={() => setFiltroUso(uso)}
                            >
                                {uso}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filtro de Preço */}
                <div className="filtro-secao">
                    <h3>Faixa de Preço</h3>
                    <div className="filtros-preco">
                        {faixasPreco.map(faixa => (
                            <button 
                                key={faixa.label} 
                                className={`filtro-btn ${filtroPreco === faixa.label ? 'active' : ''}`} 
                                onClick={() => setFiltroPreco(faixa.label)}
                            >
                                {faixa.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="resultados-info">
                <p>Mostrando {buildsFiltradas.length} build(s)</p>
            </div>

            <div className="builds-grid">
                {buildsFiltradas.map(build => (
                    <div key={build.id} className="build-card">
                        <img 
  // A correção está aqui: construímos a URL completa
                            src={`${API_BASE_URL}/build-images/${build.imagem_url}`}
                            alt={build.nome} 
                            className="build-imagem" 
                            onClick={() => setViewingBuild(build)} 
                            />
                        <div className="build-info">
                            <h3 onClick={() => setViewingBuild(build)}>{build.nome}</h3>
                            <div className="build-specs">
                                <p><strong>CPU:</strong> {build.buildData?.cpu?.nome || 'N/A'}</p>
                                <p>
                                    <strong>GPU:</strong> 
                                    {/* Verifica se a placa de vídeo existe */}
                                    {build.buildData.placaDeVideo 
                                        // Se existir, monta o nome completo
                                        ? `${build.buildData.placaDeVideo.marca} ${build.buildData.placaDeVideo.modelo_especifico} ${build.buildData.placaDeVideo.nome_chip}` 
                                        // Se não existir, mostra 'N/A'
                                        : 'N/A'
                                    }
                                </p>
                            </div>
                            <p className="build-preco">R$ {parseFloat(build.preco_simulado).toFixed(2)}</p>
                        </div>
                        <div className="build-actions-single">
                            <button className="btn-action-full" onClick={() => handleChooseBuild(build)}>
                                <FaWrench /> Levar para o Montador
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {buildsFiltradas.length === 0 && (
                <div className="sem-resultados">
                    <p>Nenhuma build encontrada com os filtros selecionados.</p>
                </div>
            )}

            {viewingBuild && <BuildDetailModal build={viewingBuild} onClose={() => setViewingBuild(null)} currentUser={currentUser} />}
        </div>
    );
}

export default GuiasPage;