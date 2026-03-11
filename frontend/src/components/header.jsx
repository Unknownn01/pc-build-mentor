// ARQUIVO: frontend/src/components/Header.jsx
// (ATUALIZADO - CATÁLOGO REMOVIDO)

import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import './header.css';

function Header({ currentUser, onUserClick ,isScrolled}) {
  return (
    <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="logo">
        <Link to="/" className="logo-container"> {/* Renomeei a classe para clareza, mas você pode usar "logo" */}
          
          {/* ✨ A TAG DE IMAGEM VEM AQUI DENTRO ✨ */}
          <img 
            src="/images/logo_minimalista.png" // Caminho a partir da pasta publi
            className="site-logo" // Classe para estilizar a imagem
          />
          
          {/* ✨ O NOME DO SITE VEM DEPOIS DA IMAGEM ✨ */}
          <span className="site-title">PC BUILD MENTOR</span> 
          
        </Link> {/* Fim do Link Container */}
      </div>
      <nav className="main-nav">
        <ul>
          <li><Link to="/montador">Montador de PC</Link></li>
          <li><Link to="/guias">Guias de Builds Prontas</Link></li>
          <li><Link to="/catalogo">Catálogo de Peças</Link></li>
          <li><Link to="/noticias">Notícias</Link></li>
        </ul>
      </nav>
      <div className="auth-buttons">
        {currentUser ? (
          <div className="user-info" onClick={onUserClick}>
            <span>Olá, {currentUser.username}!</span>
            <FaUserCircle className="user-icon" />
          </div>
        ) : (
          <>
            <Link to="/register" className="btn btn-secondary">Cadastrar</Link>
            <Link to="/login" className="btn btn-primary">Entrar</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;