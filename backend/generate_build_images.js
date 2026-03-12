const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// --- CONFIGURAÇÃO DE CAMINHOS ---
const BASE_IMG_PATH = path.join(__dirname, 'imagens_componentes'); 
const GERADAS_IMG_PATH = path.join(__dirname, 'imagens-geradas');

// --- DIMENSÕES DO CARD ---
const LARGURA_CARD = 1200;
const ALTURA_CARD = 630;
const COR_FUNDO = { r: 22, g: 27, b: 34, alpha: 1 }; 
const ESPESSURA_LINHA = 4; 
const LARGURA_MEIO = LARGURA_CARD / 2;

async function main() {
    console.log('🚀 Iniciando geração de imagens das 25 builds...');

    if (!fs.existsSync(GERADAS_IMG_PATH)) {
        fs.mkdirSync(GERADAS_IMG_PATH, { recursive: true });
        console.log(`📂 Pasta de saída criada: ${GERADAS_IMG_PATH}`);
    }

    try {
        // Busca as tabelas
        const builds = await prisma.buildPronta.findMany();
        const pecas = await prisma.component.findMany();

        console.log(`📊 ${builds.length} builds encontradas.`);

        for (const build of builds) {
            console.log(`- Processando: "${build.nome}"`);

            const cpu = pecas.find(p => p.id === build.cpu_id);
            const gpu = pecas.find(p => p.id === build.gpu_id);

            if (!cpu?.imagem_url || !gpu?.imagem_url) {
                console.warn(`  ⚠️ Build "${build.nome}" ignorada: CPU ou GPU não encontrada.`);
                continue;
            }

            // --- MAPEAMENTO DE SUBPASTAS (Onde a mágica acontece) ---
            const caminhoCpu = path.join(BASE_IMG_PATH, 'imagens_processadores', cpu.imagem_url);
            const caminhoGpu = path.join(BASE_IMG_PATH, 'imagens_placa_video', gpu.imagem_url);
            
            const nomeArquivo = `build_${build.nome.replace(/\s/g, '_').toLowerCase()}.png`;
            const caminhoSaida = path.join(GERADAS_IMG_PATH, nomeArquivo);

            // Validação física dos arquivos
            if (!fs.existsSync(caminhoCpu) || !fs.existsSync(caminhoGpu)) {
                console.error(`  ✖ Imagens não encontradas para "${build.nome}":`);
                if (!fs.existsSync(caminhoCpu)) console.error(`    Faltando CPU em: ${caminhoCpu}`);
                if (!fs.existsSync(caminhoGpu)) console.error(`    Faltando GPU em: ${caminhoGpu}`);
                continue;
            }

            try {
                // Resize CPU
                const cpuBuffer = await sharp(caminhoCpu)
                    .resize({ width: 598, height: 630, fit: 'contain', background: { r: 255, g: 255, b: 255 } })
                    .toBuffer();

                // Resize GPU
                const gpuBuffer = await sharp(caminhoGpu)
                    .resize({ width: 598, height: 630, fit: 'contain', background: { r: 255, g: 255, b: 255 } })
                    .toBuffer();

                // Montagem do Card
                await sharp({
                    create: {
                        width: LARGURA_CARD,
                        height: ALTURA_CARD,
                        channels: 4,
                        background: COR_FUNDO
                    }
                })
                .composite([
                    { input: cpuBuffer, left: 0, top: 0 },
                    {
                        input: Buffer.from(`<svg width="${ESPESSURA_LINHA}" height="${ALTURA_CARD}"><rect x="0" y="0" width="${ESPESSURA_LINHA}" height="${ALTURA_CARD}" fill="black"/></svg>`),
                        left: 598,
                        top: 0
                    },
                    { input: gpuBuffer, left: 602, top: 0 }
                ])
                .png()
                .toFile(caminhoSaida);

                console.log(`  ✔ Gerado: ${nomeArquivo}`);
            } catch (err) {
                console.error(`  ✖ Erro no processamento Sharp: ${err.message}`);
            }
        }

        console.log('\n✅ Processo concluído! Suas builds agora têm imagens reais.');
    } catch (error) {
        console.error('❌ Erro fatal:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();