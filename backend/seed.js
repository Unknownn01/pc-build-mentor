const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Iniciando Seed no Backend...");

  // Como o seed.js está na raiz do backend, o caminho para o CSV é direto
  const csvPath = path.join(__dirname, 'builds.csv');
  
  if (!fs.existsSync(csvPath)) {
      console.error(`❌ Erro: builds.csv não encontrado em: ${csvPath}`);
      return;
  }

  const data = fs.readFileSync(csvPath, 'utf8');
  const lines = data.split('\n');

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; 

    const values = line.split(',');
    
    if (values.length < 12) continue;

    const buildData = {
      id: parseInt(values[0]),
      nome: values[1].trim(),
      uso_principal: values[2].trim(),
      cpu_id: parseInt(values[3]),
      gpu_id: parseInt(values[4]),
      memoria_id: parseInt(values[5]),
      placaMae_id: parseInt(values[6]),
      armazenamento_id: parseInt(values[7]),
      cooler_id: parseInt(values[8]),
      gabinete_id: parseInt(values[9]),
      fonte_id: parseInt(values[10]),
      build_image: values[11].trim() // Ex: "imagens_geradas/pc-gamer.png"
    };

    try {
        await prisma.buildPronta.upsert({
            where: { id: buildData.id },
            update: buildData,
            create: buildData,
        });
    } catch (error) {
        console.error(`❌ Erro na build ${buildData.id}:`, error.message);
    }
  }
  console.log("✨ Banco de Builds Prontas atualizado!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());