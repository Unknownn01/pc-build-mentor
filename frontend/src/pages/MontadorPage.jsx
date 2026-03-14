// ARQUIVO: frontend/src/pages/MontadorPage.jsx
// (VERSÃO COM SELETOR DE PROPÓSITO DE USO)

import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { FaTrash, FaSave, FaExclamationTriangle, FaCheckCircle, FaBalanceScale, FaChartLine, FaInfoCircle, FaStar, FaFilter, FaGamepad, FaVideo, FaBriefcase, FaCube, FaRobot } from 'react-icons/fa';
import './MontadorPage.css';
import CheckoutModal from '../components/CheckoutModal.jsx';
import ComponentDetailModal from '../components/ComponentDetailModal.jsx';
import ComponentComparator from '../components/ComponentComparator.jsx';
import PerformanceAnalysis from '../components/PerformanceAnalysis.jsx';
import GameSimulation from '../components/GameSimulation.jsx';
import CostBenefitAnalysis from '../components/CostBenefitAnalysis.jsx';
import SmartRecommendations from '../components/SmartRecommendations.jsx';
import { API_BASE_URL } from '../config.js';
import LoadingSpinner from '../components/LoadingSpinner'; // Importe o componente
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
    
    // Estado para propósito de uso
    const [useCase, setUseCase] = useState('Jogos');
    
    // Estados para análises avançadas
    const [performanceAnalysis, setPerformanceAnalysis] = useState(null);
    const [gamePerformance, setGamePerformance] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false);

    // Estados para filtros
    const [cpuFilter, setCpuFilter] = useState('all');
    const [moboFilter, setMoboFilter] = useState('all');

    // Ref para manter posição do scroll
    const modalScrollRef = useRef(0);

    useEffect(() => {
    const fetchAllData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // 1. Busca TUDO de uma vez só
            const response = await axios.get(`${API_BASE_URL}/api/pecas/todas`);
            const todasAsPecas = response.data;

            // 2. Organiza as peças nas "caixinhas" certas (cpu, placaMae, etc)
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
    // Se não carregou ainda, retorna vazio
    if (!pecasDisponiveis || Object.keys(pecasDisponiveis).length === 0) return {};
    
    const { cpu, placaMae } = build;
    
    // Começamos com todas as peças disponíveis
    let filtradas = { ...pecasDisponiveis };

    // --- FILTRO 1: Se escolheu CPU, filtrar a Placa-Mãe ---
    if (cpu) {
        const socketCpu = cpu.specs?.soquete || cpu.specs?.socket || "";
        
        filtradas.placaMae = pecasDisponiveis.placaMae?.filter(p => {
            // A placa mãe pode chamar de 'soquete', 'socket' ou 'soquete_cpu'
            const socketMobo = p.specs?.soquete || p.specs?.socket || p.specs?.soquete_cpu;
            return socketMobo === socketCpu;
        });

        filtradas.cooler = pecasDisponiveis.cooler?.filter(c => {
            const socketsSuportados = c.specs?.soquetes_suportados || c.specs?.socket || "";
            return socketsSuportados.includes(socketCpu);
        });
    }

    // --- FILTRO 2: Se escolheu Placa-Mãe, filtrar CPU e Memória ---
    if (placaMae) {
        const socketMobo = placaMae.specs?.soquete || placaMae.specs?.socket || placaMae.specs?.soquete_cpu;
        const tipoRamMobo = placaMae.specs?.tipo_ram || placaMae.specs?.tipo_memoria || "DDR4";

        filtradas.cpu = pecasDisponiveis.cpu?.filter(p => {
            const socketCpu = p.specs?.soquete || p.specs?.socket;
            return socketCpu === socketMobo;
        });

        filtradas.memoria = pecasDisponiveis.memoria?.filter(m => {
            const tipoRamMemoria = m.specs?.tipo || m.specs?.tipo_ram;
            // Verifica se "DDR4" está dentro da string da placa mãe ou vice-versa
            return tipoRamMemoria?.includes(tipoRamMobo) || tipoRamMobo?.includes(tipoRamMemoria);
        });
        
        // Filtro de Gabinete (Formato ATX/mATX)
        const formatoMobo = placaMae.specs?.formato || placaMae.specs?.fator_forma;
        // Filtro de Gabinete
        filtradas.gabinete = pecasDisponiveis.gabinete?.filter(g => {
            // 1. Pega o formato da placa (ex: ATX, Micro-ATX)
            const formatoMobo = placaMae.specs?.formato || placaMae.specs?.fator_forma || "ATX";

            // 2. Pega o que o gabinete aceita
            const formatosGabinete = g.specs?.formatos_suportados || g.specs?.placas_mae_compativeis || "";

            // 3. Se não houver informação no gabinete, mostramos por precaução (evita sumir tudo)
            if (!formatosGabinete) return true;

            // 4. Comparação em minúsculo para evitar erro de 'atx' vs 'ATX'
            return formatosGabinete.toLowerCase().includes(formatoMobo.toLowerCase());
        });
    }

    // Filtros visuais (barra lateral)
    if (!cpu && cpuFilter !== 'all') {
        filtradas.cpu = pecasDisponiveis.cpu?.filter(p => 
            p.marca?.toLowerCase() === cpuFilter.toLowerCase()
        );
    }

    // --- Filtros visuais para Placa-mãe (Adicione este trecho) ---
    if (!placaMae && moboFilter !== 'all') {
        filtradas.placaMae = pecasDisponiveis.placaMae?.filter(p => {
            // Pega a plataforma de dentro de specs
            const plataformaPeca = p.specs?.plataforma || p.plataforma;
            
            // Compara com o estado do botão (amd ou intel)
            return plataformaPeca?.toLowerCase() === moboFilter.toLowerCase();
        });
    }

    return filtradas;
}, [build, pecasDisponiveis, cpuFilter, moboFilter]);

    const potenciaMinima = useMemo(() => {
    const { cpu, placaDeVideo, memoria } = build;
    if (!cpu && !placaDeVideo) return 0;

    // Usamos o operador ?. para evitar erro se specs for undefined
    // O "|| 0" garante que não dê NaN se o campo estiver vazio
    const tdpCPU = parseInt(cpu?.specs?.tdp_w || cpu?.specs?.tdp || 0); 
    const tdpGPU = parseInt(placaDeVideo?.specs?.tdp_w || placaDeVideo?.specs?.tdp || 0);
    
    // Memória geralmente não tem specs complexas de energia, assumimos padrão
    const consumoRAM = (parseInt(memoria?.specs?.modulos || 1)) * 10; 
    
    const consumoPlacaMae = 50;
    const consumoBase = tdpCPU + tdpGPU + consumoRAM + consumoPlacaMae;
    
    return Math.ceil(consumoBase * 1.3); // Margem de segurança de 30%
}, [build]);

    const fontesCompativeis = useMemo(() => {
    if (!pecasFiltradas.fonte) return [];
    if (potenciaMinima === 0) return pecasFiltradas.fonte;

    return pecasFiltradas.fonte.filter(f => 
        // Antes: f.potencia_w >= potenciaMinima
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

        if (categoriaId === 'cpu' && build.cpu && build.cpu.id !== peca.id) {
            resetDependents('cpu');
        }
        if (categoriaId === 'placaMae' && build.placaMae && build.placaMae.id !== peca.id) {
            resetDependents('placaMae');
        }

        newBuild[categoriaId] = peca;
        setBuild(newBuild);
        setModalAberto(null);
    };

    const handleRemovePeca = (categoriaId) => {
        const newBuild = { ...build };
        delete newBuild[categoriaId];
        setBuild(newBuild);
    };

    const handleClearBuild = () => {
        setBuild({});
    };

    const precoTotal = useMemo(() => {
        const subtotal = Object.values(build).reduce((total, peca) => total + (peca ? parseFloat(peca.preco?.toFixed(2)) : 0), 0);
        return subtotal;
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
            inputLabel: 'Como você quer chamar essa máquina?',
            showCancelButton: true,
            background: '#161B22',
            color: '#fff',
            confirmButtonColor: '#5bc3e2',
            inputValidator: (value) => {
                if (!value) return 'Você precisa dar um nome!'
            }
        });
    
        if (buildName) {
            try {
                await axios.post(`${API_BASE_URL}/api/builds/save`, {
                    userId: currentUser.id,
                    buildName: buildName,
                    buildData: build 
                });
                toast.success(`Build "${buildName}" salva com sucesso!`);
            } catch (err) {
                toast.error("Erro ao salvar.");
            }
        }
    };

    // Função para buscar análises avançadas com contexto de uso
    const fetchAdvancedAnalysis = async () => {
        if (!build.cpu || !build.placaDeVideo) return;
    
        setIsAnalyzing(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/builds/complete-analysis`, { build, useCase });
            
            // Distribuindo os dados para os estados que alimentam os componentes
            setPerformanceAnalysis(response.data.performance);
            setGamePerformance(response.data.gamePerformance);
            setRecommendations(response.data.recommendations);
    
            setShowAdvancedAnalysis(true);
        } catch (err) {
            console.error("Erro ao buscar análises:", err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Atualiza análises quando a build ou useCase mudam
    useEffect(() => {
        if (build.cpu && build.placaDeVideo && Object.keys(build).length >= 3) {
            const timer = setTimeout(() => {
                fetchAdvancedAnalysis();
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setPerformanceAnalysis(null);
            setGamePerformance(null);
            setRecommendations(null);
            setShowAdvancedAnalysis(false);
        }
    }, [build, useCase]); // eslint-disable-line react-hooks/exhaustive-deps
    
    // Análise de gargalo contextualizada
    const bottleneckAnalysis = useMemo(() => {
        const { cpu, placaDeVideo } = build;
        if (!cpu || !placaDeVideo) {
            return { message: "Selecione uma CPU e uma Placa de Vídeo para analisar o gargalo.", severity: 'info' };
        }

        const cpuScore = parseInt(build.cpu?.specs?.power_score || 0);
        const gpuScore = parseInt(build.placaDeVideo?.specs?.power_score || 0);
        const ratio = cpuScore / gpuScore;

        // Limites variam por caso de uso
        let minRatio, maxRatio;
        switch(useCase) {
            case 'Jogos':
                minRatio = 0.70;
                maxRatio = 1.5;
                break;
            case 'Edicao':
                minRatio = 0.80;
                maxRatio = 1.3;
                break;
            case 'Trabalho':
                minRatio = 0.90;
                maxRatio = 3.0;
                break;
            case 'Modelagem':
                minRatio = 0.75;
                maxRatio = 1.4;
                break;
            case 'IA':
                minRatio = 0.60;
                maxRatio = 1.2;
                break;
            default:
                minRatio = 0.70;
                maxRatio = 1.5;
        }

        if (ratio < minRatio) {
            return { 
                message: `Gargalo de CPU para ${useCase}: Sua CPU (score ${cpuScore}) está limitando o potencial da GPU (score ${gpuScore}).`, 
                severity: 'warning' 
            };
        }
        if (ratio > maxRatio && useCase !== 'Trabalho') {
            return { 
                message: `GPU Subutilizada para ${useCase}: Sua GPU poderia ser mais potente para aproveitar melhor a CPU.`, 
                severity: 'warning' 
            };
        }
        
        return { 
            message: `Excelente equilíbrio para ${useCase}! CPU e GPU estão bem balanceadas.`, 
            severity: 'good' 
        };

    }, [build, useCase]);
    
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const handleFinalizarCompra = () => {
        if (!currentUser) { toast.error("Você precisa estar logado para finalizar a compra."); return; }
        if (Object.keys(build).length === 0) { toast.error("Adicione pelo menos uma peça para finalizar a compra."); return; }
        setIsCheckoutOpen(true);
    };
    
    const [componentDetailModal, setComponentDetailModal] = useState(null);

    const getComponentBadge = (peca, categoriaId) => {
        switch(categoriaId) {
            case 'cpu':
                return peca.marca === 'AMD' ? 
                    <span className="badge badge-amd">AMD</span> : 
                    <span className="badge badge-intel">Intel</span>;
            case 'placaMae':
                // Busca a plataforma dentro de specs ou na raiz (fallback)
                const plataformaMobo = peca.specs?.plataforma || peca.plataforma;
                return plataformaMobo === 'AMD' ? 
                    <span className="badge badge-amd">AMD</span> : 
                    <span className="badge badge-intel">Intel</span>;
            case 'placaDeVideo':
                if (peca.marca === 'NVIDIA') return <span className="badge badge-nvidia">NVIDIA</span>;
                if (peca.marca === 'AMD') return <span className="badge badge-amd">AMD</span>;
                if (peca.marca === 'Intel') return <span className="badge badge-intel">Intel</span>;
                return null;
            case 'memoria':
                if (peca.tipo?.includes('DDR5')) return <span className="badge badge-ddr5">DDR5</span>;
                if (peca.tipo?.includes('DDR4')) return <span className="badge badge-ddr4">DDR4</span>;
                return null;
            case 'armazenamento':
                if (peca.tipo?.includes('M.2') || peca.tipo?.includes('NVMe')) 
                    return <span className="badge badge-m2">M.2</span>;
                if (peca.tipo?.includes('SATA')) 
                    return <span className="badge badge-sata">SATA</span>;
                return null;
            case 'cooler':
                if (peca.tipo?.toLowerCase().includes('water') || peca.tipo?.toLowerCase().includes('líquido'))
                    return <span className="badge badge-water">Water</span>;
                if (peca.tipo?.toLowerCase().includes('air') || peca.tipo?.toLowerCase().includes('ar'))
                    return <span className="badge badge-air">Air</span>;
                return null;
            default:
                return null;
        }
    };

    const SelectionModal = ({ categoria }) => {
        const listaDePecas = categoria.id === 'fonte' ? fontesCompativeis : pecasFiltradas[categoria.id];
        const showPowerScore = categoria.id === 'cpu' || categoria.id === 'placaDeVideo';
        const pecasListRef = useRef(null);

        useEffect(() => {
            if (pecasListRef.current && modalScrollRef.current > 0) {
                pecasListRef.current.scrollTop = modalScrollRef.current;
            }
        }, []);

        const handleOpenDetails = (e, peca) => {
            e.stopPropagation();
            if (pecasListRef.current) {
                modalScrollRef.current = pecasListRef.current.scrollTop;
            }
            setComponentDetailModal({ component: peca, category: categoria.id });
        };

        const showCpuFilter = categoria.id === 'cpu' && !build.placaMae;
        const showMoboFilter = categoria.id === 'placaMae' && !build.cpu;
        
        return (
            <div className="modal-backdrop" onClick={() => setModalAberto(null)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header-with-filters">
                        <h2>Selecione: {categoria.nome}</h2>
                        
                        {showCpuFilter && (
                            <div className="filter-buttons">
                                <FaFilter className="filter-icon" />
                                <button 
                                    className={`filter-btn ${cpuFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setCpuFilter('all')}
                                >
                                    Todos
                                </button>
                                <button 
                                    className={`filter-btn filter-amd ${cpuFilter === 'amd' ? 'active' : ''}`}
                                    onClick={() => setCpuFilter('amd')}
                                >
                                    AMD
                                </button>
                                <button 
                                    className={`filter-btn filter-intel ${cpuFilter === 'intel' ? 'active' : ''}`}
                                    onClick={() => setCpuFilter('intel')}
                                >
                                    Intel
                                </button>
                            </div>
                        )}

                        {showMoboFilter && (
                            <div className="filter-buttons">
                                <FaFilter className="filter-icon" />
                                <button 
                                    className={`filter-btn ${moboFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setMoboFilter('all')}
                                >
                                    Todos
                                </button>
                                <button 
                                    className={`filter-btn filter-amd ${moboFilter === 'amd' ? 'active' : ''}`}
                                    onClick={() => setMoboFilter('amd')}
                                >
                                    AMD
                                </button>
                                <button 
                                    className={`filter-btn filter-intel ${moboFilter === 'intel' ? 'active' : ''}`}
                                    onClick={() => setMoboFilter('intel')}
                                >
                                    Intel
                                </button>
                            </div>
                        )}
                    </div>

                    {potenciaMinima > 0 && categoria.id === 'fonte' && 
                        <p className="potencia-recomendada">Potência mínima recomendada: {potenciaMinima}W</p>
                    }
                    <div className="pecas-list" ref={pecasListRef}>
                        {listaDePecas && listaDePecas.length > 0 ? (
                            listaDePecas.map(peca => (
                                <div key={peca.id} className="peca-card-enhanced">
                                    <div className="peca-card-main" onClick={() => handleSelectPeca(categoria.id, peca.id)}>
                                        <div className="peca-info">
                                            <div className="peca-name-row">                                    
                                                <strong>
                                                    {peca.nome}
                                                </strong>
                                                {getComponentBadge(peca, categoria.id)}
                                            </div>
                                            {showPowerScore && (
                                                <div className="power-score-badge">
                                                    <FaStar /> Score: {peca.specs?.power_score || peca.power_score}/100
                                                </div>
                                            )}
                                        </div>
                                        <span className="peca-price">R$ {peca.preco?.toFixed(2)}</span>
                                    </div>
                                    <button 
                                        className="btn-info-peca"
                                        onClick={(e) => handleOpenDetails(e, peca)}
                                        title="Ver detalhes"
                                    >
                                        <FaInfoCircle />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="lista-vazia-aviso">Nenhuma peça compatível encontrada.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Exibe o spinner se estiver carregando
    if (isLoading) {
        return <LoadingSpinner />; // ✨ SPINNER OCUPA A TELA INTEIRA ✨
    }

    // Exibe mensagem de erro se houver
    if (error) {
        return (
        <div className="montador-container error-screen"> {/* Adicione uma classe para estilizar */}
            <h2>Erro ao Carregar</h2>
            <p>{error}</p>
        </div>
        );
    }
    return (
        <div className="montador-container">
            <div className="selecao-pecas">
                <div className="selecao-header">
                    <h2>Monte seu PC</h2>
                    <div className="header-buttons">
                        {currentUser && (
                            <button onClick={handleSaveBuild} className="btn btn-salvar">
                                <FaSave /> Salvar
                            </button>
                        )}
                        <button onClick={handleClearBuild} className="btn btn-limpar">Limpar</button>
                    </div>
                </div>

                {/* Seletor de Propósito de Uso */}
                <div className="use-case-selector">
                    <h3>Para que você vai usar este PC?</h3>
                    <div className="use-case-buttons">
                        {USE_CASES.map(uc => {
                            const Icon = uc.icon;
                            return (
                                <button
                                    key={uc.id}
                                    className={`use-case-btn ${useCase === uc.id ? 'active' : ''}`}
                                    onClick={() => setUseCase(uc.id)}
                                    style={{
                                        '--use-case-color': uc.color
                                    }}
                                >
                                    <Icon className="use-case-icon" />
                                    <span>{uc.nome}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {CATEGORIAS.map(cat => (
                    <div key={cat.id} className="categoria-row">
                        <span>{cat.nome}</span>
                        {build[cat.id] ? (
                            <div className="peca-selecionada">
                                <span className="nome-peca">
                                    {build[cat.id].nome}
                                </span>
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
                {Object.keys(build).length === 0 ? (
                    <p className="resumo-vazio">Selecione uma peça para começar...</p>
                ) : (
                    CATEGORIAS.map(cat => {
                        const peca = build[cat.id];
                        return peca ? (
                            <div key={cat.id} className="resumo-item">
                                <span className="resumo-categoria">{cat.nome}</span>
                                <span className="resumo-nome">
                                    {peca.nome}
                                </span>
                                    <div className="preco-e-remover">
                                    <span className="resumo-preco">R$ {peca.preco?.toFixed(2)}</span>
                                    <button onClick={() => handleRemovePeca(cat.id)} className="btn-remover-item">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ) : null;
                    })
                )}
                
                <div className={`bottleneck-section ${bottleneckAnalysis.severity}`}>
                    <h3>Análise para {useCase}</h3>
                    <div className="bottleneck-message">
                        {bottleneckAnalysis.severity === 'good' && <FaCheckCircle />}
                        {bottleneckAnalysis.severity === 'info' && <FaBalanceScale />}
                        {bottleneckAnalysis.severity === 'warning' && <FaExclamationTriangle />}
                        <p>{bottleneckAnalysis.message}</p>
                    </div>
                </div>

                <div className="resumo-total">
                    <span>Preço Final</span>
                    <span>R$ {precoTotal.toFixed(2)}</span>
                </div>

                <button onClick={handleFinalizarCompra} className="btn-finalizar">Finalizar e Comprar</button>
                
                {build.cpu && build.placaDeVideo && !showAdvancedAnalysis && (
                    <button 
                        onClick={fetchAdvancedAnalysis} 
                        className="btn-analise-avancada"
                        disabled={isAnalyzing}
                    >
                        <FaChartLine /> {isAnalyzing ? 'Analisando...' : 'Ver Análise Completa'}
                    </button>
                )}
            </div>

            {showAdvancedAnalysis && performanceAnalysis && (
                <div className="advanced-analysis-container">
                    <PerformanceAnalysis analysis={performanceAnalysis} />
                    {gamePerformance && useCase === 'Jogos' && <GameSimulation gamePerformance={gamePerformance} />}
                    {recommendations && recommendations.costBenefit && (
                        <CostBenefitAnalysis costBenefit={recommendations.costBenefit} />
                    )}
                    {recommendations && recommendations.recommendations && (
                        <SmartRecommendations recommendations={recommendations.recommendations} />
                    )}
                </div>
            )}
            {isCheckoutOpen && (
                <CheckoutModal 
                    build={{ buildData: build, buildName: "Build Personalizada" }}
                    currentUser={currentUser} 
                    onClose={() => setIsCheckoutOpen(false)} 
                />
            )}
            {modalAberto && <SelectionModal categoria={modalAberto} />}
            
            {componentDetailModal && (
                <ComponentDetailModal
                    component={componentDetailModal.component}
                    category={componentDetailModal.category}
                    onClose={() => {
                        setComponentDetailModal(null);
                        const categoria = CATEGORIAS.find(c => c.id === componentDetailModal.category);
                        if (categoria) {
                            setModalAberto(categoria);
                        }
                    }}
                    onSelect={(component) => {
                        handleSelectPeca(componentDetailModal.category, component.id);
                        setComponentDetailModal(null);
                        modalScrollRef.current = 0;
                    }}
                />
            )}

            <ComponentComparator 
                pecasDisponiveis={pecasFiltradas}
                onSelectComponent={handleSelectPeca}
            />
        </div>
    );
}

export default MontadorPage;
