import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWrench, FaStar } from 'react-icons/fa';
import BuildDetailModal from '../components/BuildDetailModal.jsx';
import './GuiasPage.css';
import { API_BASE_URL } from '../config';

function GuiasPage({ buildsProntas, currentUser, isLoading, setBuild, todasPecas }) {
    const [filtroUso, setFiltroUso] = useState('Todos');
    const [filtroPreco, setFiltroPreco] = useState('Todos');
    const [viewingBuild, setViewingBuild] = useState(null);
    const navigate = useNavigate();

    const mapaUso = {
        'Jogos': 'Gamer',
        'Edicao': 'Edição',
        'Trabalho': 'Home Office',
        'Modelagem': 'Edição',
        'IA': 'Gamer'
    };

    const faixasPreco = useMemo(() => [
        { label: 'Todos', min: 0, max: Infinity },
        { label: 'Até R$ 3.000', min: 0, max: 3000 },
        { label: 'R$ 3.000 - R$ 5.000', min: 3000, max: 5000 },
        { label: 'R$ 5.000 - R$ 8.000', min: 5000, max: 8000 },
        { label: 'R$ 8.000 - R$ 12.000', min: 8000, max: 12000 },
        { label: 'Acima de R$ 12.000', min: 12000, max: Infinity }
    ], []);

    // --- LÓGICA DE PROCESSAMENTO (BLINDADA CONTRA TELA AZUL) ---
    const buildsProcessadas = useMemo(() => {
        // Se as peças ainda não carregaram ou o objeto está vazio, retorna vazio e não processa
        if (!buildsProntas || buildsProntas.length === 0 || !todasPecas || Object.keys(todasPecas).length === 0) {
            return [];
        }

        const buscarPeca = (id, categoriaAlvo) => {
            if (!id) return null;
            
            // Tenta encontrar a chave correta no objeto todasPecas
            const chaveReal = Object.keys(todasPecas).find(key => 
                key.toLowerCase().replace(/-/g, '') === categoriaAlvo.toLowerCase().replace(/-/g, '')
            );
            
            const lista = todasPecas[chaveReal || categoriaAlvo] || [];
            // Compara IDs como Number para evitar erro de String vs Int
            return lista.find(p => Number(p.id) === Number(id)) || null;
        };

        return buildsProntas.map(b => {
            const cpu = buscarPeca(b.cpu_id, 'cpu');
            const gpu = buscarPeca(b.gpu_id, 'placaDeVideo');
            const mobo = buscarPeca(b.placaMae_id, 'placaMae');
            const ram = buscarPeca(b.memoria_id, 'memoria');
            const ssd = buscarPeca(b.armazenamento_id, 'armazenamento');
            const psu = buscarPeca(b.fonte_id, 'fonte');
            const cooler = buscarPeca(b.cooler_id, 'cooler');
            const gabinete = buscarPeca(b.gabinete_id, 'gabinete');

            const pecas = [cpu, gpu, mobo, ram, ssd, psu, cooler, gabinete];
            const precoTotal = pecas.reduce((acc, p) => acc + parseFloat(p?.preco || 0), 0);

            return {
                ...b,
                preco_total: precoTotal,
                cpu_nome: cpu?.nome || 'Processador Indisponível',
                gpu_nome: gpu ? `${gpu.marca} ${gpu.specs?.nome_chip || gpu.modelo_especifico || ''}` : 'GPU N/A',
                buildData: { cpu, placaDeVideo: gpu, placaMae: mobo, memoria: ram, armazenamento: ssd, fonte: psu, cooler, gabinete }
            };
        });
    }, [buildsProntas, todasPecas]);

    const buildsFiltradas = useMemo(() => {
        let res = [...buildsProcessadas];
        if (filtroUso !== 'Todos') {
            res = res.filter(b => mapaUso[b.uso_principal] === filtroUso || b.uso_principal === filtroUso);
        }
        if (filtroPreco !== 'Todos') {
            const faixa = faixasPreco.find(f => f.label === filtroPreco);
            if (faixa) res = res.filter(b => b.preco_total >= faixa.min && b.preco_total < faixa.max);
        }
        return res;
    }, [buildsProcessadas, filtroUso, filtroPreco]);

    const handleChooseBuild = (build) => {
        if (build.buildData?.cpu) {
            setBuild(build.buildData);
            navigate('/montador');
        }
    };

    if (isLoading) return <div className="loading-screen">Carregando configurações...</div>;

    return (
        <div className="guias-container">
            <div className="guias-header">
                <h1>PCs Pré-montados</h1>
                <p>Builds selecionadas com base no estoque atual de Porto Velho.</p>
            </div>

            <div className="filtros-container-guias">
                <div className="filtro-secao">
                    <h3>Propósito</h3>
                    <div className="filtros-uso">
                        {['Todos', 'Gamer', 'Home Office', 'Edição'].map(uso => (
                            <button key={uso} className={`filtro-btn ${filtroUso === uso ? 'active' : ''}`} onClick={() => setFiltroUso(uso)}>{uso}</button>
                        ))}
                    </div>
                </div>

                <div className="filtro-secao">
                    <h3>Faixa de Preço</h3>
                    <div className="filtros-preco">
                        {faixasPreco.map(f => (
                            <button key={f.label} className={`filtro-btn ${filtroPreco === f.label ? 'active' : ''}`} onClick={() => setFiltroPreco(f.label)}>{f.label}</button>
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
                            src={`${API_BASE_URL}/build-images/${build.build_image.split('/').pop()}`}
                            alt={build.nome}
                            className="build-image"
                            onClick={() => setViewingBuild(build)}
                            onError={(e) => { 
                              e.target.src = 'https://via.placeholder.com/400x300?text=PC+Build'; 
                            }}
                          />
                        <div className="build-info">
                            <h3 onClick={() => setViewingBuild(build)}>{build.nome}</h3>
                            <div className="build-specs">
                                <p><strong>CPU:</strong> {build.cpu_nome}</p>
                                <p><strong>GPU:</strong> {build.gpu_nome}</p>
                            </div>
                            <p className="build-preco">R$ {build.preco_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="build-actions-single">
                            <button className="btn-action-full" onClick={() => handleChooseBuild(build)}>
                                <FaWrench /> Personalizar no Montador
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {viewingBuild && (
                <BuildDetailModal 
                    build={viewingBuild} 
                    onClose={() => setViewingBuild(null)} 
                    currentUser={currentUser} 
                />
            )}
        </div>
    );
}

export default GuiasPage;