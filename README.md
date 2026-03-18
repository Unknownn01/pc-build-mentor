# PC Build Mentor 🖥️

Sistema inteligente de montagem de PC com análise de desempenho, detecção de gargalos e recomendações personalizadas.

## 🚀 Features

- ✅ Montador de PC interativo
- ✅ Sistema de compatibilidade inteligente
- ✅ Análise de desempenho multidimensional
- ✅ Detecção automática de gargalos
- ✅ Simulação de desempenho em 12 jogos populares
- ✅ Recomendações inteligentes
- ✅ Análise de custo-benefício
- ✅ Seletor de propósito de uso (Jogos, Edição, Trabalho, Modelagem, IA)
- ✅ 25 builds pré-montadas otimizadas
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


📝 Notas do Desenvolvedor
Segurança: Senhas são protegidas com Salt/Hash via Bcrypt.
Performance: As análises de hardware são processadas no backend para manter o frontend leve.
UX: O sistema utiliza Skeleton Loading e estados de carregamento para uma navegação fluida.

👨‍💻 Autor
Desenvolvido por Gabriel Lopes — Projeto para conclusão de TCC focado em Hardware e Desenvolvimento Web.
- Rate limiting
- Validação de dados mais robusta
