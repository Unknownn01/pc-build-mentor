# PC Build Mentor 🖥️

Sistema inteligente de montagem de PC com análise de desempenho, detecção de gargalos e recomendações personalizadas.

## 🚀 Features

- ✅ Montador de PC interativo
- ✅ Análise de desempenho multidimensional
- ✅ Detecção automática de gargalos
- ✅ Simulação de desempenho em 12 jogos populares
- ✅ Recomendações inteligentes
- ✅ Análise de custo-benefício
- ✅ Seletor de propósito de uso (Jogos, Edição, Trabalho, Modelagem, IA)
- ✅ 35 builds pré-montadas otimizadas
- ✅ Comparador de componentes
- ✅ Sistema de autenticação
- ✅ Carrinho de compras

## 📦 Tecnologias

### Frontend
- React 18
- React Router
- Axios
- React Icons
- Vite

### Backend
- Node.js
- Express
- CSV Parser
- Bcrypt
- CORS

## 🛠️ Instalação Local

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### Passos

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd pc-build-mentor
```

2. Instale as dependências:
```bash
npm run install-all
```

3. Inicie o backend:
```bash
cd backend
npm run dev
```

4. Em outro terminal, inicie o frontend:
```bash
cd frontend
npm run dev
```

5. Acesse: `http://localhost:5173`

## 🌐 Deploy na Vercel

### Opção 1: Via CLI (Recomendado)

1. Instale a Vercel CLI:
```bash
npm install -g vercel
```

2. Faça login na Vercel:
```bash
vercel login
```

3. Na raiz do projeto, execute:
```bash
vercel
```

4. Siga as instruções:
   - Set up and deploy? **Y**
   - Which scope? Selecione sua conta
   - Link to existing project? **N**
   - What's your project's name? **pc-build-mentor**
   - In which directory is your code located? **./**
   - Want to override the settings? **N**

5. Para deploy em produção:
```bash
vercel --prod
```

### Opção 2: Via Dashboard da Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub/GitLab/Bitbucket
3. Clique em "Add New Project"
4. Importe seu repositório
5. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install`

6. Clique em "Deploy"

### Variáveis de Ambiente (se necessário)

Se você adicionar variáveis de ambiente no futuro, configure-as em:
- Vercel Dashboard → Project → Settings → Environment Variables

## 📁 Estrutura do Projeto

```
pc-build-mentor/
├── backend/
│   ├── services/
│   │   ├── performanceAnalyzer.js
│   │   └── recommendationEngine.js
│   ├── server.js
│   ├── *.csv (dados)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── vercel.json
├── package.json
└── README.md
```

## 🎮 Funcionalidades Principais

### 1. Seletor de Propósito
Escolha entre 5 categorias de uso:
- 🎮 Jogos
- 🎬 Edição de Vídeo
- 💼 Trabalho/Escritório
- 🏗️ Modelagem 3D
- 🤖 IA/Machine Learning

### 2. Análise Inteligente
- Análises contextualizadas por propósito
- Detecção de gargalos específica
- Recomendações personalizadas

### 3. Simulação de Jogos
Veja como seu PC rodará:
- Cyberpunk 2077
- Red Dead Redemption 2
- GTA V
- Fortnite
- Valorant
- CS2
- E mais...

### 4. Builds Pré-montadas
35 builds otimizadas:
- 15 para Jogos (Entry até 4K)
- 5 para Edição
- 5 para Trabalho
- 5 para Modelagem
- 5 para IA

## 🔧 Configuração Avançada

### Backend API
O backend roda em `/api/*` e fornece:
- `/api/processadores` - Lista de CPUs
- `/api/placas-de-video` - Lista de GPUs
- `/api/builds/analyze` - Análise de build
- `/api/builds/simulate-performance` - Simulação de jogos
- `/api/builds/recommendations` - Recomendações

### Frontend
O frontend é uma SPA React que consome a API do backend.

## 📝 Notas Importantes

1. **CSV Files**: Os arquivos CSV no backend contêm os dados dos componentes. Certifique-se de que estão no formato correto.

2. **CORS**: O backend está configurado para aceitar requisições de qualquer origem. Em produção, considere restringir isso.

3. **Autenticação**: O sistema usa bcrypt para hash de senhas. As senhas são armazenadas em CSV (para produção, considere usar um banco de dados real).

4. **Performance**: Para melhor performance em produção, considere:
   - Migrar de CSV para banco de dados (PostgreSQL, MongoDB)
   - Implementar cache
   - Otimizar imagens

## 🐛 Troubleshooting

### Erro: "Cannot find module"
```bash
npm run install-all
```

### Erro: "Port already in use"
Mude a porta no `backend/server.js` ou mate o processo:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Build falha na Vercel
Verifique:
1. Todas as dependências estão no package.json
2. O comando de build está correto
3. Não há erros de sintaxe no código

## 📄 Licença

MIT

## 👨‍💻 Autor

Desenvolvido com ❤️ para ajudar pessoas a montarem o PC perfeito!

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

---

**Nota**: Este é um projeto educacional/demonstrativo. Para uso em produção, considere implementar:
- Banco de dados real
- Autenticação JWT
- Testes automatizados
- CI/CD
- Monitoramento
- Rate limiting
- Validação de dados mais robusta
