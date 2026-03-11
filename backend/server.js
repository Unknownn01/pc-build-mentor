// ARQUIVO: backend/server.js
require('win-ca')();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path'); 
const axios = require('axios');
const Parser = require('rss-parser');
const { PrismaClient } = require('@prisma/client');

// Importação dos serviços de análise (Mantenha os arquivos na pasta services)
const performanceAnalyzer = require('./services/performanceAnalyzer');
const recommendationEngine = require('./services/recommendationEngine');

const prisma = new PrismaClient();
const parser = new Parser();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const pastasDeImagens = [
    'imagens_processadores',
    'imagens_placa_mae',
    'imagens_placa_video',
    'imagens_memorias_ram',
    'imagens_armazenamento',
    'imagens_fontes',
    'imagens_gabinetes',
    'imagens_refrigeracao'
  ];
  
  pastasDeImagens.forEach(pasta => {
    // Diz ao servidor: "Se alguém pedir /images/foto.jpg, procure também dentro desta pasta aqui"
    app.use('/images', express.static(path.join(__dirname, 'imagens_componentes', pasta)));
  });
  
  // Mantém a pasta raiz também, caso tenha alguma imagem solta lá
  app.use('/images', express.static(path.join(__dirname, 'imagens_componentes')));
  
  // Rota para buscar TODAS as peças
  app.get('/api/pecas/todas', async (req, res) => {
    try {
      const pecas = await prisma.component.findMany();
      console.log(`📦 Enviando ${pecas.length} peças.`);
      res.json(pecas);
    } catch (error) {
      console.error("Erro no banco:", error);
      res.status(500).json({ error: "Erro interno" });
    }
  });

// --- INICIALIZAÇÃO DO SERVIDOR ---
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Banco de Dados PostgreSQL Conectado (Docker)!');
    
    // --- ÚNICO LISTEN ---
    app.listen(3001, () => { console.log("🔥 Servidor UNIFICADO rodando na porta 3001"); });
  } catch (error) {
    console.error('❌ Erro de conexão com o Banco:', error.message);
    process.exit(1);
  }
}

// --- ROTAS DE AUTENTICAÇÃO ---

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ message: 'E-mail já cadastrado.' });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
        data: { 
          name: username,      // Mapeia o 'username' do form para a coluna 'name' do banco
          email: email, 
          password: password_hash // Mapeia o hash para a coluna 'password' do banco
        }
      });

    res.status(201).json({ message: 'Usuário criado!', user: { id: newUser.id, username, email } });
    } catch (error) {
        console.error("ERRO DETALHADO NO PRISMA:", error); // Adicione esta linha
        res.status(500).json({ message: 'Erro ao registrar.', error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    // No Login:
    const isMatch = await bcrypt.compare(password, user.password); // Mude de user.password_hash para user.password
    if (!isMatch) return res.status(401).json({ message: 'Senha incorreta.' });

    res.status(200).json({ user: { id: user.id, username: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Erro no login.' });
  }
});

// --- ROTAS DE COMPONENTES ---

const fetchCategory = async (cat, folder, res) => {
  try {
    const items = await prisma.component.findMany({ where: { categoria: cat } });
    const formatted = items.map(i => ({ ...i, imagem_url: `${folder}/${i.imagem_url}` }));
    res.json(formatted);
  } catch (e) { res.status(500).send(e.message); }
};

app.get('/api/processadores', (req, res) => fetchCategory('processador', 'imagens_processadores', res));
app.get('/api/placas-mae', (req, res) => fetchCategory('placa_mae', 'imagens_placa_mae', res));
app.get('/api/memorias-ram', (req, res) => fetchCategory('memoria_ram', 'imagens_memorias_ram', res));
app.get('/api/placas-de-video', (req, res) => fetchCategory('placa_video', 'imagens_placa_video', res));
app.get('/api/fontes', (req, res) => fetchCategory('fonte', 'imagens_fontes', res));
app.get('/api/gabinetes', (req, res) => fetchCategory('gabinete', 'imagens_gabinetes', res));
app.get('/api/armazenamento', (req, res) => fetchCategory('armazenamento', 'imagens_armazenamento', res));
app.get('/api/refrigeracao', (req, res) => fetchCategory('refrigeracao', 'imagens_refrigeracao', res));

// --- ROTAS DE BUILDS SALVAS (MIGRADO) ---

app.post('/api/builds/save', async (req, res) => {
  const { userId, buildName, buildData } = req.body;
  try {
    const saved = await prisma.build.create({
      data: {
        userId: parseInt(userId),
        nome: buildName,
        buildData: JSON.stringify(buildData)
      }
    });
    res.status(201).json({ message: 'Build salva!', build: saved });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao salvar build.' });
  }
});

app.get('/api/builds/user/:userId', async (req, res) => {
  try {
    const builds = await prisma.build.findMany({ 
      where: { userId: parseInt(req.params.userId) },
      orderBy: { createdAt: 'desc' }
    });
    res.json(builds);
  } catch (error) { res.status(500).send(error.message); }
});

app.delete('/api/builds/delete/:buildId', async (req, res) => {
  try {
    await prisma.build.delete({ where: { id: parseInt(req.params.buildId) } });
    res.json({ message: 'Build removida.' });
  } catch (error) { res.status(404).json({ message: 'Build não encontrada.' }); }
});

// --- ROTA DE PEDIDOS (MIGRADO) ---

app.post('/api/orders/create', async (req, res) => {
    const { userId, totalPrice, assemblyChoice, shippingAddress, items } = req.body;

    try {
        // Concatenando o endereço do objeto que vem do modal para uma string única
        const enderecoCompleto = `${shippingAddress.rua}, ${shippingAddress.numero} - ${shippingAddress.bairro}, ${shippingAddress.cidade}/${shippingAddress.estado}`;

        const newOrder = await prisma.order.create({
            data: {
                userId: parseInt(userId),        // Converte string para número
                total: parseFloat(totalPrice), // Converte "6539.69" para número
                assemblyOption: assemblyChoice,
                address: enderecoCompleto,
                items: items,
                status: "Pendente"      // Transforma o objeto da build em texto
            }
        });

        res.status(201).json(newOrder);
    } catch (error) {
        console.error("Erro Prisma:", error);
        res.status(500).json({ error: "Erro ao salvar no banco" });
    }
});

app.get('/api/orders/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const orders = await prisma.order.findMany({
        where: { userId: parseInt(userId) },
        orderBy: { createdAt: 'desc' }
      });
      res.json(orders);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      res.status(500).json({ error: "Erro interno no servidor" });
    }
  });

// --- ANÁLISE E NOTÍCIAS (MANTIDO) ---

// --- ROTA PARA BUSCAR NOTÍCIAS (COM CACHE) ---
let newsCache = {
    timestamp: 0,
    data: null,
};
const CACHE_DURATION_MS = 1000 * 60 * 30; // 30 minutos

app.get('/api/news', async (req, res) => {
    const now = Date.now();
    const limit = parseInt(req.query.limit) || 20;

    // Retorna do cache se as notícias ainda forem recentes
    if (newsCache.data && (now - newsCache.timestamp < CACHE_DURATION_MS)) {
        return res.json(newsCache.data.slice(0, limit));
    }

    try {
        const response = await axios.get('https://wccftech.com/feed/', { timeout: 10000 });
        const feed = await parser.parseString(response.data);
        
        newsCache = {
            timestamp: now,
            data: feed.items,
        };
        
        res.json(feed.items.slice(0, limit));
    } catch (error) {
        console.error('Erro no Feed RSS:', error.message);
        res.status(500).json({ message: 'Falha ao processar o feed de notícias.' });
    }
});

// --- ROTA PARA ANÁLISE COMPLETA E RECOMENDAÇÕES (IA) ---

app.post('/api/builds/complete-analysis', async (req, res) => {
    try {
        const { build, useCase } = req.body;

        // 1. Performance (O que o componente PerformanceAnalysis usa)
        const performance = performanceAnalyzer.generatePerformanceFeedback(build, useCase || 'Jogos');

        // 2. Jogos (O que o componente GameSimulation usa)
        const gamePerformance = performanceAnalyzer.simulateGamePerformance(build);

        // 3. Recomendações (O que o SmartRecommendations usa)
        // Buscamos as peças do banco para o motor comparar
        const allComponents = await prisma.component.findMany(); 
        const recommendations = recommendationEngine.analyzeCompleteBuild(build, allComponents);

        res.json({
            performance,
            gamePerformance,
            recommendations
        });
    } catch (error) {
        console.error("Erro na análise unificada:", error);
        res.status(500).json({ error: "Erro ao processar análise completa." });
    }
});

// Simulação de FPS e Resolução
app.post('/api/builds/simulate-performance', (req, res) => {
    try {
        const { build } = req.body;
        const gamePerformance = performanceAnalyzer.simulateGamePerformance(build);
        const resolutionCapability = performanceAnalyzer.getResolutionCapability(build, 'Jogos');
        
        res.status(200).json({ gamePerformance, resolutionCapability });
    } catch (error) {
        res.status(500).json({ message: 'Erro na simulação' });
    }
});

startServer();