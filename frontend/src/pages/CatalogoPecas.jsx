import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config.js';
import ComponentDetailModal from '../components/ComponentDetailModal.jsx';
import ComponentComparator from '../components/ComponentComparator.jsx';
import './CatalogoPecas.css';

const CatalogoPecas = () => {
  const [todasPecas, setTodasPecas] = useState([]);
  const [pecasFiltradas, setPecasFiltradas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal
  const [pecaSelecionada, setPecaSelecionada] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  
  // Filtros
  const [tipoSelecionado, setTipoSelecionado] = useState('todos');
  const [filtrosEspecificos, setFiltrosEspecificos] = useState({});

  // Opções de filtros específicos por tipo
  const [opcoesDisponiveis, setOpcoesDisponiveis] = useState({});

  useEffect(() => {
    const fetchPecas = async () => {
      setIsLoading(true);
      try {
        // Dentro do useEffect em CatalogoPecas.jsx

    const response = await axios.get(`${API_BASE_URL}/api/pecas/todas`);

    const dadosFormatados = response.data.map(item => {
        // 1. TRADUÇÃO: Arruma o nome da categoria (Fonte 0 -> Fonte OK)
        let categoriaAjustada = item.categoria;
        
        // O banco manda 'fonte_alimentacao', mas o site quer 'fonte'
        if (item.categoria === 'fonte_alimentacao') categoriaAjustada = 'fonte';
        

        // 2. MÁGICA: Retorna o objeto combinado
        return {
            ...item,                      // Mantém id, nome, preco, imagem, e o objeto specs original
            ...item.specs,                // EXPLODE o specs para a raiz (Isso faz seus filtros funcionarem!)
            categoria: categoriaAjustada, // Salva o nome corrigido
            tipo: categoriaAjustada       // Atualiza o 'tipo' para os filtros acharem a fonte
        };
      });

      setTodasPecas(dadosFormatados);
      setPecasFiltradas(dadosFormatados);
      extrairOpcoesDisponiveis(dadosFormatados);
      } catch (error) {
        console.error('Erro ao carregar peças:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPecas();
  }, []);

  // Extrai opções únicas para cada filtro
  const extrairOpcoesDisponiveis = (pecas) => {
    const opcoes = {};
    
    // Processadores
    const processadores = pecas.filter(p => p.tipo === 'processador');
    opcoes.processador = {
      marca: [...new Set(processadores.map(p => p.marca).filter(Boolean))],
      soquete: [...new Set(processadores.map(p => p.soquete).filter(Boolean))],
      nucleos: [...new Set(processadores.map(p => p.nucleos).filter(Boolean))].sort((a, b) => a - b),
      tdp_w: [...new Set(processadores.map(p => p.tdp_w).filter(Boolean))].sort((a, b) => a - b)
    };

    // Placas-mãe
    const placasMae = pecas.filter(p => p.tipo === 'placa_mae');
    opcoes.placa_mae = {
      soquete_cpu: [...new Set(placasMae.map(p => p.soquete_cpu).filter(Boolean))],
      tipo_ram: [...new Set(placasMae.map(p => p.tipo_ram).filter(Boolean))],
      formato: [...new Set(placasMae.map(p => p.formato).filter(Boolean))],
      plataforma: [...new Set(placasMae.map(p => p.plataforma).filter(Boolean))]
    };

    // Memórias RAM
    const memorias = pecas.filter(p => p.tipo === 'memoria_ram');
    opcoes.memoria_ram = {
      tipo: [...new Set(memorias.map(p => p.tipo).filter(Boolean))],
      capacidade_gb: [...new Set(memorias.map(p => p.capacidade_gb).filter(Boolean))].sort((a, b) => a - b),
      frequencia_mhz: [...new Set(memorias.map(p => p.frequencia_mhz).filter(Boolean))].sort((a, b) => a - b)
    };

    // Placas de vídeo
    const placasVideo = pecas.filter(p => p.tipo === 'placa_video');
    opcoes.placa_video = {
      marca: [...new Set(placasVideo.map(p => p.marca).filter(Boolean))],
      vram_gb: [...new Set(placasVideo.map(p => p.vram_gb).filter(Boolean))].sort((a, b) => a - b),
      tdp_w: [...new Set(placasVideo.map(p => p.tdp_w).filter(Boolean))].sort((a, b) => a - b)
    };

    // Fontes
    const fontes = pecas.filter(p => p.tipo === 'fonte');
    opcoes.fonte = {
      potencia_w: [...new Set(fontes.map(p => p.potencia_w).filter(Boolean))].sort((a, b) => a - b),
      certificacao: [...new Set(fontes.map(p => p.certificacao).filter(Boolean))],
      formato: [...new Set(fontes.map(p => p.formato).filter(Boolean))]
    };

    // Gabinetes
    const gabinetes = pecas.filter(p => p.tipo === 'gabinete');
    opcoes.gabinete = {
      formato: [...new Set(gabinetes.map(p => p.formato).filter(Boolean))],
      formatos_placa_mae_suportados: [...new Set(gabinetes.map(p => p.formatos_placa_mae_suportados).filter(Boolean))]
    };

    // Armazenamento
    const armazenamento = pecas.filter(p => p.tipo === 'armazenamento');
    opcoes.armazenamento = {
      tipo: [...new Set(armazenamento.map(p => p.tipo).filter(Boolean))],
      capacidade_gb: [...new Set(armazenamento.map(p => p.capacidade_gb).filter(Boolean))].sort((a, b) => a - b)
    };

    // Refrigeração
    const refrigeracao = pecas.filter(p => p.tipo === 'refrigeracao');
    opcoes.refrigeracao = {
      tipo: [...new Set(refrigeracao.map(p => p.tipo).filter(Boolean))],
      soquetes_suportados: [...new Set(refrigeracao.flatMap(p => 
        p.soquetes_suportados ? p.soquetes_suportados.split(',').map(s => s.trim()) : []
      ))]
    };

    setOpcoesDisponiveis(opcoes);
  };

  // Aplicar filtros
  useEffect(() => {
    let resultado = [...todasPecas];

    // Filtrar por tipo
    if (tipoSelecionado !== 'todos') {
      resultado = resultado.filter(p => p.tipo === tipoSelecionado);
    }

    // Aplicar filtros específicos
    Object.keys(filtrosEspecificos).forEach(chave => {
      const valor = filtrosEspecificos[chave];
      if (valor && valor !== 'todos') {
        resultado = resultado.filter(p => {
          // Para campos numéricos, converter para string para comparação
          const valorPeca = String(p[chave]);
          return valorPeca === String(valor);
        });
      }
    });

    setPecasFiltradas(resultado);
  }, [tipoSelecionado, filtrosEspecificos, todasPecas]);

  const handleTipoChange = (tipo) => {
    setTipoSelecionado(tipo);
    setFiltrosEspecificos({}); // Limpar filtros específicos ao mudar o tipo
  };

  const handleFiltroEspecificoChange = (chave, valor) => {
    setFiltrosEspecificos(prev => ({
      ...prev,
      [chave]: valor
    }));
  };

  const limparFiltros = () => {
    setTipoSelecionado('todos');
    setFiltrosEspecificos({});
  };

  const abrirModal = (peca) => {
    setPecaSelecionada(peca);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setPecaSelecionada(null);
  };

  const renderFiltrosEspecificos = () => {
    if (tipoSelecionado === 'todos' || !opcoesDisponiveis[tipoSelecionado]) {
      return null;
    }

    const opcoes = opcoesDisponiveis[tipoSelecionado];
    const traduzirChave = (chave) => {
      const traducoes = {
        marca: 'Marca',
        soquete: 'Soquete',
        nucleos: 'Núcleos',
        tdp_w: 'TDP (W)',
        soquete_cpu: 'Soquete CPU',
        tipo_ram: 'Tipo RAM',
        formato: 'Formato',
        plataforma: 'Plataforma',
        tipo: 'Tipo',
        capacidade_gb: 'Capacidade (GB)',
        frequencia_mhz: 'Frequência (MHz)',
        vram_gb: 'VRAM (GB)',
        potencia_w: 'Potência (W)',
        certificacao: 'Certificação',
        formatos_placa_mae_suportados: 'Formatos Placa-mãe',
        soquetes_suportados: 'Soquetes Suportados'
      };
      return traducoes[chave] || chave;
    };

    return (
      <div className="filtros-especificos">
        <h3>Filtros Específicos</h3>
        <div className="filtros-grid">
          {Object.keys(opcoes).map(chave => (
            <div key={chave} className="filtro-item">
              <label>{traduzirChave(chave)}:</label>
              <select
                value={filtrosEspecificos[chave] || 'todos'}
                onChange={(e) => handleFiltroEspecificoChange(chave, e.target.value)}
              >
                <option value="todos">Todos</option>
                {opcoes[chave].map(opcao => (
                  <option key={opcao} value={opcao}>
                    {opcao}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const traduzirTipo = (tipo) => {
    const traducoes = {
      processador: 'Processador',
      placa_mae: 'Placa-mãe',
      memoria_ram: 'Memória RAM',
      placa_video: 'Placa de Vídeo',
      fonte: 'Fonte de Alimentação',
      gabinete: 'Gabinete',
      armazenamento: 'Armazenamento',
      refrigeracao: 'Refrigeração'
    };
    return traducoes[tipo] || tipo;
  };

  if (isLoading) {
    return <div className="loading">Carregando catálogo...</div>;
  }

  return (
    <div className="catalogo-container">
      <h1>Catálogo de Peças</h1>
      
      <div className="filtros-container">
        <div className="filtro-tipo">
          <h3>Tipo de Componente</h3>
          <div className="tipo-buttons">
            <button
              className={tipoSelecionado === 'todos' ? 'active' : ''}
              onClick={() => handleTipoChange('todos')}
            >
              Todos ({todasPecas.length})
            </button>
            <button
              className={tipoSelecionado === 'processador' ? 'active' : ''}
              onClick={() => handleTipoChange('processador')}
            >
              Processadores ({todasPecas.filter(p => p.tipo === 'processador').length})
            </button>
            <button
              className={tipoSelecionado === 'placa_mae' ? 'active' : ''}
              onClick={() => handleTipoChange('placa_mae')}
            >
              Placas-mãe ({todasPecas.filter(p => p.tipo === 'placa_mae').length})
            </button>
            <button
              className={tipoSelecionado === 'memoria_ram' ? 'active' : ''}
              onClick={() => handleTipoChange('memoria_ram')}
            >
              Memórias RAM ({todasPecas.filter(p => p.tipo === 'memoria_ram').length})
            </button>
            <button
              className={tipoSelecionado === 'placa_video' ? 'active' : ''}
              onClick={() => handleTipoChange('placa_video')}
            >
              Placas de Vídeo ({todasPecas.filter(p => p.tipo === 'placa_video').length})
            </button>
            <button
              className={tipoSelecionado === 'fonte' ? 'active' : ''}
              onClick={() => handleTipoChange('fonte')}
            >
              Fontes ({todasPecas.filter(p => p.tipo === 'fonte').length})
            </button>
            <button
              className={tipoSelecionado === 'gabinete' ? 'active' : ''}
              onClick={() => handleTipoChange('gabinete')}
            >
              Gabinetes ({todasPecas.filter(p => p.tipo === 'gabinete').length})
            </button>
            <button
              className={tipoSelecionado === 'armazenamento' ? 'active' : ''}
              onClick={() => handleTipoChange('armazenamento')}
            >
              Armazenamento ({todasPecas.filter(p => p.tipo === 'armazenamento').length})
            </button>
            <button
              className={tipoSelecionado === 'refrigeracao' ? 'active' : ''}
              onClick={() => handleTipoChange('refrigeracao')}
            >
              Refrigeração ({todasPecas.filter(p => p.tipo === 'refrigeracao').length})
            </button>
          </div>
        </div>

        {renderFiltrosEspecificos()}

        <div className="acoes-filtros">
          <button className="limpar-filtros" onClick={limparFiltros}>
            Limpar Filtros
          </button>
        </div>
      </div>

      <div className="resultados-info">
        <p>Mostrando {pecasFiltradas.length} peça(s)</p>
      </div>

      <div className="pecas-grid">
        {pecasFiltradas.map(peca => (
          <div 
            key={`${peca.tipo}-${peca.id}`} 
            className="peca-card"
            onClick={() => abrirModal(peca)}
          >
            {peca.imagem_url && (
              <div className="peca-imagem-container">
                {/* Os atributos voltam para dentro da tag img */}
                <img 
                  src={`${API_BASE_URL}/images/${peca.imagem_url}`}
                  alt={peca.nome} 
                  className="peca-imagem"
                />
              </div>
            )}
            <div className="peca-info">
              <span className="peca-tipo">{traduzirTipo(peca.tipo)}</span>
              <h4>
                {peca.tipo === 'placa_video'
                  ? `${peca.marca} ${peca.modelo_especifico} ${peca.nome_chip}`
                  : peca.nome
                }
              </h4>
              <div className="peca-detalhes">
                {peca.tipo === 'processador' && (
                  <>
                    <p><strong>Marca:</strong> {peca.marca}</p>
                    <p><strong>Soquete:</strong> {peca.soquete}</p>
                    <p><strong>Núcleos:</strong> {peca.nucleos}</p>
                    <p><strong>TDP:</strong> {peca.tdp_w}W</p>
                  </>
                )}
                {peca.tipo === 'placa_mae' && (
                  <>
                    <p><strong>Soquete:</strong> {peca.soquete_cpu}</p>
                    <p><strong>RAM:</strong> {peca.tipo_ram}</p>
                    <p><strong>Formato:</strong> {peca.formato}</p>
                  </>
                )}
                {peca.tipo === 'memoria_ram' && (
                  <>
                    <p><strong>Tipo:</strong> {peca.tipo}</p>
                    <p><strong>Capacidade:</strong> {peca.capacidade_gb}GB</p>
                    <p><strong>Frequência:</strong> {peca.frequencia_mhz}MHz</p>
                  </>
                )}
                {peca.tipo === 'placa_video' && (
                  <>
                    <p><strong>VRAM:</strong> {peca.vram_gb}GB</p>
                    <p><strong>TDP:</strong> {peca.tdp_w}W</p>
                  </>
                )}
                {peca.tipo === 'fonte' && (
                  <>
                    <p><strong>Potência:</strong> {peca.potencia_w}W</p>
                    <p><strong>Certificação:</strong> {peca.certificacao}</p>
                    <p><strong>Formato:</strong> {peca.formato}</p>
                  </>
                )}
                {peca.tipo === 'gabinete' && (
                  <>
                    <p><strong>Formato:</strong> {peca.formato}</p>
                    <p><strong>Suporta:</strong> {peca.formatos_placa_mae_suportados}</p>
                  </>
                )}
                {peca.tipo === 'armazenamento' && (
                  <>
                    <p><strong>Tipo:</strong> {peca.tipo}</p>
                    <p><strong>Capacidade:</strong> {peca.capacidade_gb}GB</p>
                  </>
                )}
                {peca.tipo === 'refrigeracao' && (
                  <>
                    <p><strong>Tipo:</strong> {peca.tipo}</p>
                    <p><strong>Soquetes:</strong> {peca.soquetes_suportados}</p>
                  </>
                )}
              </div>
              <p className="peca-preco">R$ {peca.preco?.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {pecasFiltradas.length === 0 && (
        <div className="sem-resultados">
          <p>Nenhuma peça encontrada com os filtros selecionados.</p>
        </div>
      )}

      {modalAberto && (
        <ComponentDetailModal 
          component={pecaSelecionada} 
          category={pecaSelecionada.tipo === 'processador' ? 'cpu' : pecaSelecionada.tipo === 'placa_video' ? 'placaDeVideo' : pecaSelecionada.tipo === 'memoria_ram' ? 'memoria' : pecaSelecionada.tipo === 'placa_mae' ? 'placaMae' : pecaSelecionada.tipo === 'fonte' ? 'fonte' : pecaSelecionada.tipo === 'gabinete' ? 'gabinete' : pecaSelecionada.tipo === 'armazenamento' ? 'armazenamento' : pecaSelecionada.tipo === 'refrigeracao' ? 'refrigeracao' : pecaSelecionada.tipo}
          onClose={fecharModal}
        />
      )}

      <ComponentComparator 
        pecasDisponiveis={{
          cpu: todasPecas.filter(p => p.tipo === 'processador'),
          placaDeVideo: todasPecas.filter(p => p.tipo === 'placa_video'),
          memoria: todasPecas.filter(p => p.tipo === 'memoria_ram'),
          placaMae: todasPecas.filter(p => p.tipo === 'placa_mae'),
          armazenamento: todasPecas.filter(p => p.tipo === 'armazenamento'),
          fonte: todasPecas.filter(p => p.tipo === 'fonte'),
          refrigeracao: todasPecas.filter(p => p.tipo === 'refrigeracao'),
          gabinete: todasPecas.filter(p => p.tipo === 'gabinete')
        }}
        onSelectComponent={null}
      />
    </div>
  );
};

export default CatalogoPecas;