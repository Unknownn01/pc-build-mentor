// ARQUIVO: frontend/src/components/ComponentComparator.jsx
import React, { useState, useMemo } from 'react';
import { FaExchangeAlt, FaTimes, FaStar, FaCheckCircle, FaTrophy } from 'react-icons/fa';
import './ComponentComparator.css';

const ComponentComparator = ({ pecasDisponiveis, onSelectComponent }) => {
    const [selectedCategory, setSelectedCategory] = useState('cpu');
    const [selectedComponents, setSelectedComponents] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const CATEGORIAS = [
        { id: 'cpu', nome: 'CPU' },
        { id: 'placaDeVideo', nome: 'Placa de Vídeo' },
        { id: 'memoria', nome: 'Memória RAM' },
        { id: 'placaMae', nome: 'Placa-mãe' },
        { id: 'armazenamento', nome: 'Armazenamento' },
        { id: 'fonte', nome: 'Fonte' },
        { id: 'cooler', nome: 'Cooler' },
        { id: 'gabinete', nome: 'Gabinete' },
    ];

    const handleToggleComponent = (component) => {
        if (selectedComponents.find(c => c.id === component.id)) {
            setSelectedComponents(selectedComponents.filter(c => c.id !== component.id));
        } else {
            if (selectedComponents.length < 4) {
                setSelectedComponents([...selectedComponents, component]);
            } else {
                alert('Você pode comparar no máximo 4 componentes por vez');
            }
        }
    };

    const handleClearComparison = () => {
        setSelectedComponents([]);
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        setSelectedComponents([]);
    };

    // Função para determinar a cor baseada no ranking (melhor = verde, pior = vermelho)
    const getColorClass = (valor, valores, inverso = false) => {
        if (valores.length <= 1) return '';
        
        const valoresNumericos = valores.filter(v => v !== null && v !== undefined && !isNaN(v));
        if (valoresNumericos.length === 0) return '';
        
        const max = Math.max(...valoresNumericos);
        const min = Math.min(...valoresNumericos);
        
        if (max === min) return '';
        
        const range = max - min;
        const threshold = range / 3;
        
        if (inverso) {
            // Para valores onde menor é melhor (ex: preço, TDP)
            if (valor <= min + threshold) return 'best-value';
            if (valor >= max - threshold) return 'worst-value';
            return 'mid-value';
        } else {
            // Para valores onde maior é melhor (ex: núcleos, clock, power score
            if (valor >= max - threshold) return 'best-value';
            if (valor <= min + threshold) return 'worst-value';
            return 'mid-value';
        }
    };

    // Calcular custo-benefício (menor é melhor)
    const calcularCustoBeneficio = useMemo(() => {
        if (selectedCategory !== 'cpu' && selectedCategory !== 'placaDeVideo') return null;
        
        return selectedComponents.map(component => {
            const preco = parseFloat(component.preco_simulado);
            const score = parseFloat(component.power_score);
            if (preco && score) {
                return {
                    id: component.id,
                    valor: (preco / score).toFixed(2),
                    nome: component.nome
                };
            }
            return null;
        }).filter(Boolean);
    }, [selectedComponents, selectedCategory]);

    // Encontrar a melhor relação custo-benefício
    const melhorCustoBeneficio = useMemo(() => {
        if (!calcularCustoBeneficio || calcularCustoBeneficio.length === 0) return null;
        return calcularCustoBeneficio.reduce((prev, current) => 
            parseFloat(current.valor) < parseFloat(prev.valor) ? current : prev
        );
    }, [calcularCustoBeneficio]);

    const getComponentDetails = (component, categoryId) => {
        const details = [];
        
        switch(categoryId) {
            case 'cpu':
                details.push({ label: 'Power Score', value: component.power_score, unidade: '/100', inverso: false, tipo: 'numero' });
                details.push({ label: 'Marca', value: component.marca, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Núcleos', value: component.nucleos, unidade: ' cores', inverso: false, tipo: 'numero' });
                details.push({ label: 'Clock Base', value: component.clock_base_ghz, unidade: ' GHz', inverso: false, tipo: 'numero' });
                details.push({ label: 'TDP', value: component.tdp_w, unidade: 'W', inverso: true, tipo: 'numero' });
                details.push({ label: 'Soquete', value: component.soquete, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Ano', value: component.ano_lancamento, unidade: '', inverso: false, tipo: 'numero' });
                break;
            case 'placaDeVideo':
                details.push({ label: 'Power Score', value: component.power_score, unidade: '/100', inverso: false, tipo: 'numero' });
                details.push({ label: 'Marca', value: component.marca, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'VRAM', value: component.vram_gb, unidade: 'GB', inverso: false, tipo: 'numero' });
                details.push({ label: 'Clock Boost', value: component.clock_boost_mhz, unidade: ' MHz', inverso: false, tipo: 'numero' });
                details.push({ label: 'TDP', value: component.tdp_w, unidade: 'W', inverso: true, tipo: 'numero' });
                details.push({ label: 'Ano', value: component.ano_lancamento, unidade: '', inverso: false, tipo: 'numero' });
                break;
            case 'memoria':
                details.push({ label: 'Tipo', value: component.tipo, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Capacidade', value: component.capacidade_gb, unidade: 'GB', inverso: false, tipo: 'numero' });
                details.push({ label: 'Frequência', value: component.frequencia_mhz, unidade: ' MHz', inverso: false, tipo: 'numero' });
                details.push({ label: 'Módulos', value: component.modulos, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Latência', value: component.latencia_cas, unidade: '', inverso: true, tipo: 'numero' });
                break;
            case 'placaMae':
                details.push({ label: 'Plataforma', value: component.plataforma, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Soquete', value: component.soquete_cpu, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Tipo RAM', value: component.tipo_ram, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Formato', value: component.formato, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Slots RAM', value: component.slots_ram, unidade: '', inverso: false, tipo: 'numero' });
                details.push({ label: 'Slots M.2', value: component.slots_m2, unidade: '', inverso: false, tipo: 'numero' });
                details.push({ label: 'Slots PCIe', value: component.slots_pcie, unidade: '', inverso: false, tipo: 'numero' });
                break;
            case 'armazenamento':
                details.push({ label: 'Tipo', value: component.tipo, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Capacidade', value: component.capacidade, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Velocidade Leitura', value: component.velocidade_leitura, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Velocidade Escrita', value: component.velocidade_escrita, unidade: '', inverso: false, tipo: 'texto' });
                break;
            case 'fonte':
                details.push({ label: 'Potência', value: component.potencia_w, unidade: 'W', inverso: false, tipo: 'numero' });
                details.push({ label: 'Certificação', value: component.certificacao, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Modular', value: component.modular, unidade: '', inverso: false, tipo: 'texto' });
                break;
            case 'cooler':
                details.push({ label: 'Tipo', value: component.tipo, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Soquetes', value: component.soquetes_suportados, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Altura', value: component.altura_mm, unidade: 'mm', inverso: true, tipo: 'numero' });
                if (component.tamanho_radiador_mm) {
                    details.push({ label: 'Radiador', value: component.tamanho_radiador_mm, unidade: '', inverso: false, tipo: 'texto' });
                }
                break;
            case 'gabinete':
                details.push({ label: 'Tipo', value: component.tipo, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Formatos Suportados', value: component.formatos_placa_mae_suportados, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'GPU Máxima', value: component.tamanho_max_gpu_mm, unidade: 'mm', inverso: false, tipo: 'numero' });
                details.push({ label: 'Cooler Máximo', value: component.altura_max_cooler_mm, unidade: 'mm', inverso: false, tipo: 'numero' });
                break;
            default:
                break;
        }
        
        details.push({ label: 'Preço', value: component.preco_simulado, unidade: '', inverso: true, tipo: 'preco' });
        return details;
    };

    const currentComponents = pecasDisponiveis[selectedCategory] || [];

    return (
        <div className="component-comparator">
            <button 
                className="comparator-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                <FaExchangeAlt /> Comparador de Componentes
                {selectedComponents.length > 0 && (
                    <span className="comparison-count">{selectedComponents.length}</span>
                )}
            </button>

            {isOpen && (
                <div className="comparator-modal">
                    <div className="comparator-content">
                        <div className="comparator-header">
                            <h3><FaExchangeAlt /> Comparador de Componentes</h3>
                            <button className="close-btn" onClick={() => setIsOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="category-selector">
                            <label>Categoria:</label>
                            <select 
                                value={selectedCategory} 
                                onChange={(e) => handleCategoryChange(e.target.value)}
                            >
                                {CATEGORIAS.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                ))}
                            </select>
                            {selectedComponents.length > 0 && (
                                <button className="clear-btn" onClick={handleClearComparison}>
                                    Limpar Seleção
                                </button>
                            )}
                        </div>

                        {selectedComponents.length === 0 ? (
                            <div className="component-selection">
                                <p className="selection-hint">
                                    Selecione até 4 componentes para comparar:
                                </p>
                                <div className="components-grid">
                                    {currentComponents.map(component => (
                                        <div 
                                            key={component.id} 
                                            className="component-item"
                                            onClick={() => handleToggleComponent(component)}
                                        >
                                            <div className="component-name">
                                                {selectedCategory === 'placaDeVideo'
                                                    ? `${component.marca} ${component.modelo_especifico} ${component.nome_chip}`
                                                    : component.nome
                                                }
                                                </div>
                                            <div className="component-price">R$ {component.preco_simulado}</div>
                                            {(selectedCategory === 'cpu' || selectedCategory === 'placaDeVideo') && (
                                                <div className="component-score">
                                                    <FaStar /> {component.power_score}/100
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="comparison-view">
                                {melhorCustoBeneficio && (
                                    <div className="custo-beneficio-banner">
                                        <FaTrophy /> Melhor Custo-Benefício: <strong>{melhorCustoBeneficio.nome}</strong> 
                                        <span className="valor-cb">(R$ {melhorCustoBeneficio.valor} por ponto de desempenho)</span>
                                    </div>
                                )}

                                <div className="comparison-grid">
                                    {selectedComponents.map((component, index) => {
                                        const details = getComponentDetails(component, selectedCategory);
                                        
                                        return (
                                            <div key={component.id} className="comparison-column">
                                                <div className="comparison-header-card">
                                                    <button 
                                                        className="remove-component-btn"
                                                        onClick={() => handleToggleComponent(component)}
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                    <h4>
                                                        {selectedCategory === 'placaDeVideo'
                                                            ? `${component.marca} ${component.modelo_especifico} ${component.nome_chip}`
                                                            : component.nome
                                                        }
                                                        </h4>
                                                    {melhorCustoBeneficio && melhorCustoBeneficio.id === component.id && (
                                                        <span className="badge-melhor"><FaTrophy /> Melhor C/B</span>
                                                    )}
                                                    {onSelectComponent && (
                                                        <button 
                                                            className="select-component-btn"
                                                            onClick={() => {
                                                                onSelectComponent(selectedCategory, component.id);
                                                                setIsOpen(false);
                                                            }}
                                                        >
                                                            <FaCheckCircle /> Selecionar
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="comparison-details">
                                                    {details.map((detail, idx) => {
                                                        // Coletar todos os valores para este atributo
                                                        const valores = selectedComponents.map(comp => {
                                                            const compDetails = getComponentDetails(comp, selectedCategory);
                                                            const compDetail = compDetails.find(d => d.label === detail.label);
                                                            return compDetail && (compDetail.tipo === 'numero' || compDetail.tipo === 'preco') 
                                                                ? parseFloat(compDetail.value) 
                                                                : null;
                                                        }).filter(v => v !== null && !isNaN(v));

                                                        const valorNumerico = (detail.tipo === 'numero' || detail.tipo === 'preco') 
                                                            ? parseFloat(detail.value) 
                                                            : null;
                                                        
                                                        const colorClass = valorNumerico !== null 
                                                            ? getColorClass(valorNumerico, valores, detail.inverso) 
                                                            : '';

                                                        // Calcular diferença de preço
                                                        let diferencaPreco = null;
                                                        if (detail.tipo === 'preco' && index > 0) {
                                                            const precoBase = parseFloat(selectedComponents[0].preco_simulado);
                                                            const precoAtual = parseFloat(detail.value);
                                                            const diff = precoAtual - precoBase;
                                                            const diffPerc = ((diff / precoBase) * 100).toFixed(1);
                                                            diferencaPreco = {
                                                                valor: diff,
                                                                percentual: diffPerc
                                                            };
                                                        }

                                                        return (
                                                            <div 
                                                                key={idx} 
                                                                className={`detail-row ${colorClass}`}
                                                            >
                                                                <span className="detail-label">{detail.label}:</span>
                                                                <div className="detail-value-container">
                                                                    {detail.tipo === 'preco' ? (
                                                                        <>
                                                                            <span className="detail-value">R$ {detail.value}</span>
                                                                            {diferencaPreco && (
                                                                                <span className={`diferenca-preco ${diferencaPreco.valor > 0 ? 'mais-caro' : 'mais-barato'}`}>
                                                                                    {diferencaPreco.valor > 0 ? '+' : ''}{diferencaPreco.percentual}%
                                                                                </span>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <span className="detail-value">{detail.value}{detail.unidade}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                <div className="add-more-section">
                                    {selectedComponents.length < 4 && (
                                        <div className="add-more-components">
                                            <p>Adicionar mais componentes para comparar:</p>
                                            <div className="components-mini-grid">
                                                {currentComponents
                                                    .filter(c => !selectedComponents.find(sc => sc.id === c.id))
                                                    .map(component => (
                                                        <div 
                                                            key={component.id} 
                                                            className="component-mini-item"
                                                            onClick={() => handleToggleComponent(component)}
                                                        >
                                                            <div className="mini-name">
                                                                {selectedCategory === 'placaDeVideo'
                                                                    ? `${component.marca} ${component.modelo_especifico} ${component.nome_chip}`
                                                                    : component.nome
                                                                }
                                                                </div>
                                                            <div className="mini-price">R$ {component.preco_simulado}</div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComponentComparator;