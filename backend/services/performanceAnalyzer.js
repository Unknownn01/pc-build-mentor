// ARQUIVO: backend/services/performanceAnalyzer.js
// Serviço de Análise de Desempenho Multidimensional - ATUALIZADO PARA POSTGRES/PRISMA

/**
 * Pesos de componentes por propósito de uso
 */
const USE_CASE_WEIGHTS = {
    'Jogos': { gpu: 0.50, cpu: 0.25, ram: 0.15, storage: 0.10 },
    'Edicao': { cpu: 0.35, gpu: 0.35, ram: 0.20, storage: 0.10 },
    'Trabalho': { cpu: 0.45, ram: 0.25, storage: 0.20, gpu: 0.10 },
    'Modelagem': { gpu: 0.40, cpu: 0.35, ram: 0.20, storage: 0.05 },
    'IA': { gpu: 0.55, ram: 0.25, cpu: 0.15, storage: 0.05 }
};

/**
 * Dados de referência para simulação de desempenho em jogos
 */
const GAME_BENCHMARKS = {
    'Cyberpunk 2077': { name: 'Cyberpunk 2077', demandLevel: 'ultra-high', minGpuScore: 75, minCpuScore: 70, minRam: 16, baseMultiplier: 0.8 },
    'Red Dead Redemption 2': { name: 'Red Dead Redemption 2', demandLevel: 'high', minGpuScore: 70, minCpuScore: 65, minRam: 12, baseMultiplier: 0.85 },
    'GTA V': { name: 'GTA V', demandLevel: 'medium', minGpuScore: 50, minCpuScore: 55, minRam: 8, baseMultiplier: 1.2 },
    'Fortnite': { name: 'Fortnite', demandLevel: 'medium', minGpuScore: 45, minCpuScore: 50, minRam: 8, baseMultiplier: 1.3 },
    'Valorant': { name: 'Valorant', demandLevel: 'low', minGpuScore: 35, minCpuScore: 45, minRam: 4, baseMultiplier: 1.8 },
    'CS2': { name: 'Counter-Strike 2', demandLevel: 'medium', minGpuScore: 55, minCpuScore: 60, minRam: 8, baseMultiplier: 1.4 },
    'Elden Ring': { name: 'Elden Ring', demandLevel: 'high', minGpuScore: 65, minCpuScore: 60, minRam: 12, baseMultiplier: 0.9 },
    'League of Legends': { name: 'League of Legends', demandLevel: 'low', minGpuScore: 30, minCpuScore: 40, minRam: 4, baseMultiplier: 2.0 },
    'Call of Duty: Warzone': { name: 'Call of Duty: Warzone', demandLevel: 'ultra-high', minGpuScore: 75, minCpuScore: 70, minRam: 16, baseMultiplier: 0.75 },
    'Black Myth: Wukong': { name: 'Black Myth: Wukong', demandLevel: 'ultra-high', minGpuScore: 80, minCpuScore: 75, minRam: 16, baseMultiplier: 0.7 },
    'Battlefield 2042': { name: 'Battlefield 2042', demandLevel: 'ultra-high', minGpuScore: 75, minCpuScore: 72, minRam: 16, baseMultiplier: 0.78 },
    'Minecraft': { name: 'Minecraft (Shaders)', demandLevel: 'medium', minGpuScore: 50, minCpuScore: 55, minRam: 8, baseMultiplier: 1.1 }
};

/**
 * Calcula o score geral de desempenho da build com contexto de uso
 */
function calculateOverallScore(build, useCase = 'Jogos') {
    const { cpu, placaDeVideo, memoria, armazenamento } = build;
    
    if (!cpu || !placaDeVideo) {
        return { score: 0, tier: 'incomplete', breakdown: { gpu: 0, cpu: 0, ram: 0, storage: 0 } };
    }

    const cpuScore = parseInt(cpu.specs?.power_score || cpu.power_score) || 0;
    const gpuScore = parseInt(placaDeVideo.specs?.power_score || placaDeVideo.power_score) || 0;
    const ramCapacity = parseInt(memoria?.specs?.capacidade_gb || memoria?.capacidade_gb) || 0;
    const ramFrequency = parseInt(memoria?.specs?.frequencia_mhz || memoria?.frequencia_mhz) || 0;
    const storageType = armazenamento?.specs?.tipo || armazenamento?.tipo || '';

    const weights = USE_CASE_WEIGHTS[useCase] || USE_CASE_WEIGHTS['Jogos'];

    const gpuWeighted = gpuScore * weights.gpu;
    const cpuWeighted = cpuScore * weights.cpu;

    let ramScore = 0;
    if (ramCapacity >= 64) ramScore = 100;
    else if (ramCapacity >= 32) ramScore = 95;
    else if (ramCapacity >= 16) ramScore = 85;
    else if (ramCapacity >= 8) ramScore = 60;
    else if (ramCapacity >= 4) ramScore = 30;
    
    if (ramFrequency >= 3600) ramScore = Math.min(100, ramScore + 10);
    else if (ramFrequency >= 3200) ramScore = Math.min(100, ramScore + 5);
    
    const ramWeighted = ramScore * weights.ram;

    let storageScore = 0;
    const sType = storageType.toLowerCase();
    if (sType.includes('nvme') || sType.includes('m.2')) storageScore = 100;
    else if (sType.includes('ssd')) storageScore = 70;
    else if (sType.includes('hdd')) storageScore = 30;
    
    const storageWeighted = storageScore * weights.storage;

    let totalScore = gpuWeighted + cpuWeighted + ramWeighted + storageWeighted;

    let tier = '';
    if (totalScore >= 90) tier = 'ultra';
    else if (totalScore >= 75) tier = 'high';
    else if (totalScore >= 60) tier = 'medium-high';
    else if (totalScore >= 45) tier = 'medium';
    else if (totalScore >= 30) tier = 'low-medium';
    else tier = 'low';

    return {
        score: Math.round(totalScore),
        tier,
        useCase,
        breakdown: {
            gpu: Math.round(gpuWeighted),
            cpu: Math.round(cpuWeighted),
            ram: Math.round(ramWeighted),
            storage: Math.round(storageWeighted)
        }
    };
}

/**
 * Detecta gargalos na build com contexto de uso
 */
function detectBottlenecks(build, useCase = 'Jogos') {
    const { cpu, placaDeVideo, memoria, fonte, armazenamento } = build;
    const bottlenecks = [];
    const warnings = [];
    const strengths = [];

    if (!cpu || !placaDeVideo) {
        return { bottlenecks, warnings, strengths, severity: 'info' };
    }

    const cpuScore = parseInt(cpu.specs?.power_score || cpu.power_score) || 0;
    const gpuScore = parseInt(placaDeVideo.specs?.power_score || placaDeVideo.power_score) || 0;
    const ramCapacity = parseInt(memoria?.specs?.capacidade_gb || memoria?.capacidade_gb) || 0;
    const cpuTdp = parseInt(cpu.specs?.tdp_w || cpu.tdp_w) || 0;
    const gpuTdp = parseInt(placaDeVideo.specs?.tdp_w || placaDeVideo.tdp_w) || 0;
    const fontePotencia = parseInt(fonte?.specs?.potencia_w || fonte?.potencia_w) || 0;

    const ratio = cpuScore / gpuScore;

    let minRatio, maxRatio;
    switch(useCase) {
        case 'Jogos': minRatio = 0.70; maxRatio = 1.5; break;
        case 'Edicao': minRatio = 0.80; maxRatio = 1.3; break;
        case 'Trabalho': minRatio = 0.90; maxRatio = 3.0; break;
        case 'Modelagem': minRatio = 0.75; maxRatio = 1.4; break;
        case 'IA': minRatio = 0.60; maxRatio = 1.2; break;
        default: minRatio = 0.70; maxRatio = 1.5;
    }

    if (ratio < minRatio) {
        bottlenecks.push({
            type: 'cpu',
            severity: 'high',
            message: `Gargalo de CPU para ${useCase}`,
            description: `Sua CPU (score ${cpuScore}) limita o potencial da GPU (score ${gpuScore}).`,
            impact: 'Alto impacto no desempenho',
            suggestion: `Considere uma CPU com score mínimo de ${Math.round(gpuScore * minRatio)}`
        });
    } else if (ratio > maxRatio && useCase !== 'Trabalho') {
        warnings.push({
            type: 'gpu',
            severity: 'medium',
            message: `GPU Subutilizada para ${useCase}`,
            description: `Sua GPU poderia ser mais potente para acompanhar esta CPU.`,
            impact: 'Desperdício de potencial',
            suggestion: `Considere uma GPU com score mínimo de ${Math.round(cpuScore * 0.70)}`
        });
    } else {
        strengths.push({
            type: 'balance',
            message: `Excelente Equilíbrio para ${useCase}`,
            description: `Configuração bem balanceada.`
        });
    }

    // RAM
    let minRamRecommended = (useCase === 'Edicao' || useCase === 'IA' || useCase === 'Modelagem') ? 32 : (useCase === 'Trabalho' ? 8 : 16);

    if (ramCapacity < minRamRecommended / 2) {
        bottlenecks.push({
            type: 'ram',
            severity: 'high',
            message: `RAM Insuficiente para ${useCase}`,
            description: `${ramCapacity}GB causará sérios travamentos em ${useCase}.`,
            impact: 'Alto impacto na fluidez',
            suggestion: `Mínimo: ${minRamRecommended}GB`
        });
    } else if (ramCapacity < minRamRecommended) {
        warnings.push({
            type: 'ram',
            severity: 'medium',
            message: `RAM Limitada para ${useCase}`,
            description: `Recomendamos ${minRamRecommended}GB para melhor experiência.`,
            impact: 'Pode limitar tarefas pesadas',
            suggestion: `Upgrade para ${minRamRecommended}GB recomendado`
        });
    }

    // Fonte
    const consumoEstimado = cpuTdp + gpuTdp + 100;
    const consumoRecomendado = consumoEstimado * 1.3;

    if (fontePotencia > 0) {
        if (fontePotencia < consumoEstimado) {
            bottlenecks.push({
                type: 'power',
                severity: 'critical',
                message: 'Fonte Insuficiente',
                description: `Fonte de ${fontePotencia}W é insuficiente para o hardware selecionado.`,
                impact: 'Risco de desligamento súbito',
                suggestion: `Fonte mínima: ${Math.ceil(consumoRecomendado)}W`
            });
        } else if (fontePotencia < consumoRecomendado) {
            warnings.push({
                type: 'power',
                severity: 'medium',
                message: 'Fonte sem Margem',
                description: `Fonte operando muito próxima do limite de carga.`,
                impact: 'Redução da vida útil da fonte',
                suggestion: `Recomendado: ${Math.ceil(consumoRecomendado)}W`
            });
        }
    }

    // Armazenamento
    if (armazenamento) {
        const type = (armazenamento.specs?.tipo || armazenamento.tipo || '').toLowerCase();
        if (type.includes('hdd') && !type.includes('ssd')) {
            const isHeavy = ['Edicao', 'Modelagem', 'IA'].includes(useCase);
            if (isHeavy) {
                bottlenecks.push({
                    type: 'storage',
                    severity: 'high',
                    message: 'Armazenamento Lento',
                    description: 'HDD prejudica severamente fluxos de trabalho profissionais.',
                    impact: 'Baixa produtividade',
                    suggestion: 'Mude para SSD NVMe'
                });
            } else {
                warnings.push({ type: 'storage', severity: 'medium', message: 'HDD detectado', description: 'Considere um SSD para agilizar o sistema.' });
            }
        }
    }

    let overallSeverity = bottlenecks.some(b => b.severity === 'critical') ? 'critical' : (bottlenecks.length > 0 ? 'high' : (warnings.length > 1 ? 'medium' : (warnings.length === 1 ? 'low' : 'good')));

    return { bottlenecks, warnings, strengths, severity: overallSeverity, useCase };
}

/**
 * Determina a capacidade de resolução da build
 */
function getResolutionCapability(build, useCase = 'Jogos') {
    const overallScore = calculateOverallScore(build, useCase);
    const { cpu, placaDeVideo, memoria } = build;

    if (!cpu || !placaDeVideo) return { primary: null, capabilities: [], message: 'Análise pendente de CPU/GPU' };

    const gpuScore = parseInt(placaDeVideo.specs?.power_score || placaDeVideo.power_score) || 0;
    const vram = parseInt(placaDeVideo.specs?.vram_gb || placaDeVideo.vram_gb) || 0;
    const score = overallScore.score;

    let primary = '';
    let capabilities = [];
    let message = '';

    if (useCase === 'Jogos') {
        if (score >= 85 && gpuScore >= 90 && vram >= 12) {
            primary = '4K';
            capabilities = [
                { resolution: '4K (2160p)', quality: 'Ultra/High', fps: '60+ FPS', viable: true },
                { resolution: '1440p', quality: 'Ultra', fps: '100+ FPS', viable: true }
            ];
            message = 'Máquina Monstruosa! Roda tudo em 4K no talo.';
        } else if (score >= 70 && gpuScore >= 75) {
            primary = '1440p';
            capabilities = [
                { resolution: '1440p', quality: 'High/Ultra', fps: '60+ FPS', viable: true },
                { resolution: '1080p', quality: 'Ultra', fps: '120+ FPS', viable: true }
            ];
            message = 'Excelente para o padrão Quad HD (1440p)!';
        } else {
            primary = '1080p';
            message = 'PC sólido para o padrão Full HD (1080p).';
        }
    } else {
        message = score >= 85 ? 'Desempenho Profissional de Elite!' : (score >= 65 ? 'Ótimo para uso produtivo.' : 'Adequado para tarefas cotidianas.');
    }

    return { primary, capabilities, message, score: overallScore, useCase };
}

/**
 * Simula desempenho em jogos populares
 */
function simulateGamePerformance(build) {
    const { cpu, placaDeVideo, memoria } = build;
    if (!cpu || !placaDeVideo) return [];

    const cpuScore = parseInt(cpu.specs?.power_score || cpu.power_score) || 0;
    const gpuScore = parseInt(placaDeVideo.specs?.power_score || placaDeVideo.power_score) || 0;
    const ramCapacity = parseInt(memoria?.specs?.capacidade_gb || memoria?.capacidade_gb) || 0;
    const ramFreq = parseInt(memoria?.specs?.frequencia_mhz || memoria?.frequencia_mhz) || 0;
    const vram = parseInt(placaDeVideo.specs?.vram_gb || placaDeVideo.vram_gb) || 0;

    const gameResults = [];

    for (const [gameName, gameData] of Object.entries(GAME_BENCHMARKS)) {
        const meetsMin = gpuScore >= gameData.minGpuScore && cpuScore >= gameData.minCpuScore && ramCapacity >= gameData.minRam;

        let fps1080pUltra = 0;
        if (meetsMin) {
            const baseFps = (gpuScore * 0.7 + cpuScore * 0.3) * gameData.baseMultiplier;
            fps1080pUltra = Math.round(baseFps * (ramCapacity < 16 ? 0.9 : 1) * (ramFreq >= 3600 ? 1.05 : 1));
            if (vram < 8 && gameData.demandLevel === 'ultra-high') fps1080pUltra = Math.round(fps1080pUltra * 0.8);
        }

        gameResults.push({
            game: gameName,
            playable: fps1080pUltra >= 30,
            fps: { '1080p_ultra': fps1080pUltra },
            recommended: { settings: fps1080pUltra >= 60 ? 'Ultra' : (fps1080pUltra >= 45 ? 'High' : 'Medium') }
        });
    }

    return gameResults;
}

/**
 * Gera feedback de desempenho geral
 */
function generatePerformanceFeedback(build, useCase = 'Jogos') {
    const overallScore = calculateOverallScore(build, useCase);
    const bottleneckAnalysis = detectBottlenecks(build, useCase);
    const resolutionCap = getResolutionCapability(build, useCase);
    const gamePerformance = useCase === 'Jogos' ? simulateGamePerformance(build) : [];

    return {
        overallScore,
        bottleneckAnalysis,
        resolutionCapability: resolutionCap,
        gamePerformance,
        useCase,
        summary: {
            tier: overallScore.tier,
            primaryResolution: resolutionCap.primary,
            mainMessage: resolutionCap.message,
            hasBottlenecks: bottleneckAnalysis.bottlenecks.length > 0,
            playableGames: gamePerformance.filter(g => g.playable).length,
            totalGames: gamePerformance.length
        }
    };
}

module.exports = {
    calculateOverallScore,
    detectBottlenecks,
    getResolutionCapability,
    simulateGamePerformance,
    generatePerformanceFeedback,
    USE_CASE_WEIGHTS
};