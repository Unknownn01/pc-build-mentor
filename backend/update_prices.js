const { PrismaClient } = require('@prisma/client');
const { scrapeKabum } = require('./scraper');

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 [INÍCIO] Iniciando atualização de preços e CB Score...");

    try {
        // Busca componentes que têm link da Kabum
        const componentes = await prisma.component.findMany({
            where: { 
                url_loja: { 
                    not: null,
                    contains: 'kabum.com.br' 
                } 
            }
        });

        console.log(`📊 Encontrei ${componentes.length} componentes para processar.`);

        for (const comp of componentes) {
            console.log(`\n🔎 Verificando: ${comp.nome}`);
            
            const novoPreco = await scrapeKabum(comp.url_loja);

            if (novoPreco) {
                // 1. Criar registro no histórico
                await prisma.priceHistory.create({
                    data: { preco: novoPreco, componentId: comp.id }
                });

                // 2. Acessar os dados dentro do JSON 'specs'
                // Se specs for nulo ou não tiver o power_score, definimos como 0
                const currentSpecs = comp.specs || {};
                const powerScore = parseInt(currentSpecs.power_score) || 0;
                
                // 3. Calcular o Custo-Benefício
                const novoCBScore = novoPreco > 0 ? (powerScore / novoPreco) * 1000 : 0;

                // 4. Atualizar o componente injetando os scores no JSON
                await prisma.component.update({
                    where: { id: comp.id },
                    data: { 
                        preco: novoPreco,
                        specs: {
                            ...currentSpecs, // Mantém o que já tinha (socket, núcleos, etc)
                            power_score: powerScore,
                            cb_score: parseFloat(novoCBScore.toFixed(2))
                        }
                    }
                });

                console.log(`✅ Sucesso! R$ ${novoPreco.toFixed(2)} | Novo CB Score: ${novoCBScore.toFixed(2)}`);
            } else {
                console.log(`❌ Não foi possível capturar o preço para este item.`);
            }

            // Pausa de 3 segundos para evitar bloqueios do servidor (Essencial!)
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

    } catch (error) {
        console.error("🔴 Erro crítico:", error);
    } finally {
        console.log("\n✨ [FIM] Processo concluído.");
        await prisma.$disconnect();
    }
}

main();