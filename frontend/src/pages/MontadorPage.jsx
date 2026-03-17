// ARQUIVO: frontend/src/pages/MontadorPage.jsx
// (VERSÃO COM CB SCORE INTEGRADO NA SELEÇÃO)

import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { FaTrash, FaSave, FaExclamationTriangle, FaCheckCircle, FaBalanceScale, FaChartLine, FaInfoCircle, FaStar, FaFilter, FaGamepad, FaVideo, FaBriefcase, FaCube, FaRobot, FaTrophy } from 'react-icons/fa';
import './MontadorPage.css';
import CheckoutModal from '../components/CheckoutModal.jsx';
import ComponentDetailModal from '../components/ComponentDetailModal.jsx';
import ComponentComparator from '../components/ComponentComparator.jsx';
import PerformanceAnalysis from '../components/PerformanceAnalysis.jsx';
import GameSimulation from '../components/GameSimulation.jsx';
import CostBenefitAnalysis from '../components/CostBenefitAnalysis.jsx';
import SmartRecommendations from '../components/SmartRecommendations.jsx';
import { API_BASE_URL } from '../config.js';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const CATEGORY_MAP = {
    'processador': 'cpu',
    'placa_mae': 'placaMae',
    'memoria_ram': 'memoria',
    'placa_video': 'placaDeVideo',
    'gabinete': 'gabinete',
    'fonte_alimentacao': 'fonte',
    'refrigeracao': 'cooler',
    'armazenamento': 'armazenamento'
};

const USE_CASES = [
    { id: 'Jogos', nome: 'Jogos', icon: FaGamepad},
    { id: 'Edicao', nome: 'Edição de Vídeo', icon: FaVideo},
    { id: 'Trabalho', nome: 'Trabalho/Escritório', icon: FaBriefcase},
    { id: 'Modelagem', nome: 'Modelagem 3D', icon: FaCube},
    { id: 'IA', nome: 'IA/Machine Learning', icon: FaRobot}
];

const CATEGORIAS = [
    { id: 'cpu', nome: 'CPU', endpoint: 'processadores' },
    { id: 'placaMae', nome: 'Placa-mãe', endpoint: 'placas-mae' },
    { id: 'cooler', nome: 'Cooler do CPU', endpoint: 'refrigeracao' },
    { id: 'memoria', nome: 'Memória', endpoint: 'memorias-ram' },
    { id: 'placaDeVideo', nome: 'Placa de Vídeo', endpoint: 'placas-de-video' },
    { id: 'armazenamento', nome: 'Armazenamento', endpoint: 'armazenamento' },
    { id: 'fonte', nome: 'Fonte de Alimentação', endpoint: 'fontes' },
    { id: 'gabinete', nome: 'Gabinete', endpoint: 'gabinetes' }
];

function MontadorPage({ build, setBuild, currentUser }) {
    const [pecasDisponiveis, setPecasDisponiveis] = useState({});
    const [modalAberto, setModalAberto] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [useCase, setUseCase] = useState('Jogos');
    const [performanceAnalysis, setPerformanceAnalysis] = useState(null);
    const [gamePerformance, setGamePerformance] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false);
    const [cpuFilter, setCpuFilter] = useState('all');
    const [moboFilter, setMoboFilter] = useState('all');
    const modalScrollRef = useRef(0);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/api/pecas/todas`);
                const todasAsPecas = response.data;
                const dadosOrganizados = {};
                
                todasAsPecas.forEach(peca => {
                    const chaveFrontend = CATEGORY_MAP[peca.categoria];
                    if (chaveFrontend) {
                        if (!dadosOrganizados[chaveFrontend]) {
                            dadosOrganizados[chaveFrontend] = [];
                        }
                        dadosOrganizados[chaveFrontend].push(peca);
                    }
                });
                setPecasDisponiveis(dadosOrganizados);
            } catch (error) {
                console.error("Erro ao carregar peças:", error);
                setError("Falha ao conectar com o banco de dados.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const pecasFiltradas = useMemo(() => {
        if (!pecasDisponiveis || Object.keys(pecasDisponiveis).length === 0) return {};
        const { cpu, placaMae } = build;
        let filtradas = { ...pecasDisponiveis };

        if (cpu) {
            const socketCpu = cpu.specs?.soquete || cpu.specs?.socket || "";
            filtradas.placaMae = pecasDisponiveis.placaMae?.filter(p => {
                const socketMobo = p.specs?.soquete || p.specs?.socket || p.specs?.soquete_cpu;
                return socketMobo === socketCpu;
            });
            filtradas.cooler = pecasDisponiveis.cooler?.filter(c => {
                const socketsSuportados = c.specs?.soquetes_suportados || c.specs?.socket || "";
                return socketsSuportados.includes(socketCpu);
            });
        }

        if (placaMae) {
            const socketMobo = placaMae.specs?.soquete || placaMae.specs?.socket || placaMae.specs?.soquete_cpu;
            const tipoRamMobo = placaMae.specs?.tipo_ram || placaMae.specs?.tipo_memoria || "DDR4";

            filtradas.cpu = pecasDisponiveis.cpu?.filter(p => {
                const socketCpu = p.specs?.soquete || p.specs?.socket;
                return socketCpu === socketMobo;
            });
            filtradas.memoria = pecasDisponiveis.memoria?.filter(m => {
                const tipoRamMemoria = m.specs?.tipo || m.specs?.tipo_ram;
                return tipoRamMemoria?.includes(tipoRamMobo) || tipoRamMobo?.includes(tipoRamMemoria);
            });
            filtradas.gabinete = pecasDisponiveis.gabinete?.filter(g => {
                const formatoMobo = placaMae.specs?.formato || placaMae.specs?.fator_forma || "ATX";
                const formatosGabinete = g.specs?.formatos_suportados || g.specs?.placas_mae_compativeis || "";
                if (!formatosGabinete) return true;
                return formatosGabinete.toLowerCase().includes(formatoMobo.toLowerCase());
            });
        }

        if (!cpu && cpuFilter !== 'all') {
            filtradas.cpu = pecasDisponiveis.cpu?.filter(p => 
                p.marca?.toLowerCase() === cpuFilter.toLowerCase()
            );
        }

        if (!placaMae && moboFilter !== 'all') {
            filtradas.placaMae = pecasDisponiveis.placaMae?.filter(p => {
                const plataformaPeca = p.specs?.plataforma || p.plataforma;
                return plataformaPeca?.toLowerCase() === moboFilter.toLowerCase();
            });
        }

        return filtradas;
    }, [build, pecasDisponiveis, cpuFilter, moboFilter]);

    const potenciaMinima = useMemo(() => {
        const { cpu, placaDeVideo, memoria } = build;
        if (!cpu && !placaDeVideo) return 0;
        const tdpCPU = parseInt(cpu?.specs?.tdp_w || cpu?.specs?.tdp || 0); 
        const tdpGPU = parseInt(placaDeVideo?.specs?.tdp_w || placaDeVideo?.specs?.tdp || 0);
        const consumoRAM = (parseInt(memoria?.specs?.modulos || 1)) * 10; 
        const consumoPlacaMae = 50;
        const consumoBase = tdpCPU + tdpGPU + consumoRAM + consumoPlacaMae;
        return Math.ceil(consumoBase * 1.3);
    }, [build]);

    const fontesCompativeis = useMemo(() => {
        if (!pecasFiltradas.fonte) return [];
        if (potenciaMinima === 0) return pecasFiltradas.fonte;
        return pecasFiltradas.fonte.filter(f => 
            parseInt(f.specs?.potencia_w || f.specs?.potencia || 0) >= potenciaMinima
        );
    }, [potenciaMinima, pecasFiltradas.fonte]);

    const handleSelectPeca = (categoriaId, pecaId) => {
        const peca = pecasDisponiveis[categoriaId].find(p => p.id === pecaId);
        const newBuild = { ...build };
        const resetDependents = (key) => {
            const dependentMap = {
                cpu: ['placaMae', 'cooler', 'memoria', 'gabinete'],
                placaMae: ['memoria', 'gabinete']
            };
            if (dependentMap[key]) {
                dependentMap[key].forEach(depKey => { delete newBuild[depKey]; });
            }
        };

        if (categoriaId === 'cpu' && build.cpu && build.cpu.id !== peca.id) resetDependents('cpu');
        if (categoriaId === 'placaMae' && build.placaMae && build.placaMae.id !== peca.id) resetDependents('placaMae');

        newBuild[categoriaId] = peca;
        setBuild(newBuild);
        setModalAberto(null);
    };

    const handleRemovePeca = (categoriaId) => {
        const newBuild = { ...build };
        delete newBuild[categoriaId];
        setBuild(newBuild);
    };

    const handleClearBuild = () => setBuild({});

    const precoTotal = useMemo(() => {
        return Object.values(build).reduce((total, peca) => total + (peca ? parseFloat(peca.preco || 0) : 0), 0);
    }, [build]);

    const handleSaveBuild = async () => {
        if (!currentUser || !currentUser.id) {
            toast.error("Você precisa estar logado para salvar uma build.");
            return;
        }
        const { value: buildName } = await Swal.fire({
            title: 'Nome da sua Build',
            input: 'text',
            inputValue: 'Meu PC Gamer',
            showCancelButton: true,
            confirmButtonColor: '#5bc3e2',
            background: '#161B22',
            color: '#fff',
        });
        if (buildName) {
            try {
                await axios.post(`${API_BASE_URL}/api/builds/save`, {
                    userId: currentUser.id,
                    buildName,
                    buildData: build 
                });
                toast.success(`Build "${buildName}" salva!`);
            } catch (err) { toast.error("Erro ao salvar."); }
        }
    };

    const fetchAdvancedAnalysis = async () => {
        if (!build.cpu || !build.placaDeVideo) return;
        setIsAnalyzing(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/builds/complete-analysis`, { build, useCase });
            setPerformanceAnalysis(response.data.performance);
            setGamePerformance(response.data.gamePerformance);
            setRecommendations(response.data.recommendations);
            setShowAdvancedAnalysis(true);
        } catch (err) { console.error(err); } finally { setIsAnalyzing(false); }
    };

    useEffect(() => {
        if (build.cpu && build.placaDeVideo && Object.keys(build).length >= 3) {
            const timer = setTimeout(() => fetchAdvancedAnalysis(), 1000);
            return () => clearTimeout(timer);
        } else {
            setShowAdvancedAnalysis(false);
        }
    }, [build, useCase]);

    const bottleneckAnalysis = useMemo(() => {
        const { cpu, placaDeVideo } = build;
        if (!cpu || !placaDeVideo) return { message: "Selecione CPU e GPU para analisar o gargalo.", severity: 'info' };
        const cpuScore = parseInt(cpu?.specs?.power_score || 0);
        const gpuScore = parseInt(placaDeVideo?.specs?.power_score || 0);
        const ratio = cpuScore / gpuScore;
        let minRatio = 0.7, maxRatio = 1.5;
        if (ratio < minRatio) return { message: `Gargalo de CPU para ${useCase}`, severity: 'warning' };
        if (ratio > maxRatio && useCase !== 'Trabalho') return { message: `GPU Subutilizada para ${useCase}`, severity: 'warning' };
        return { message: `Excelente equilíbrio para ${useCase}!`, severity: 'good' };
    }, [build, useCase]);

    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const handleFinalizarCompra = () => {
        if (!currentUser) { toast.error("Logue para finalizar."); return; }
        if (Object.keys(build).length === 0) { toast.error("Adicione peças."); return; }
        setIsCheckoutOpen(true);
    };
    
    const [componentDetailModal, setComponentDetailModal] = useState(null);

    const getComponentBadge = (peca, categoriaId) => {
        switch(categoriaId) {
            case 'cpu': return peca.marca === 'AMD' ? <span className="badge badge-amd">AMD</span> : <span className="badge badge-intel">Intel</span>;
            case 'placaMae': return (peca.specs?.plataforma || peca.plataforma) === 'AMD' ? <span className="badge badge-amd">AMD</span> : <span className="badge badge-intel">Intel</span>;
            case 'placaDeVideo': return <span className={`badge badge-${peca.marca?.toLowerCase()}`}>{peca.marca}</span>;
            default: return null;
        }
    };

    // --- MODAL DE SELEÇÃO COM CB SCORE INTEGRADO ---
    const SelectionModal = ({ categoria }) => {
        const listaDePecas = categoria.id === 'fonte' ? fontesCompativeis : pecasFiltradas[categoria.id];
        const showScores = categoria.id === 'cpu' || categoria.id === 'placaDeVideo';
        const pecasListRef = useRef(null);

        useEffect(() => {
            if (pecasListRef.current && modalScrollRef.current > 0) {
                pecasListRef.current.scrollTop = modalScrollRef.current;
            }
        }, []);

        return (
            <div className="modal-backdrop" onClick={() => setModalAberto(null)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header-with-filters">
                        <h2>Selecione: {categoria.nome}</h2>
                        {(categoria.id === 'cpu' || categoria.id === 'placaMae') && (
                            <div className="filter-buttons">
                                <FaFilter />
                                <button className={`filter-btn ${(categoria.id === 'cpu' ? cpuFilter : moboFilter) === 'all' ? 'active' : ''}`} onClick={() => categoria.id === 'cpu' ? setCpuFilter('all') : setMoboFilter('all')}>Todos</button>
                                <button className={`filter-btn filter-amd ${(categoria.id === 'cpu' ? cpuFilter : moboFilter) === 'amd' ? 'active' : ''}`} onClick={() => categoria.id === 'cpu' ? setCpuFilter('amd') : setMoboFilter('amd')}>AMD</button>
                                <button className={`filter-btn filter-intel ${(categoria.id === 'cpu' ? cpuFilter : moboFilter) === 'intel' ? 'active' : ''}`} onClick={() => categoria.id === 'cpu' ? setCpuFilter('intel') : setMoboFilter('intel')}>Intel</button>
                            </div>
                        )}
                    </div>

                    <div className="pecas-list" ref={pecasListRef}>
                        {listaDePecas?.map(peca => {
                            const powerScore = peca.specs?.power_score || 0;
                            const cbScore = peca.specs?.cb_score || 0;

                            return (
                                <div key={peca.id} className="peca-card-enhanced">
                                    <div className="peca-card-main" onClick={() => handleSelectPeca(categoria.id, peca.id)}>
                                        <div className="peca-info">
                                            <div className="peca-name-row">
                                                <strong>{peca.nome}</strong>
                                                {getComponentBadge(peca, categoria.id)}
                                            </div>
                                            
                                            {showScores && (
                                                <div className="scores-container-mini">
                                                    <div className="power-score-badge">
                                                        <FaStar /> Score: {powerScore}/100
                                                    </div>
                                                    
                                                    {/* NOVO: EXIBIÇÃO DO CB SCORE NO MODAL DE SELEÇÃO */}
                                                    {cbScore > 0 && (
                                                        <div className={`cb-score-badge-mini ${cbScore >= 35 ? 'premium' : ''}`}>
                                                            <FaTrophy /> C/B: {cbScore}
                                                            {cbScore >= 35 && <span className="mini-diamond"> 💎</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <span className="peca-price">R$ {peca.preco?.toFixed(2)}</span>
                                    </div>
                                    <button className="btn-info-peca" onClick={(e) => { e.stopPropagation(); setComponentDetailModal({ component: peca, category: categoria.id }); }}>
                                        <FaInfoCircle />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="montador-container error-screen"><h2>Erro</h2><p>{error}</p></div>;

    return (
        <div className="montador-container">
            <div className="selecao-pecas">
                <div className="selecao-header">
                    <h2>Monte seu PC</h2>
                    <div className="header-buttons">
                        {currentUser && <button onClick={handleSaveBuild} className="btn btn-salvar"><FaSave /> Salvar</button>}
                        <button onClick={handleClearBuild} className="btn btn-limpar">Limpar</button>
                    </div>
                </div>

                <div className="use-case-selector">
                    <h3>Para que você vai usar este PC?</h3>
                    <div className="use-case-buttons">
                        {USE_CASES.map(uc => (
                            <button key={uc.id} className={`use-case-btn ${useCase === uc.id ? 'active' : ''}`} onClick={() => setUseCase(uc.id)}>
                                <uc.icon className="use-case-icon" />
                                <span>{uc.nome}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {CATEGORIAS.map(cat => (
                    <div key={cat.id} className="categoria-row">
                        <span>{cat.nome}</span>
                        {build[cat.id] ? (
                            <div className="peca-selecionada">
                                <span className="nome-peca">{build[cat.id].nome}</span>
                                <button onClick={() => setModalAberto(cat)}>Trocar</button>
                            </div>
                        ) : (
                            <button onClick={() => setModalAberto(cat)}>+ Adicionar</button>
                        )}
                    </div>
                ))}
            </div>

            <div className="resumo-montagem">
                <h2>Resumo da Montagem</h2>
                {Object.keys(build).length === 0 ? <p className="resumo-vazio">Comece selecionando uma peça...</p> : (
                    CATEGORIAS.map(cat => build[cat.id] && (
                        <div key={cat.id} className="resumo-item">
                            <span className="resumo-categoria">{cat.nome}</span>
                            <span className="resumo-nome">{build[cat.id].nome}</span>
                            <div className="preco-e-remover">
                                <span className="resumo-preco">R$ {build[cat.id].preco?.toFixed(2)}</span>
                                <button onClick={() => handleRemovePeca(cat.id)} className="btn-remover-item"><FaTrash /></button>
                            </div>
                        </div>
                    ))
                )}
                <div className={`bottleneck-section ${bottleneckAnalysis.severity}`}>
                    <div className="bottleneck-message"><p>{bottleneckAnalysis.message}</p></div>
                </div>
                <div className="resumo-total"><span>Preço Final</span><span>R$ {precoTotal.toFixed(2)}</span></div>
                <button onClick={handleFinalizarCompra} className="btn-finalizar">Finalizar e Comprar</button>
                {build.cpu && build.placaDeVideo && !showAdvancedAnalysis && (
                    <button onClick={fetchAdvancedAnalysis} className="btn-analise-avancada" disabled={isAnalyzing}>
                        <FaChartLine /> {isAnalyzing ? 'Analisando...' : 'Ver Análise Completa'}
                    </button>
                )}
            </div>

            {showAdvancedAnalysis && performanceAnalysis && (
                <div className="advanced-analysis-container">
                    <PerformanceAnalysis analysis={performanceAnalysis} />
                    {gamePerformance && useCase === 'Jogos' && <GameSimulation gamePerformance={gamePerformance} />}
                    {recommendations?.costBenefit && <CostBenefitAnalysis costBenefit={recommendations.costBenefit} />}
                    {recommendations?.recommendations && <SmartRecommendations recommendations={recommendations.recommendations} />}
                </div>
            )}

            {isCheckoutOpen && <CheckoutModal build={{ buildData: build, buildName: "Build Personalizada" }} currentUser={currentUser} onClose={() => setIsCheckoutOpen(false)} />}
            {modalAberto && <SelectionModal categoria={modalAberto} />}
            {componentDetailModal && (
                <ComponentDetailModal
                    component={componentDetailModal.component}
                    category={componentDetailModal.category}
                    onClose={() => { setComponentDetailModal(null); setModalAberto(CATEGORIAS.find(c => c.id === componentDetailModal.category)); }}
                />
            )}
            <ComponentComparator pecasDisponiveis={pecasFiltradas} onSelectComponent={handleSelectPeca} />
        </div>
    );
}

export default MontadorPage;