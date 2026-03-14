import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './StockManager.css';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaBox } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

function StockManager() {
    const [components, setComponents] = useState([]);
    const [filterCategory, setFilterCategory] = useState('todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    const [formData, setFormData] = useState({
        nome: '', preco: '', categoria: 'processador', imagem_url: '', marca: '', specs: {}
    });

    const fetchComponents = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/pecas/todas`);
            setComponents(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchComponents(); }, []);

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingId(item.id);
            setFormData({ 
                nome: item.nome, 
                preco: item.preco, 
                categoria: item.categoria, 
                imagem_url: item.imagem_url, 
                marca: item.marca || '', 
                specs: item.specs || {} 
            });
        } else {
            setEditingId(null);
            setFormData({ nome: '', preco: '', categoria: 'processador', imagem_url: '', marca: '', specs: {} });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // Criamos uma cópia dos dados para tratar os tipos
            const payload = {
                ...formData,
                preco: parseFloat(formData.preco), // Força o preço a ser número
                // Tratamos os campos dentro das specs que o banco espera como número
                specs: {
                    ...formData.specs,
                    nucleos: parseInt(formData.specs.nucleos) || 0,
                    tdp_w: parseInt(formData.specs.tdp_w) || 0,
                    power_score: parseInt(formData.specs.power_score) || 0,
                    // Adicione outros campos numéricos conforme seu banco exigir
                }
            };
    
            if (editingId) {
                await axios.put(`${API_BASE_URL}/api/admin/components/${editingId}`, payload);
            } else {
                await axios.post(`${API_BASE_URL}/api/admin/components`, payload);
            }
            
            setIsModalOpen(false);
            fetchComponents();
            toast.success("Peça salva com sucesso!"); // Substituiu alert
        } catch (err) {
            console.error("Erro detalhado:", err.response?.data); // Isso ajuda a ver o erro real no F12
            toast.error("Erro ao salvar. Verifique os campos."); // Substituiu alert
        }
    };
    const handleDelete = async (id) => {
        // 1. Confirmação de segurança (padrão em sistemas profissionais)
        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: "Essa ação não pode ser desfeita!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar',
            background: '#161B22',
            color: '#fff'
        });
    
        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_BASE_URL}/api/admin/components/${id}`);
                toast.success("Peça removida com sucesso!");
                fetchComponents();
            } catch (err) {
                console.error("Erro ao deletar:", err);
                const errMsg = err.response?.data?.error || "Erro ao excluir a peça.";
                toast.error(errMsg);
            }
        }
    };

    const updateSpec = (key, val) => setFormData({ ...formData, specs: { ...formData.specs, [key]: val } });

    // RENDERIZAÇÃO DINÂMICA DE SPECS (Baseado no seu Banco de Dados)
    const renderDynamicSpecs = () => {
        const categories = {
            processador: [
                { k: 'soquete', l: 'Soquete (AM4, LGA1700...)' }, { k: 'nucleos', l: 'Núcleos', t: 'number' },
                { k: 'clock_base_ghz', l: 'Clock Base (GHz)' }, { k: 'tdp_w', l: 'TDP (W)', t: 'number' },
                { k: 'power_score', l: 'Power Score (0-100)', t: 'number' }, { k: 'ano_lancamento', l: 'Ano' }
            ],
            placa_video: [
                { k: 'chipset', l: 'Chipset (NVIDIA/AMD)' }, { k: 'vram_gb', l: 'VRAM (GB)', t: 'number' },
                { k: 'tdp_w', l: 'TDP (W)', t: 'number' }, { k: 'power_score', l: 'Power Score', t: 'number' },
                { k: 'clock_boost_mhz', l: 'Clock Boost (MHz)' }, { k: 'modelo_especifico', l: 'Linha (ROG, TUF...)' }
            ],
            placa_mae: [
                { k: 'plataforma', l: 'Plataforma (AMD/Intel)' }, { k: 'soquete_cpu', l: 'Soquete' },
                { k: 'formato', l: 'Formato (ATX, Micro-ATX)' }, { k: 'tipo_ram', l: 'Tipo RAM (DDR4/DDR5)' },
                { k: 'slots_ram', l: 'Qtd Slots RAM', t: 'number' }, { k: 'dissipacao_vrm', l: 'VRM (Reforçado...)' }
            ],
            memoria_ram: [
                { k: 'tipo', l: 'DDR4 ou DDR5' }, { k: 'capacidade_gb', l: 'Capacidade Total (GB)', t: 'number' },
                { k: 'modulos', l: 'Qtd Módulos (1, 2...)', t: 'number' }, { k: 'frequencia_mhz', l: 'Frequência (MHz)', t: 'number' }
            ],
            armazenamento: [
                { k: 'tipo', l: 'Tipo (SSD NVMe, SATA, HDD)' }, { k: 'capacidade_gb', l: 'Capacidade (GB)', t: 'number' }
            ],
            fonte: [
                { k: 'formato', l: 'Padrão (ATX, SFX)' }, { k: 'potencia_w', l: 'Watts', t: 'number' },
                { k: 'certificacao', l: 'Selo (80 Plus Gold...)' }
            ],
            gabinete: [
                { k: 'formato', l: 'Tipo (Mid Tower, Full)' }, { k: 'formatos_placa_mae_suportados', l: 'Placas Suportadas' },
                { k: 'max_gpu_length_mm', l: 'Tam. Máx GPU (mm)', t: 'number' }
            ],
            refrigeracao: [
                { k: 'tipo', l: 'Air ou Water Cooler' }, { k: 'tamanho_radiador_mm', l: 'Radiador (120, 240, N/A)' },
                { k: 'altura_mm', l: 'Altura (p/ Air Cooler)', t: 'number' }, { k: 'soquetes_suportados', l: 'Soquetes' }
            ]
        };

                // No renderDynamicSpecs
        return categories[formData.categoria]?.map(f => (
            <div key={f.k} className="input-field">
                <label>{f.l}</label>
                <input 
                    type={f.t || 'text'} 
                    value={formData.specs[f.k] || ''} 
                    onChange={e => updateSpec(f.k, e.target.value)} 
                />
            </div>
        ));
    };

    const filtered = filterCategory === 'todos' ? components : components.filter(c => c.categoria === filterCategory);

    return (
        <div className="stock-manager-container">
            <div className="stock-header-actions">
                <h1>📦 Gerenciador de Inventário</h1>
                <div className="header-controls">
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="cat-filter">
                        <option value="todos">Todas as Peças</option>
                        <option value="processador">Processadores</option>
                        <option value="placa_video">Placas de Vídeo</option>
                        <option value="placa_mae">Placas-mãe</option>
                        <option value="memoria_ram">RAM</option>
                        <option value="armazenamento">Armazenamento</option>
                        <option value="fonte">Fontes</option>
                        <option value="gabinete">Gabinetes</option>
                        <option value="refrigeracao">Refrigeração</option>
                    </select>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        <FaPlus /> Novo Componente
                    </button>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr><th>ID</th><th>Peça</th><th>Categoria</th><th>Preço</th><th>Ações</th></tr>
                    </thead>
                    <tbody>
                        {filtered.map(item => (
                            <tr key={item.id}>
                                <td>#{item.id}</td>
                                <td>{item.nome}</td>
                                <td><span className="badge-cat">{item.categoria.replace('_', ' ')}</span></td>
                                <td>R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td>
                                    <button className="btn-action edit" onClick={() => handleOpenModal(item)}><FaEdit /></button>
                                    {/* O botão deve ficar exatamente assim */}
                                    <button 
                                        className="btn-action delete" 
                                        onClick={() => handleDelete(item.id)} // Passando o ID da peça atual
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h2>{editingId ? 'Editar Peça' : 'Cadastrar Peça'}</h2>
                            <button className="close-x" onClick={() => setIsModalOpen(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleSave} className="modal-form">
                            <div className="form-section">
                                <h3>Geral</h3>
                                <div className="grid-inputs">
                                    <input placeholder="Nome Comercial" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required />
                                    <input placeholder="Preço" type="number" step="0.01" value={formData.preco} onChange={e => setFormData({...formData, preco: e.target.value})} required />
                                    <select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value, specs: {} })}>
                                        <option value="processador">Processador</option>
                                        <option value="placa_video">Placa de Vídeo</option>
                                        <option value="placa_mae">Placa-mãe</option>
                                        <option value="memoria_ram">RAM</option>
                                        <option value="armazenamento">Armazenamento</option>
                                        <option value="fonte">Fonte</option>
                                        <option value="gabinete">Gabinete</option>
                                        <option value="refrigeracao">Refrigeração</option>
                                    </select>
                                    <input placeholder="Marca" value={formData.marca} onChange={e => setFormData({...formData, marca: e.target.value})} />
                                    <input placeholder="Caminho da Imagem (Ex: imagens_fontes/foto.jpg)" value={formData.imagem_url} onChange={e => setFormData({...formData, imagem_url: e.target.value})} />
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Especificações (JSON)</h3>
                                <div className="grid-specs">
                                    {renderDynamicSpecs()}
                                </div>
                            </div>
                            <button type="submit" className="btn-submit-full">{editingId ? 'Salvar Alterações' : 'Criar Componente'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StockManager;