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

  app.use('/build-images', express.static(path.join(__dirname, 'imagens-geradas')));
  
  pastasDeImagens.forEach(pasta => {
    // Diz ao servidor: "Se alguém pedir /images/foto.jpg, procure também dentro desta pasta aqui"
    app.use('/images', express.static(path.join(__dirname, 'imagens_componentes', pasta)));
  });
  
  // Mantém a pasta raiz também, caso tenha alguma imagem solta lá
  app.use('/images', express.static(path.join(__dirname, 'imagens_componentes')));
  
  // Rota para buscar TODAS as peças
  app.get('/api/pecas/todas', async (req, res) => {
    try {
      const pecas = await prisma.component.findMany({
        orderBy: { id: 'asc' } // <--- ORDENA POR ID PARA O ADMIN
      });  
      console.log(`📦 Enviando ${pecas.length} peças.`);
      res.json(pecas);
    } catch (error) {
      console.error("Erro no banco:", error);
      res.status(500).json({ error: "Erro interno" });
    }
  });

  // Criar nova peça (exemplo para Processador)
app.post('/api/admin/pecas/:categoria', async (req, res) => {
  const { categoria } = req.params;
  const dados = req.body;
  try {
      // O Prisma usa o nome do modelo. Ex: categoria 'processadores' -> modelo 'processador'
      const novaPeca = await prisma[categoria].create({ data: dados });
      res.status(201).json(novaPeca);
  } catch (error) {
      res.status(500).json({ error: "Erro ao criar peça" });
  }
});

// Deletar peça
// No seu server.js

app.delete('/api/admin/components/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
      console.log(`🗑️ Tentando excluir componente ID: ${id}`);
      
      await prisma.component.delete({
          where: {
              id: parseInt(id) // Certifique-se de que é um número
          }
      });
      
      res.status(204).send(); // Sucesso sem conteúdo
  } catch (error) {
      console.error("❌ Erro ao deletar:", error);
      
      // Se o erro for P2003, é porque a peça está em um pedido (chave estrangeira)
      if (error.code === 'P2003') {
          return res.status(400).json({ error: "Não é possível excluir: esta peça está vinculada a um pedido ou build salva." });
      }
      
      res.status(500).json({ error: "Erro interno ao deletar peça." });
  }
});

    // Buscar todas as builds prontas do banco
  app.get('/api/builds-prontas', async (req, res) => {
    try {
      const builds = await prisma.buildPronta.findMany();
      res.json(builds);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar builds prontas" });
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

    res.status(200).json({ user: { id: user.id, username: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(500).json({ message: 'Erro no login.' });
  }
});

// --- No seu server.js ---

// Rota para CRIAR (POST)
app.post('/api/admin/components', async (req, res) => {
  try {
      const { nome, preco, categoria, imagem_url, marca, specs } = req.body;
      const novaPeca = await prisma.component.create({
          data: {
              nome,
              preco: parseFloat(preco),
              categoria,
              imagem_url,
              marca,
              specs: specs // O Prisma lida com o JSON automaticamente
          }
      });
      res.status(201).json(novaPeca);
  } catch (error) {
      console.error("Erro no Prisma:", error);
      res.status(500).json({ error: "Erro ao cadastrar peça." });
  }
});

// Verifique se a rota de ATUALIZAR (PUT) também está com o nome certo
app.put('/api/admin/components/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const pecaAtualizada = await prisma.component.update({
          where: { id: parseInt(id) },
          data: {
              ...req.body,
              preco: parseFloat(req.body.preco)
          }
      });
      res.json(pecaAtualizada);
  } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar peça." });
  }
});

// --- ROTAS DE COMPONENTES ---

const fetchCategory = async (cat, folder, res) => {
  try {
      const items = await prisma.component.findMany({ 
          where: { categoria: cat },
          orderBy: { 
              preco: 'asc' // Ordenação oficial do Prisma
          }
      });
      
      // Garantimos que o preço seja tratado como número no mapeamento também
      const formatted = items.map(i => ({ 
          ...i, 
          preco: Number(i.preco), // Força conversão para número
          imagem_url: `${folder}/${i.imagem_url}` 
      }));
      
      res.json(formatted);
  } catch (e) { 
      res.status(500).send(e.message); 
  }
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

// --- ROTA PARA SALVAR BUILDS (CORRIGIDA PARA INT) ---
app.post('/api/builds/save', async (req, res) => {
  try {
      const { userId, buildName, buildData } = req.body;

      // Log para depuração
      console.log("--- TENTATIVA DE SALVAMENTO ---");
      console.log("UserID:", userId);
      
      // Calculando o preço total no backend para garantir a integridade
      const total = Object.values(buildData).reduce((sum, peca) => {
          return sum + (peca ? parseFloat(peca.preco) || 0 : 0);
      }, 0);

      const saved = await prisma.build.create({
          data: {
              nome: buildName || "Minha Build",
              descricao: `Build criada em ${new Date().toLocaleDateString()}`,
              precoTotal: total, // O campo que estava faltando!
              // No seu Prisma Studio a coluna chama 'pecas' e é um JSON
              pecas: buildData, 
              tipo: "Personalizada", // Valor padrão para a coluna 'tipo'
              userId: Number(userId)
          }
      });

      console.log("✅ Build salva com sucesso!");
      res.status(201).json({ message: 'Build salva!', build: saved });

  } catch (error) {
      console.error("❌ ERRO NO PRISMA:", error);
      res.status(500).json({ message: 'Erro ao salvar build.', error: error.message });
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
  // Verifique se os nomes batem com o que o Modal do Front envia
  const { userId, total, assemblyChoice, shippingAddress, items } = req.body;

  try {
      const enderecoCompleto = `${shippingAddress.rua}, ${shippingAddress.numero} - ${shippingAddress.bairro}, ${shippingAddress.cidade}/${shippingAddress.estado}`;

      const newOrder = await prisma.order.create({
          data: {
              total: parseFloat(total) || 0, // Garante que se vier vazio, vira 0 e não NaN
              assemblyOption: assemblyChoice,
              address: enderecoCompleto,
              items: items, // Certifique-se que 'items' é o objeto com as peças
              status: "PENDENTE",
              user: { connect: { id: parseInt(userId) } }
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

// --- ROTAS DE ATUALIZAÇÃO DE PERFIL (ADICIONE AO SERVER.JS) ---

// 1. Atualizar Nome
app.put('/api/users/update/name', async (req, res) => {
  const { userId, newUsername, password } = req.body;
  
  try {
      const user = await prisma.user.findUnique({ where: { id: Number(userId) } });

      if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

      // A MÁGICA: Compara o texto puro com o Hash do banco
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
          return res.status(401).json({ message: 'Senha atual incorreta.' });
      }

      const updatedUser = await prisma.user.update({
          where: { id: Number(userId) },
          data: { name: newUsername }
      });

      // Remove a senha do objeto antes de enviar para o front por segurança
      delete updatedUser.password;

      res.json({ message: 'Nome atualizado!', user: updatedUser });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar nome.' });
  }
});

// 2. Atualizar Email
app.put('/api/users/update/email', async (req, res) => {
  const { userId, newEmail, password } = req.body;
  try {
      const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
      
      // Compara a senha digitada com o hash do banco
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(401).json({ message: 'Senha atual incorreta.' });
      }

      const updatedUser = await prisma.user.update({
          where: { id: Number(userId) },
          data: { email: newEmail }
      });

      delete updatedUser.password;
      res.json({ message: 'E-mail atualizado com sucesso!', user: updatedUser });
  } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar e-mail.' });
  }
});
// 3. Atualizar Senha
app.put('/api/users/update/password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  try {
      const user = await prisma.user.findUnique({ where: { id: Number(userId) } });

      // Valida se a senha atual está certa
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
          return res.status(401).json({ message: 'A senha atual está incorreta.' });
      }

      // GERA UM NOVO HASH PARA A SENHA NOVA (Custo 10)
      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      const updatedUser = await prisma.user.update({
          where: { id: Number(userId) },
          data: { password: hashedNewPassword }
      });

      res.json({ message: 'Senha alterada com sucesso!' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao processar alteração de senha.' });
  }
});

  // --- NOVAS ROTAS DE GESTÃO DE PEDIDOS ---

// 1. [ADMIN] Buscar TODOS os pedidos de todos os usuários
app.get('/api/admin/orders', async (req, res) => {
  try {
      // Buscamos os pedidos e incluímos os dados do usuário (join)
      const orders = await prisma.order.findMany({
          include: {
              user: {
                  select: { name: true, email: true }
              }
          },
          orderBy: { createdAt: 'desc' }
      });
      res.json(orders);
  } catch (error) {
      res.status(500).json({ error: "Erro ao buscar todos os pedidos." });
  }
});

// 2. [ADMIN] Atualizar Status do Pedido
app.patch('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
      const updatedOrder = await prisma.order.update({
          where: { id: parseInt(id) },
          data: { status: status }
      });
      res.json(updatedOrder);
  } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar status." });
  }
});

// 3. [USUÁRIO] Cancelar Pedido (com trava de segurança)
app.patch('/api/orders/:id/cancel', async (req, res) => {
  const { id } = req.params;
  try {
      const order = await prisma.order.findUnique({ where: { id: parseInt(id) } });

      if (!order) return res.status(404).json({ error: "Pedido não encontrado." });

      // Trava técnica: Não cancela se já estiver avançado
      const statusBloqueados = ["MONTAGEM", "PRONTO", "ENTREGUE"];
      if (statusBloqueados.includes(order.status.toUpperCase())) {
          return res.status(400).json({ 
              message: "Não é possível cancelar um pedido que já está em montagem ou finalizado." 
          });
      }

      const cancelledOrder = await prisma.order.update({
          where: { id: parseInt(id) },
          data: { status: "CANCELADO" }
      });
      res.json({ message: "Pedido cancelado com sucesso.", order: cancelledOrder });
  } catch (error) {
      res.status(500).json({ error: "Erro ao processar cancelamento." });
  }
});

// 1. LISTAR TODOS OS USUÁRIOS
app.get('/api/admin/users', async (req, res) => {
  try {
      // Tente buscar sem o 'select' primeiro para testar se a tabela existe
      const users = await prisma.user.findMany({
          orderBy: { id: 'asc' }
      });
      
      // Removemos a senha de cada usuário antes de enviar para o front
      const safeUsers = users.map(({ senha, ...user }) => user);
      
      res.json(safeUsers);
  } catch (err) {
      console.error("❌ Erro detalhado no banco:", err); // ISSO VAI APARECER NO TERMINAL DO VSCODE
      res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// 2. ALTERAR NÍVEL DE ACESSO (PROMOVER/REBAIXAR)
app.put('/api/admin/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { isAdmin } = req.body;
  try {
      const user = await prisma.user.update({
          where: { id: parseInt(id) },
          data: { isAdmin }
      });
      res.json(user);
  } catch (err) {
      res.status(500).json({ error: "Erro ao atualizar permissão" });
  }
});

// 3. EXCLUIR USUÁRIO
app.delete('/api/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
      await prisma.user.delete({
          where: { id: parseInt(id) }
      });
      res.status(204).send();
  } catch (err) {
      res.status(500).json({ error: "Erro ao deletar usuário" });
  }
});

// Rota para exclusão de conta pelo próprio usuário
// No topo do arquivo: const bcrypt = require('bcrypt'); (ou import se usar ES Modules)

app.put('/api/users/delete-account', async (req, res) => {
  const { userId, password } = req.body;
  const id = parseInt(userId);

  try {
      const user = await prisma.user.findUnique({ where: { id } });

      if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

      // LOG DE DEBUG PARA VOCÊ VER NO TERMINAL
      console.log("Senha digitada:", password);
      console.log("Senha no banco (Hash):", user.password); // MUDOU DE .senha PARA .password

      // 1. Validar a senha (usando o campo password do seu schema)
      const isMatch = await bcrypt.compare(password, user.password); 

      if (!isMatch) {
          return res.status(401).json({ message: "Senha atual incorreta." });
      }

      // 2. Limpeza de dependências (usando os nomes do seu schema)
      // Deleta as builds e os pedidos vinculados
      await prisma.build.deleteMany({ where: { userId: id } });
      await prisma.order.deleteMany({ where: { userId: id } });

      // 3. Deleta o usuário
      await prisma.user.delete({ where: { id } });

      res.json({ message: "Conta excluída com sucesso." });
      
  } catch (error) {
      console.error("Erro ao excluir conta:", error.message);
      res.status(500).json({ message: "Erro interno no servidor." });
  }
});
// Exemplo de rota no Express (backend/server.js ou routes/pecas.js)
app.get('/api/pecas/:id/historico', async (req, res) => {
  const { id } = req.params;
  try {
      const historico = await prisma.priceHistory.findMany({
          where: { componentId: parseInt(id) },
          orderBy: { data: 'asc' }, // Do mais antigo para o mais novo
          select: {
              preco: true,
              data: true
          }
      });
      res.json(historico);
  } catch (error) {
      res.status(500).json({ error: "Erro ao buscar histórico" });
  }
});

startServer();