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

    const getColorClass = (valor, valores, inverso = false) => {
        if (valores.length <= 1) return '';
        const valoresNumericos = valores.filter(v => v !== null && !isNaN(v));
        const max = Math.max(...valoresNumericos);
        const min = Math.min(...valoresNumericos);
        if (max === min) return '';
        const range = max - min;
        const threshold = range / 3;
        if (inverso) {
            if (valor <= min + threshold) return 'best-value';
            if (valor >= max - threshold) return 'worst-value';
            return 'mid-value';
        } else {
            if (valor >= max - threshold) return 'best-value';
            if (valor <= min + threshold) return 'worst-value';
            return 'mid-value';
        }
    };

    const calcularCustoBeneficio = useMemo(() => {
        if (selectedCategory !== 'cpu' && selectedCategory !== 'placaDeVideo') return null;
        return selectedComponents.map(component => {
            const preco = parseFloat(component.preco);
            const score = parseFloat(component.specs?.power_score || component.power_score);
            if (preco && score) {
                return {
                    id: component.id,
                    valor: (preco / score).toFixed(2),
                    nome: component.nome || `${component.marca} ${component.nome_chip || ''}`
                };
            }
            return null;
        }).filter(Boolean);
    }, [selectedComponents, selectedCategory]);

    const melhorCustoBeneficio = useMemo(() => {
        if (!calcularCustoBeneficio || calcularCustoBeneficio.length === 0) return null;
        return calcularCustoBeneficio.reduce((prev, current) => 
            parseFloat(current.valor) < parseFloat(prev.valor) ? current : prev
        );
    }, [calcularCustoBeneficio]);

    const getComponentDetails = (component, categoryId) => {
        const details = [];
        const s = component.specs || {};
        
        switch(categoryId) {
            case 'cpu':
                details.push({ label: 'Power Score', value: s.power_score, unidade: '/100', inverso: false, tipo: 'numero' });
                details.push({ label: 'Marca', value: component.marca, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Núcleos', value: s.nucleos, unidade: ' cores', inverso: false, tipo: 'numero' });
                details.push({ label: 'Clock Base', value: s.clock_base_ghz, unidade: ' GHz', inverso: false, tipo: 'numero' });
                details.push({ label: 'TDP', value: s.tdp_w, unidade: 'W', inverso: true, tipo: 'numero' });
                details.push({ label: 'Soquete', value: s.soquete, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Ano', value: s.ano_lancamento, unidade: '', inverso: false, tipo: 'numero' });
                break;
            case 'placaDeVideo':
                details.push({ label: 'Power Score', value: s.power_score, unidade: '/100', inverso: false, tipo: 'numero' });
                details.push({ label: 'Marca', value: component.marca, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'VRAM', value: s.vram_gb, unidade: 'GB', inverso: false, tipo: 'numero' });
                details.push({ label: 'Clock Boost', value: s.clock_boost_mhz, unidade: ' MHz', inverso: false, tipo: 'numero' });
                details.push({ label: 'TDP', value: s.tdp_w, unidade: 'W', inverso: true, tipo: 'numero' });
                details.push({ label: 'Ano', value: s.ano_lancamento, unidade: '', inverso: false, tipo: 'numero' });
                break;
            case 'memoria':
                details.push({ label: 'Tipo', value: s.tipo_ram || s.tipo, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Capacidade', value: s.capacidade_gb, unidade: 'GB', inverso: false, tipo: 'numero' });
                details.push({ label: 'Frequência', value: s.frequencia_mhz, unidade: ' MHz', inverso: false, tipo: 'numero' });
                details.push({ label: 'Latência', value: s.latencia_cas, unidade: '', inverso: true, tipo: 'numero' });
                break;
            case 'placaMae':
                details.push({ label: 'Plataforma', value: s.plataforma, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Soquete', value: s.soquete_cpu, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Formato', value: s.formato || s.fator_forma, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Slots RAM', value: s.slots_ram, unidade: '', inverso: false, tipo: 'numero' });
                break;
            case 'fonte':
                details.push({ label: 'Potência', value: s.potencia_w, unidade: 'W', inverso: false, tipo: 'numero' });
                details.push({ label: 'Certificação', value: s.certificacao, unidade: '', inverso: false, tipo: 'texto' });
                break;
            case 'armazenamento':
                details.push({ label: 'Tipo', value: s.tipo, unidade: '', inverso: false, tipo: 'texto' });
                details.push({ label: 'Capacidade', value: s.capacidade_gb || s.capacidade, unidade: '', inverso: false, tipo: 'texto' });
                break;
            case 'gabinete':
                details.push({ label: 'GPU Máxima', value: s.tamanho_max_gpu_mm, unidade: 'mm', inverso: false, tipo: 'numero' });
                details.push({ label: 'Cooler Máximo', value: s.altura_max_cooler_mm, unidade: 'mm', inverso: false, tipo: 'numero' });
                break;
            default: break;
        }
        details.push({ label: 'Preço', value: component.preco, unidade: '', inverso: true, tipo: 'preco' });
        return details;
    };

    const currentComponents = pecasDisponiveis[selectedCategory] || [];

    return (
        <div className="component-comparator">
            <button className="comparator-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                <FaExchangeAlt /> Comparador de Componentes
                {selectedComponents.length > 0 && <span className="comparison-count">{selectedComponents.length}</span>}
            </button>

            {isOpen && (
                <div className="comparator-modal">
                    <div className="comparator-content">
                        <div className="comparator-header">
                            <h3><FaExchangeAlt /> Comparador de Componentes</h3>
                            <button className="close-btn" onClick={() => setIsOpen(false)}><FaTimes /></button>
                        </div>

                        <div className="category-selector">
                            <label>Categoria:</label>
                            <select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)}>
                                {CATEGORIAS.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
                            </select>
                            {selectedComponents.length > 0 && (
                                <button className="clear-btn" onClick={handleClearComparison}>Limpar Seleção</button>
                            )}
                        </div>

                        {/* SEÇÃO 1: COMPARAÇÃO LADO A LADO */}
                        {selectedComponents.length > 0 && (
                            <div className="comparison-view">
                                {melhorCustoBeneficio && selectedComponents.length > 1 && (
                                    <div className="custo-beneficio-banner">
                                        <FaTrophy /> Melhor Custo-Benefício: <strong>{melhorCustoBeneficio.nome}</strong> 
                                        <span className="valor-cb"> (R$ {melhorCustoBeneficio.valor} por ponto)</span>
                                    </div>
                                )}

                                <div className="comparison-grid">
                                    {selectedComponents.map((component, index) => {
                                        const details = getComponentDetails(component, selectedCategory);
                                        return (
                                            <div key={component.id} className="comparison-column">
                                                <div className="comparison-header-card">
                                                    <button className="remove-component-btn" onClick={() => handleToggleComponent(component)}><FaTimes /></button>
                                                    <h4>
                                                        {selectedCategory === 'placaDeVideo'
                                                            ? `${component.marca} ${component.specs?.modelo_especifico || ''} ${component.specs?.nome_chip || ''}`
                                                            : component.nome
                                                        }
                                                    </h4>
                                                    {melhorCustoBeneficio && melhorCustoBeneficio.id === component.id && selectedComponents.length > 1 && (
                                                        <span className="badge-melhor"><FaTrophy /> Melhor C/B</span>
                                                    )}
                                                    {onSelectComponent && (
                                                        <button className="select-component-btn" onClick={() => { onSelectComponent(selectedCategory, component.id); setIsOpen(false); }}>
                                                            <FaCheckCircle /> Selecionar
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="comparison-details">
                                                    {details.map((detail, idx) => {
                                                        const valores = selectedComponents.map(comp => {
                                                            const d = getComponentDetails(comp, selectedCategory).find(x => x.label === detail.label);
                                                            return d ? parseFloat(d.value) : null;
                                                        }).filter(v => v !== null && !isNaN(v));
                                                        
                                                        const colorClass = detail.tipo !== 'texto' ? getColorClass(parseFloat(detail.value), valores, detail.inverso) : '';

                                                        return (
                                                            <div key={idx} className={`detail-row ${colorClass}`}>
                                                                <span className="detail-label">{detail.label}:</span>
                                                                <span className="detail-value">{detail.tipo === 'preco' ? `R$ ${detail.value}` : `${detail.value || 'N/A'}${detail.unidade}`}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* SEÇÃO 2: LISTA DE SELEÇÃO (MANTÉM A ROLAGEM) */}
                        <div className="component-selection">
                            <p className="selection-hint">
                                {selectedComponents.length < 4 
                                    ? "Adicione componentes para comparar (máx. 4):" 
                                    : "Limite de 4 componentes atingido."}
                            </p>
                            <div className="components-grid">
                                {currentComponents
                                    .filter(c => !selectedComponents.find(sc => sc.id === c.id))
                                    .map(component => {
                                        const score = component.specs?.power_score || component.power_score;
                                        return (
                                            <div key={component.id} className="component-item" onClick={() => handleToggleComponent(component)}>
                                                <div className="component-name">
                                                    {selectedCategory === 'placaDeVideo' 
                                                        ? `${component.marca} ${component.specs?.modelo_especifico || component.modelo_especifico || ''} ${component.specs?.nome_chip || component.nome_chip || ''}`
                                                        : component.nome}
                                                </div>
                                                <div className="component-price">R$ {component.preco}</div>
                                                {(selectedCategory === 'cpu' || selectedCategory === 'placaDeVideo') && score && (
                                                    <div className="component-score"><FaStar /> {score}/100</div>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComponentComparator;