const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const prisma = new PrismaClient();

const filesToProcess = [
  { file: 'processadores.csv', category: 'processador' },
  { file: 'placas_mae.csv', category: 'placa_mae' },
  { file: 'placas_de_video.csv', category: 'placa_video' },
  { file: 'memorias_ram.csv', category: 'memoria_ram' },
  { file: 'armazenamento.csv', category: 'armazenamento' },
  { file: 'fontes_alimentacao.csv', category: 'fonte_alimentacao' },
  { file: 'gabinetes.csv', category: 'gabinete' },
  { file: 'refrigeracao.csv', category: 'refrigeracao' }
];

function cleanPrice(priceString) {
  if (!priceString) return 0;
  let str = priceString.toString();

  if (str.includes(',')) {
    str = str.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
  } else {
    str = str.replace('R$', '').trim();
  }
  return parseFloat(str) || 0;
}

async function processFile(filename, category) {
  const filePath = path.join(__dirname, filename);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Arquivo não encontrado: ${filename}`);
    return;
  }

  const results = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`⏳ Processando ${category} (${results.length} itens)...`);

  for (const row of results) {
    // 1. Busca de NOME
    let nomeFinal = row.nome || row.Nome || row.name || row.Name || row.modelo || row.Model;

    if (category === 'placa_video' && row.modelo_especifico && row.nome_chip) {
        nomeFinal = `${row.nome_chip} ${row.modelo_especifico}`;
    } else if (nomeFinal === 'Sem Nome' && row.modelo_especifico) {
        nomeFinal = row.modelo_especifico;
    }

    const nome = nomeFinal;
    const marca = row.marca || row.Marca || row.brand || row.Brand || row.fabricante || row.Fabricante || null;
    const imagem_url = row.imagem || row.Imagem || row.image || row.Image || row.img || row.imagem_url || null;
    
    // NOVO: Busca do URL da Loja (prevendo variações)
    const url_loja = row.url_loja || row.Url_loja || row.URL_LOJA || row.link || row.Link || null;
    
    // 2. Busca do Preço
    const rawPrice = row.preco_simulado || row.Preco_simulado || row.preco || row.Preco || row.price || row.Price || row.valor || '0';
    const precoFinal = cleanPrice(rawPrice);

    // 3. Limpar o JSON (specs)
    const specs = { ...row };
    // Adicionado 'url_loja' e variações na lista de remoção para manter o JSON limpo
    const keysToRemove = [
        'nome','Nome','name','Name','modelo','Model',
        'marca','Marca','brand','Brand','fabricante','Fabricante',
        'imagem','Imagem','image','Image','img','imagem_url',
        'preco','Preco','price','Price','valor','preco_simulado','Preco_simulado',
        'url_loja', 'Url_loja', 'link', 'Link'
    ];
    
    keysToRemove.forEach(key => delete specs[key]);

    // 4. Salvar no Banco
    await prisma.component.create({
      data: {
        categoria: category,
        nome: nome,
        marca: marca,
        preco: precoFinal,
        imagem_url: imagem_url,
        url_loja: url_loja, // Atribuindo o campo novo
        specs: specs 
      }
    });
  }
  console.log(`✅ ${category} concluído!`);
}

async function main() {
  console.log("🚀 Iniciando povoamento com URLs de loja...");
  for (const item of filesToProcess) {
    await processFile(item.file, item.category);
  }
  console.log("🏁 Tudo pronto!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });