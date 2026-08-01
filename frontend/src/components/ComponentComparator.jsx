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

    const handleClearComparison = () => setSelectedComponents([]);

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        setSelectedComponents([]);
    };

    // Identifica o melhor C/B entre os selecionados usando o dado do Banco
    const melhorCustoBeneficio = useMemo(() => {
        if (selectedComponents.length < 2) return null;
        const compsComCB = selectedComponents.filter(c => c.specs?.cb_score);
        if (compsComCB.length === 0) return null;

        return compsComCB.reduce((prev, current) => 
            parseFloat(current.specs.cb_score) > parseFloat(prev.specs.cb_score) ? current : prev
        );
    }, [selectedComponents]);

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

    const getComponentDetails = (component, categoryId) => {
        const details = [];
        const s = component.specs || {};
        
        // Adiciona Custo-Benefício no topo se existir
        if (s.cb_score) {
            details.push({ label: 'CB Score', value: s.cb_score, unidade: ' pts', inverso: false, tipo: 'numero' });
        }

        switch(categoryId) {
            case 'cpu':
                details.push({ label: 'Power Score', value: s.power_score, unidade: '/100', inverso: false, tipo: 'numero' });
                details.push({ label: 'Núcleos', value: s.nucleos, unidade: ' cores', inverso: false, tipo: 'numero' });
                details.push({ label: 'Clock Base', value: s.clock_base_ghz, unidade: ' GHz', inverso: false, tipo: 'numero' });
                details.push({ label: 'TDP', value: s.tdp_w, unidade: 'W', inverso: true, tipo: 'numero' });
                details.push({ label: 'Soquete', value: s.soquete, unidade: '', inverso: false, tipo: 'texto' });
                break;
            case 'placaDeVideo':
                details.push({ label: 'Power Score', value: s.power_score, unidade: '/100', inverso: false, tipo: 'numero' });
                details.push({ label: 'VRAM', value: s.vram_gb, unidade: 'GB', inverso: false, tipo: 'numero' });
                details.push({ label: 'Clock Boost', value: s.clock_boost_mhz, unidade: ' MHz', inverso: false, tipo: 'numero' });
                details.push({ label: 'TDP', value: s.tdp_w, unidade: 'W', inverso: true, tipo: 'numero' });
                break;
            // ... outras categorias mantêm o padrão
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

                        {selectedComponents.length > 0 && (
                            <div className="comparison-view">
                                {melhorCustoBeneficio && selectedComponents.length > 1 && (
                                    <div className="custo-beneficio-banner">
                                        <FaTrophy /> Recomendação: <strong>{melhorCustoBeneficio.nome}</strong> 
                                        <span className="valor-cb"> (CB Score: {melhorCustoBeneficio.specs.cb_score})</span>
                                    </div>
                                )}

                                <div className="comparison-grid">
                                    {selectedComponents.map((component) => {
                                        const details = getComponentDetails(component, selectedCategory);
                                        const cbScore = component.specs?.cb_score || 0;
                                        return (
                                            <div key={component.id} className="comparison-column">
                                                <div className="comparison-header-card">
                                                    <button className="remove-component-btn" onClick={() => handleToggleComponent(component)}><FaTimes /></button>
                                                    <h4>{component.nome}</h4>
                                                    
                                                    {cbScore >= 35 && (
                                                        <span className="badge-cb-premium"><FaStar /> Bom C/B</span>
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
                        {/* Lista de seleção inferior */}
                        <div className="component-selection">
                            <div className="components-grid">
                                {currentComponents
                                    .filter(c => !selectedComponents.find(sc => sc.id === c.id))
                                    .map(component => (
                                        <div key={component.id} className="component-item" onClick={() => handleToggleComponent(component)}>
                                            <div className="component-name">{component.nome}</div>
                                            <div className="component-price">R$ {component.preco}</div>
                                            {component.specs?.cb_score >= 35 && <span className="mini-badge-cb">💎 C/B</span>}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComponentComparator;