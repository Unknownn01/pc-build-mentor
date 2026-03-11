const sharp = require('sharp');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// --- CONFIGURAÇÃO: Verifique se estes caminhos estão corretos ---
const BUILDS_CSV_PATH = path.join(__dirname, 'backend', 'builds.csv');
const COMPONENTES_IMG_PATH = path.join(__dirname, 'backend', 'imagens_componentes');
const GERADAS_IMG_PATH = path.join(__dirname, 'imagens-geradas');

// --- DIMENSÕES DO CARD FINAL ---
const LARGURA_CARD = 1200;
const ALTURA_CARD = 630;
const COR_FUNDO = { r: 22, g: 27, b: 34, alpha: 1 }; // Manter o fundo escuro do card
const COR_LINHA = { r: 0, g: 0, b: 0, alpha: 1 }; // Preto para a linha de separação
const ESPESSURA_LINHA = 4; // Espessura da linha preta


// --- DIMENSÕES DAS IMAGENS DOS COMPONENTES ---
// Cada imagem ocupará metade da largura do card, menos o espaço da linha
const LARGURA_IMAGEM_COMPONENTE = (LARGURA_CARD - ESPESSURA_LINHA) / 2;
const ALTURA_IMAGEM_COMPONENTE = ALTURA_CARD; // As imagens vão ocupar toda a altura

// --- Função para ler o CSV ---
function lerBuildsDoCSV() {
  return new Promise((resolve, reject) => {
    const builds = [];
    fs.createReadStream(BUILDS_CSV_PATH)
      .pipe(csv())
      .on('data', (row) => builds.push(row))
      .on('end', () => {
        console.log(`Arquivo CSV lido com sucesso. ${builds.length} builds encontradas.`);
        resolve(builds);
      })
      .on('error', (error) => reject(error));
  });
}

// --- Função Principal para Gerar as Imagens ---
async function gerarCards() {
  console.log('Iniciando a geração de cards...');

  if (!fs.existsSync(GERADAS_IMG_PATH)) {
    fs.mkdirSync(GERADAS_IMG_PATH, { recursive: true });
    console.log(`Pasta de saída criada em: ${GERADAS_IMG_PATH}`);
  }

  try {
    const builds = await lerBuildsDoCSV();

    for (const build of builds) {
      // ***** MUDANÇA AQUI: de build.build_name para build.nome *****
      // Trecho CORRIGIDO
      console.log(`- Processando build: "${build.nome}"`);

      // --- NOVA VERIFICAÇÃO ---
      if (!build.cpu_image || !build.gpu_image) {
        console.error(`  ✖ Erro: A build "${build.nome}" está com o nome da imagem da CPU ou da GPU faltando no CSV. Pulando.`);
        continue; // Pula para a próxima build
      }
      // --- FIM DA VERIFICAÇÃO ---

      const caminhoCpu = path.join(COMPONENTES_IMG_PATH, build.cpu_image);
      const caminhoGpu = path.join(COMPONENTES_IMG_PATH, build.gpu_image);
      
      // ***** MUDANÇA AQUI: de build.build_name para build.nome *****
      const nomeArquivoSanitizado = build.nome.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.png';
      const caminhoSaida = path.join(GERADAS_IMG_PATH, nomeArquivoSanitizado);

      if (!fs.existsSync(caminhoCpu) || !fs.existsSync(caminhoGpu)) {
        console.error(`  ✖ Erro: Imagens não encontradas para a build "${build.nome}". Verifique os nomes no CSV.`);
        console.error(`    Caminho CPU procurado: ${caminhoCpu}`);
        console.error(`    Caminho GPU procurado: ${caminhoGpu}`);
        continue; // Pula para a próxima build
      }

      try {
        const cpuBuffer = await sharp(caminhoCpu)
        .resize({
            width: LARGURA_IMAGEM_COMPONENTE,
            height: ALTURA_IMAGEM_COMPONENTE,
            fit: 'contain', // Garante que a imagem inteira seja visível
            background: { r: 255, g: 255, b: 255, alpha: 1 } // Fundo BRANCO para o componente
        })
        .toBuffer();

        const gpuBuffer = await sharp(caminhoGpu)
        .resize({
            width: LARGURA_IMAGEM_COMPONENTE,
            height: ALTURA_IMAGEM_COMPONENTE,
            fit: 'contain', // Garante que a imagem inteira seja visível
            background: { r: 255, g: 255, b: 255, alpha: 1 } // Fundo BRANCO para o componente
        })
        .toBuffer();

            // Cria a imagem de fundo do card
        const cardBase = sharp({ create: { width: LARGURA_CARD, height: ALTURA_CARD, channels: 4, background: COR_FUNDO } });

        // Calcula a posição da linha central
        const posicaoLinhaX = LARGURA_CARD / 2 - ESPESSURA_LINHA / 2;

        await cardBase
          .composite([
            // Componente CPU (esquerda)
            { 
                input: cpuBuffer, 
                left: 0, // Inicia na borda esquerda
                top: 0 
            },
            // Linha preta central
            {
                input: Buffer.from(`<svg width="${ESPESSURA_LINHA}" height="${ALTURA_CARD}"><rect x="0" y="0" width="${ESPESSURA_LINHA}" height="${ALTURA_CARD}" fill="rgb(${COR_LINHA.r},${COR_LINHA.g},${COR_LINHA.b})"/></svg>`),
                left: Math.round(posicaoLinhaX),
                top: 0,
                density: 72 // Importante para SVG
            },
            // Componente GPU (direita)
            { 
                input: gpuBuffer, 
                left: Math.round(LARGURA_CARD / 2 + ESPESSURA_LINHA / 2), // Inicia à direita da linha
                top: 0 
            }
          ])
          .png()
          .toFile(caminhoSaida);

        console.log(`  ✔ Card gerado com sucesso: ${caminhoSaida}`);
      } catch (error) {
        console.error(`  ✖ Erro ao processar imagens para "${build.nome}":`, error.message);
      }
    }

    console.log('\nProcesso concluído!');
  } catch (error) {
    console.error('Erro fatal ao processar o arquivo builds.csv:', error.message);
  }
}

gerarCards();