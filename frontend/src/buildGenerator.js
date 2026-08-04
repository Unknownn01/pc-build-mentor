// Motor de recomendação do Easy Mode
// Aloca o orçamento por categoria e escolhe as melhores peças dentro do limite

const ALLOCATION_PROFILES = {
    jogos:            { cpu: 0.18, placaMae: 0.10, memoria: 0.08, placaDeVideo: 0.40, armazenamento: 0.08, fonte: 0.08, gabinete: 0.05, cooler: 0.03 },
    renderizacao:     { cpu: 0.28, placaMae: 0.10, memoria: 0.14, placaDeVideo: 0.28, armazenamento: 0.08, fonte: 0.07, gabinete: 0.03, cooler: 0.02 },
    desenvolvimento:  { cpu: 0.30, placaMae: 0.12, memoria: 0.16, placaDeVideo: 0.16, armazenamento: 0.12, fonte: 0.08, gabinete: 0.04, cooler: 0.02 },
    simples:          { cpu: 0.30, placaMae: 0.15, memoria: 0.15, placaDeVideo: 0.10, armazenamento: 0.14, fonte: 0.10, gabinete: 0.04, cooler: 0.02 },
    ambos:            { cpu: 0.22, placaMae: 0.10, memoria: 0.10, placaDeVideo: 0.34, armazenamento: 0.08, fonte: 0.08, gabinete: 0.05, cooler: 0.03 },
};

function resolveProfileKey(answers) {
    if (answers.uso === 'jogos') return 'jogos';
    if (answers.uso === 'ambos') return 'ambos';
    if (answers.uso === 'trabalho') {
        if (answers.trabalho === 'renderizacao') return 'renderizacao';
        if (answers.trabalho === 'desenvolvimento') return 'desenvolvimento';
        return 'simples';
    }
    return 'simples';
}

function pickWithinBudget(list, budget, { sortBy = 'power_score', marcaPref, tolerance = 0.3 } = {}) {
    if (!list || list.length === 0) return null;
    let candidates = [...list];

    if (marcaPref) {
        const filtrado = candidates.filter(p => p.marca?.toLowerCase() === marcaPref);
        if (filtrado.length > 0) candidates = filtrado;
    }

    const maxPreco = budget * (1 + tolerance);
    let dentroDoLimite = candidates.filter(p => (p.preco || 0) <= maxPreco);

    if (dentroDoLimite.length === 0) {
        // Fallback: pega a mais barata disponível, mesmo fora do orçamento ideal
        return [...candidates].sort((a, b) => (a.preco || 0) - (b.preco || 0))[0] || null;
    }

    const estritamenteAbaixo = dentroDoLimite.filter(p => (p.preco || 0) <= budget);
    const pool = estritamenteAbaixo.length > 0 ? estritamenteAbaixo : dentroDoLimite;

    pool.sort((a, b) => {
        const scoreA = parseFloat(a.specs?.[sortBy] || 0);
        const scoreB = parseFloat(b.specs?.[sortBy] || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (b.preco || 0) - (a.preco || 0); // empate: usa mais do orçamento disponível
    });

    return pool[0] || null;
}

export function generateRecommendedBuild(answers, pecasDisponiveis) {
    const budget = answers.orcamentoValor || 5000;
    const profileKey = resolveProfileKey(answers);
    const allocation = ALLOCATION_PROFILES[profileKey];

    const marcaCpuPref = ['amd', 'intel'].includes(answers.marca) ? answers.marca : null;
    const marcaGpuPref = answers.marca === 'nvidia' ? 'nvidia' : (answers.marca === 'amd' ? 'amd' : null);
    const corPref = answers.cor && answers.cor !== 'sem_preferencia' ? answers.cor : null;

    const build = {};
    const warnings = [];

    // 1. CPU
    const cpu = pickWithinBudget(pecasDisponiveis.cpu, budget * allocation.cpu, { sortBy: 'power_score', marcaPref: marcaCpuPref });
    if (cpu) build.cpu = cpu; else warnings.push('Não encontramos processadores disponíveis.');

    const socketCpu = cpu?.specs?.soquete || cpu?.specs?.socket;

    // 2. Placa-mãe (compatível com o socket da CPU)
    let moboCandidates = pecasDisponiveis.placaMae || [];
    if (socketCpu) {
        moboCandidates = moboCandidates.filter(p => (p.specs?.soquete || p.specs?.socket || p.specs?.soquete_cpu) === socketCpu);
    }
    const placaMae = pickWithinBudget(moboCandidates, budget * allocation.placaMae, {});
    if (placaMae) build.placaMae = placaMae; else warnings.push('Não encontramos placas-mãe compatíveis com o processador escolhido.');

    const tipoRamMobo = placaMae?.specs?.tipo_ram || placaMae?.specs?.tipo_memoria || 'DDR4';
    const formatoMobo = placaMae?.specs?.formato || placaMae?.specs?.fator_forma || 'ATX';

    // 3. Memória (compatível com o tipo da placa-mãe)
    let memCandidates = (pecasDisponiveis.memoria || []).filter(m => {
        const tipo = m.specs?.tipo || m.specs?.tipo_ram;
        return tipo?.includes(tipoRamMobo) || tipoRamMobo?.includes(tipo);
    });
    if (memCandidates.length === 0) memCandidates = pecasDisponiveis.memoria || [];
    const memoria = pickWithinBudget(memCandidates, budget * allocation.memoria, { sortBy: 'capacidade_gb' });
    if (memoria) build.memoria = memoria;

    // 4. Placa de Vídeo
    const placaDeVideo = pickWithinBudget(pecasDisponiveis.placaDeVideo, budget * allocation.placaDeVideo, { sortBy: 'power_score', marcaPref: marcaGpuPref });
    if (placaDeVideo) build.placaDeVideo = placaDeVideo;

    // 5. Armazenamento
    const armazenamento = pickWithinBudget(pecasDisponiveis.armazenamento, budget * allocation.armazenamento, { sortBy: 'capacidade_gb' });
    if (armazenamento) build.armazenamento = armazenamento;

    // 6. Fonte (precisa atender o consumo mínimo)
    const tdpCPU = parseInt(cpu?.specs?.tdp_w || cpu?.specs?.tdp || 0);
    const tdpGPU = parseInt(placaDeVideo?.specs?.tdp_w || placaDeVideo?.specs?.tdp || 0);
    const potenciaMinima = Math.ceil((tdpCPU + tdpGPU + 100) * 1.3);
    let fonteCandidates = (pecasDisponiveis.fonte || []).filter(f => parseInt(f.specs?.potencia_w || f.specs?.potencia || 0) >= potenciaMinima);
    if (fonteCandidates.length === 0) fonteCandidates = pecasDisponiveis.fonte || [];
    const fonte = pickWithinBudget(fonteCandidates, budget * allocation.fonte, { sortBy: 'potencia_w' });
    if (fonte) build.fonte = fonte; else warnings.push('Não encontramos fontes com potência suficiente dentro do orçamento.');

    // 7. Gabinete (compatível com o formato + preferência de cor, se houver)
    let gabineteCandidates = (pecasDisponiveis.gabinete || []).filter(g => {
        const formatosGabinete = g.specs?.formatos_suportados || g.specs?.placas_mae_compativeis || '';
        return !formatosGabinete || formatosGabinete.toLowerCase().includes(formatoMobo.toLowerCase());
    });
    if (corPref) {
        const corFiltrado = gabineteCandidates.filter(g => g.specs?.cor?.toLowerCase() === corPref);
        if (corFiltrado.length > 0) gabineteCandidates = corFiltrado;
    }
    const gabinete = pickWithinBudget(gabineteCandidates, budget * allocation.gabinete, {});
    if (gabinete) build.gabinete = gabinete;

    // 8. Cooler (compatível com o socket da CPU)
    let coolerCandidates = (pecasDisponiveis.cooler || []).filter(c => {
        const soquetes = c.specs?.soquetes_suportados || c.specs?.socket || '';
        return soquetes.includes(socketCpu || '');
    });
    if (coolerCandidates.length === 0) coolerCandidates = pecasDisponiveis.cooler || [];
    const cooler = pickWithinBudget(coolerCandidates, budget * allocation.cooler, {});
    if (cooler) build.cooler = cooler;

    const precoTotal = Object.values(build).reduce((total, peca) => total + (peca?.preco || 0), 0);

    return { build, warnings, precoTotal };
}