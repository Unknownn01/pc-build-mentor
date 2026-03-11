// ARQUIVO: backend/services/recommendationEngine.js
// Motor de Recomendações Inteligentes - ATUALIZADO PARA POSTGRES/PRISMA

const { calculateOverallScore, detectBottlenecks } = require('./performanceAnalyzer');

/**
 * Calcula o custo-benefício da build
 */
function analyzeCostBenefit(build, allComponents) {
    const { cpu, placaDeVideo, memoria, armazenamento, fonte, gabinete, cooler, placaMae } = build;
    
    if (!cpu || !placaDeVideo) {
        return {
            valueScore: 0,
            analysis: [],
            overallRating: 'incomplete'
        };
    }

    const overallScore = calculateOverallScore(build);
    const totalPrice = calculateTotalPrice(build);
    
    // Calcula performance por real gasto
    const performancePerReal = totalPrice > 0 ? (overallScore.score / totalPrice) * 100 : 0;
    
    const analysis = [];
    const recommendations = [];

    // CPU
    if (cpu) {
        const cpuPrice = parseFloat(cpu.preco) || 0;
        const cpuScore = parseInt(cpu.specs?.power_score || cpu.power_score) || 0;
        const cpuValue = cpuPrice > 0 ? (cpuScore / cpuPrice) * 100 : 0;
        
        analysis.push({
            component: 'CPU',
            name: cpu.nome,
            price: cpuPrice,
            score: cpuScore,
            valueRating: cpuValue,
            pricePercentage: (cpuPrice / totalPrice) * 100
        });
    }

    // GPU
    if (placaDeVideo) {
        const gpuPrice = parseFloat(placaDeVideo.preco) || 0;
        const gpuScore = parseInt(placaDeVideo.specs?.power_score || placaDeVideo.power_score) || 0;
        const gpuValue = gpuPrice > 0 ? (gpuScore / gpuPrice) * 100 : 0;
        
        analysis.push({
            component: 'GPU',
            name: placaDeVideo.nome,
            price: gpuPrice,
            score: gpuScore,
            valueRating: gpuValue,
            pricePercentage: (gpuPrice / totalPrice) * 100
        });

        const gpuPercentage = (gpuPrice / totalPrice) * 100;
        if (gpuPercentage < 35 && totalPrice > 3000) {
            recommendations.push({
                type: 'budget_allocation',
                component: 'GPU',
                message: `Sua GPU representa apenas ${gpuPercentage.toFixed(1)}% do orçamento. Para jogos, recomendamos 40-50% do investimento na GPU.`,
                suggestion: 'Considere uma GPU mais potente para melhor desempenho em jogos'
            });
        }

        if (gpuPercentage > 65) {
            recommendations.push({
                type: 'budget_allocation',
                component: 'GPU',
                message: `Sua GPU representa ${gpuPercentage.toFixed(1)}% do orçamento. Isso pode estar desbalanceando a build.`,
                suggestion: 'Considere redistribuir o orçamento para outros componentes'
            });
        }
    }

    // RAM
    if (memoria) {
        const ramPrice = parseFloat(memoria.preco) || 0;
        const ramCapacity = parseInt(memoria.specs?.capacidade_gb || memoria.capacidade_gb) || 0;
        const ramFreq = parseInt(memoria.specs?.frequencia_mhz || memoria.frequencia_mhz) || 0;
        
        analysis.push({
            component: 'RAM',
            name: memoria.nome,
            price: ramPrice,
            capacity: ramCapacity,
            frequency: ramFreq,
            pricePercentage: (ramPrice / totalPrice) * 100
        });

        if (ramCapacity === 8 && totalPrice > 3000) {
            recommendations.push({
                type: 'upgrade_priority',
                component: 'RAM',
                priority: 'high',
                message: 'Com este orçamento, 16GB de RAM seria mais adequado',
                suggestion: 'Upgrade para 16GB melhorará significativamente a experiência'
            });
        }

        if (ramFreq < 3000 && cpu && cpu.marca === 'AMD' && cpu.specs?.soquete?.includes('AM')) {
            recommendations.push({
                type: 'optimization',
                component: 'RAM',
                priority: 'medium',
                message: 'Processadores AMD Ryzen se beneficiam muito de RAM mais rápida',
                suggestion: 'RAM 3200MHz+ pode aumentar o desempenho em até 10%'
            });
        }
    }

    // Armazenamento
    if (armazenamento) {
        const storagePrice = parseFloat(armazenamento.preco) || 0;
        const storageType = armazenamento.specs?.tipo || armazenamento.tipo || '';
        
        analysis.push({
            component: 'Armazenamento',
            name: armazenamento.nome,
            price: storagePrice,
            type: storageType,
            pricePercentage: (storagePrice / totalPrice) * 100
        });

        if (storageType.includes('HDD') && totalPrice > 2500) {
            recommendations.push({
                type: 'upgrade_priority',
                component: 'Armazenamento',
                priority: 'high',
                message: 'HDD como armazenamento principal prejudica muito a experiência',
                suggestion: 'Invista em um SSD NVMe - a diferença é enorme!'
            });
        }
    }

    // Fonte
    if (fonte) {
        const fontePrice = parseFloat(fonte.preco) || 0;
        const fontePotencia = parseInt(fonte.specs?.potencia_w || fonte.potencia_w) || 0;
        const certificacao = fonte.specs?.certificacao || fonte.certificacao || '';
        
        analysis.push({
            component: 'Fonte',
            name: fonte.nome,
            price: fontePrice,
            power: fontePotencia,
            certification: certificacao,
            pricePercentage: (fontePrice / totalPrice) * 100
        });

        if (!certificacao.includes('80 Plus') && totalPrice > 3000) {
            recommendations.push({
                type: 'quality',
                component: 'Fonte',
                priority: 'medium',
                message: 'Uma fonte certificada 80 Plus é mais eficiente e confiável',
                suggestion: 'Invista em uma fonte de qualidade para proteger seus componentes'
            });
        }
    }

    let overallRating = '';
    if (performancePerReal >= 0.035) overallRating = 'excellent';
    else if (performancePerReal >= 0.028) overallRating = 'very_good';
    else if (performancePerReal >= 0.022) overallRating = 'good';
    else if (performancePerReal >= 0.018) overallRating = 'fair';
    else overallRating = 'poor';

    return {
        valueScore: Math.round(performancePerReal * 1000) / 10,
        performancePerReal,
        totalPrice,
        overallScore: overallScore.score,
        analysis,
        recommendations,
        overallRating
    };
}

/**
 * Gera recomendações inteligentes baseadas na build
 */
function generateSmartRecommendations(build, allComponents) {
    const recommendations = {
        whatYouDidRight: [],
        whatCanBeImproved: [],
        upgradePriorities: [],
        futureUpgrades: []
    };

    const { cpu, placaDeVideo, memoria, armazenamento, fonte, gabinete, placaMae } = build;
    const bottlenecks = detectBottlenecks(build);
    const overallScore = calculateOverallScore(build);

    // O que você fez certo
    if (bottlenecks.strengths && bottlenecks.strengths.length > 0) {
        bottlenecks.strengths.forEach(strength => {
            recommendations.whatYouDidRight.push({
                title: strength.message,
                description: strength.description,
                icon: '✅'
            });
        });
    }

    // Verifica balanceamento CPU-GPU
    if (cpu && placaDeVideo) {
        const cpuScore = parseInt(cpu.specs?.power_score || cpu.power_score) || 0;
        const gpuScore = parseInt(placaDeVideo.specs?.power_score || placaDeVideo.power_score) || 0;
        const ratio = cpuScore / gpuScore;

        if (ratio >= 0.85 && ratio <= 1.5) {
            recommendations.whatYouDidRight.push({
                title: 'Balanceamento Perfeito',
                description: 'CPU e GPU estão bem equilibradas, evitando desperdício de recursos',
                icon: '⚖️'
            });
        }
    }

    // RAM
    if (memoria) {
        const ramCapacity = parseInt(memoria.specs?.capacidade_gb || memoria.capacidade_gb) || 0;
        const ramFreq = parseInt(memoria.specs?.frequencia_mhz || memoria.frequencia_mhz) || 0;
        
        if (ramCapacity >= 16 && ramFreq >= 3200) {
            recommendations.whatYouDidRight.push({
                title: 'RAM Bem Escolhida',
                description: `${ramCapacity}GB @ ${ramFreq}MHz é uma excelente escolha para jogos modernos`,
                icon: '🎯'
            });
        }
    }

    // Armazenamento
    if (armazenamento) {
        const type = armazenamento.specs?.tipo || armazenamento.tipo || '';
        if (type.includes('NVMe') || type.includes('M.2')) {
            recommendations.whatYouDidRight.push({
                title: 'Armazenamento Rápido',
                description: 'SSD NVMe garantirá carregamentos ultra-rápidos',
                icon: '⚡'
            });
        }
    }

    // O que pode ser melhorado
    if (bottlenecks.bottlenecks && bottlenecks.bottlenecks.length > 0) {
        bottlenecks.bottlenecks.forEach(bottleneck => {
            recommendations.whatCanBeImproved.push({
                title: bottleneck.message,
                description: bottleneck.description,
                impact: bottleneck.impact,
                suggestion: bottleneck.suggestion,
                priority: bottleneck.severity,
                icon: '⚠️'
            });
        });
    }

    if (bottlenecks.warnings && bottlenecks.warnings.length > 0) {
        bottlenecks.warnings.forEach(warning => {
            recommendations.whatCanBeImproved.push({
                title: warning.message,
                description: warning.description,
                impact: warning.impact,
                suggestion: warning.suggestion,
                priority: warning.severity,
                icon: '💡'
            });
        });
    }

    // Prioridades de upgrade
    const upgradePriorities = [];

    if (bottlenecks.bottlenecks && bottlenecks.bottlenecks.length > 0) {
        bottlenecks.bottlenecks.forEach(b => {
            upgradePriorities.push({
                priority: 1,
                component: b.type,
                reason: b.message,
                impact: 'Alto',
                suggestion: b.suggestion
            });
        });
    }

    if (memoria) {
        const ramCapacity = parseInt(memoria.specs?.capacidade_gb || memoria.capacidade_gb) || 0;
        if (ramCapacity < 16 && overallScore.score >= 60) {
            upgradePriorities.push({
                priority: 2,
                component: 'RAM',
                reason: 'Capacidade limitada para o nível da build',
                impact: 'Médio-Alto',
                suggestion: 'Upgrade para 16GB ou 32GB'
            });
        }
    }

    if (armazenamento) {
        const type = armazenamento.specs?.tipo || armazenamento.tipo || '';
        if (type.includes('HDD')) {
            upgradePriorities.push({
                priority: 2,
                component: 'Armazenamento',
                reason: 'HDD causa tempos de carregamento longos',
                impact: 'Médio',
                suggestion: 'Adicione um SSD NVMe de 500GB+'
            });
        }
    }

    if (fonte) {
        const cert = fonte.specs?.certificacao || fonte.certificacao || '';
        if (!cert.includes('80 Plus')) {
            upgradePriorities.push({
                priority: 3,
                component: 'Fonte',
                reason: 'Fonte sem certificação pode ser menos eficiente',
                impact: 'Baixo-Médio',
                suggestion: 'Considere uma fonte 80 Plus Bronze ou superior'
            });
        }
    }

    recommendations.upgradePriorities = upgradePriorities.sort((a, b) => a.priority - b.priority);

    // Upgrades futuros (Placa-mãe)
    if (placaMae) {
        const soquete = placaMae.specs?.soquete_cpu || placaMae.soquete_cpu || '';
        const slotsRam = parseInt(placaMae.specs?.slots_ram || placaMae.slots_ram) || 0;
        const slotsM2 = parseInt(placaMae.specs?.slots_m2 || placaMae.slots_m2) || 0;

        recommendations.futureUpgrades.push({
            title: 'Caminho de Upgrade',
            description: `Sua placa-mãe ${placaMae.nome} oferece:`,
            options: [
                soquete.includes('AM4') || soquete.includes('AM5') ? 
                    'Compatível com upgrades de CPU na mesma plataforma' : 
                    'Verifique compatibilidade para upgrades de CPU',
                slotsRam >= 4 ? 
                    `${slotsRam} slots de RAM - fácil expandir no futuro` : 
                    `${slotsRam} slots de RAM - expansão limitada`,
                slotsM2 >= 2 ? 
                    `${slotsM2} slots M.2 - pode adicionar mais SSDs rápidos` : 
                    'Slots M.2 limitados'
            ],
            icon: '🔮'
        });
    }

    // Sugestão de próximo passo
    if (overallScore.score < 90) {
        let nextUpgrade = '';
        const gpuPwr = parseInt(placaDeVideo?.specs?.power_score || placaDeVideo?.power_score || 0);
        const cpuPwr = parseInt(cpu?.specs?.power_score || cpu?.power_score || 0);
        const ramCap = parseInt(memoria?.specs?.capacidade_gb || memoria?.capacidade_gb || 0);
        const storageType = armazenamento?.specs?.tipo || armazenamento?.tipo || '';

        if (gpuPwr < 80) nextUpgrade = 'GPU - Maior impacto no desempenho de jogos';
        else if (cpuPwr < 75) nextUpgrade = 'CPU - Melhorará desempenho geral e FPS mínimos';
        else if (ramCap < 16) nextUpgrade = 'RAM - Mais capacidade para multitarefa';
        else if (storageType.includes('HDD')) nextUpgrade = 'SSD - Transformará a velocidade do sistema';

        if (nextUpgrade) {
            recommendations.futureUpgrades.push({
                title: 'Próximo Upgrade Recomendado',
                description: nextUpgrade,
                icon: '🎯'
            });
        }
    }

    return recommendations;
}

function calculateTotalPrice(build) {
    return Object.values(build).reduce((total, peca) => {
        return total + (peca ? parseFloat(peca.preco) || 0 : 0);
    }, 0);
}

function analyzeCompleteBuild(build, allComponents) {
    const costBenefit = analyzeCostBenefit(build, allComponents);
    const smartRecommendations = generateSmartRecommendations(build, allComponents);
    const overallScore = calculateOverallScore(build);
    const bottlenecks = detectBottlenecks(build);

    return {
        costBenefit,
        recommendations: smartRecommendations,
        overallScore,
        bottlenecks,
        summary: {
            totalPrice: costBenefit.totalPrice,
            valueRating: costBenefit.overallRating,
            performanceScore: overallScore.score,
            tier: overallScore.tier,
            hasIssues: (bottlenecks.bottlenecks?.length || 0) > 0 || (bottlenecks.warnings?.length || 0) > 0,
            strengthsCount: bottlenecks.strengths?.length || 0,
            issuesCount: (bottlenecks.bottlenecks?.length || 0) + (bottlenecks.warnings?.length || 0)
        }
    };
}

module.exports = {
    analyzeCostBenefit,
    generateSmartRecommendations,
    analyzeCompleteBuild,
    calculateTotalPrice
};