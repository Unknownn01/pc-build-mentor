// ARQUIVO: frontend/src/App.jsx
// (ATUALIZADO - CATÁLOGO REMOVIDO)

import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './config.js';

// Componentes e Páginas
import Header from './components/header.jsx';
import Footer from './components/footer.jsx';
import UserSidebar from './components/UserSidebar.jsx';
import HomePage from './pages/HomePage.jsx';
import MontadorPage from './pages/MontadorPage.jsx';
import GuiasPage from './pages/GuiasPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SavedBuildsPage from './pages/SavedBuildsPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import CatalogoPecas from './pages/CatalogoPecas.jsx';
import NewsPage from './pages/NewsPage'; // Ou o caminho correto para o seu arquivo

import './App.css';

function App() {
  const [build, setBuild] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pecasDisponiveis, setPecasDisponiveis] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
    const isHomePage = location.pathname === '/';
  // Efeito para checar o login salvo no navegador
  useEffect(() => {
    try {
      const loggedInUser = localStorage.getItem("user");
      if (loggedInUser) {
        const foundUser = JSON.parse(loggedInUser);
        setCurrentUser(foundUser);
      }
    } catch (error) {
      console.error("Erro ao ler dados do localStorage:", error);
      localStorage.removeItem("user");
    }
  }, []);

  

  // Efeito para buscar todos os dados da API
  useEffect(() => {
    const API_URL = `${API_BASE_URL}/api`;
    const CATEGORIAS_API = [
        { id: 'cpu', endpoint: 'processadores' }, { id: 'cooler', endpoint: 'refrigeracao' },
        { id: 'placaMae', endpoint: 'placas-mae' }, { id: 'memoria', endpoint: 'memorias-ram' },
        { id: 'armazenamento', endpoint: 'armazenamento' }, { id: 'placaDeVideo', endpoint: 'placas-de-video' },
        { id: 'gabinete', endpoint: 'gabinetes' }, { id: 'fonte', endpoint: 'fontes' },
        { id: 'buildsProntas', endpoint: 'builds-prontas' }
    ];
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
          const requests = CATEGORIAS_API.map(cat => axios.get(`${API_URL}/${cat.endpoint}`));
          const responses = await Promise.all(requests);
          const allData = responses.reduce((acc, response, index) => {
              acc[CATEGORIAS_API[index].id] = response.data;
              return acc;
          }, {});
          setPecasDisponiveis(allData);
      } catch (error) {
          console.error("Erro fatal ao carregar dados da API:", error);
      } finally {
          setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

   // ✨ ADICIONE ESTE BLOCO INTEIRO ✨
    useEffect(() => {
      const handleScroll = () => {
        // Se a posição de rolagem for maior que 10 pixels, marca como "scrolled"
        if (window.scrollY > 10) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
      };

      // Adiciona o "ouvinte" de evento quando o componente é montado
      window.addEventListener('scroll', handleScroll);

      // Limpa o "ouvinte" quando o componente é desmontado (importante para performance)
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, []); // O array vazio [] garante que isso rode apenas uma vez

  
  const handleSetCurrentUser = (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
    setCurrentUser(user);
  };

  const handleLogout = () => {
    handleSetCurrentUser(null);
  };
  
  return (
    <div className="App">
      <Header 
        currentUser={currentUser} 
        onUserClick={() => setIsSidebarOpen(true)}
        isScrolled={isScrolled}
      />
      
      {currentUser && (
        <UserSidebar
          user={currentUser}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
        />
      )}

       <main className={`main-content ${!isHomePage ? 'content-with-padding' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/montador" element={<MontadorPage build={build} setBuild={setBuild} currentUser={currentUser}pecasDisponiveis={pecasDisponiveis}isLoading={isLoading}/>} />
          <Route path="/guias" element={<GuiasPage buildsProntas={pecasDisponiveis.buildsProntas || []} todasPecas={pecasDisponiveis} currentUser={currentUser} isLoading={isLoading} setBuild={setBuild} />} />
          <Route path="/login" element={<LoginPage setCurrentUser={handleSetCurrentUser} />} />
          <Route path="/noticias" element={<NewsPage />} /> 
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/builds-salvas" element={<SavedBuildsPage currentUser={currentUser} setBuild={setBuild}/>} />
          <Route path="/pedidos" element={<OrdersPage currentUser={currentUser} />} />
          <Route path="/conta" element={<AccountPage currentUser={currentUser} setCurrentUser={handleSetCurrentUser} />}/>
          <Route path="/catalogo" element={<CatalogoPecas />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;