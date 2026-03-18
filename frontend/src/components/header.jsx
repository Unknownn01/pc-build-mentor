// ARQUIVO: frontend/src/components/Header.jsx

import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaUserCircle, FaHome, FaTools, FaDatabase, FaListAlt } from 'react-icons/fa';
import './header.css';

function Header({ currentUser, onUserClick, isScrolled }) {
  return (
    <>
      {/* HEADER PRINCIPAL (TOP BAR) */}
      <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logo">
          <Link to="/" className="logo-container">
            <img 
              src="/images/logo_minimalista.png" 
              className="site-logo" 
              alt="Logo PC Build Mentor"
            />
            <span className="site-title">PC BUILD MENTOR</span> 
          </Link>
        </div>

        {/* Navegação Desktop */}
        <nav className="main-nav">
          <ul>
            <li><NavLink to="/montador">Montador de PC</NavLink></li>
            <li><NavLink to="/guias">Guias de Builds Prontas</NavLink></li>
            <li><NavLink to="/catalogo">Catálogo de Peças</NavLink></li>
            <li><NavLink to="/noticias">Notícias</NavLink></li>
          </ul>
        </nav>

        <div className="auth-buttons">
          {currentUser ? (
            <div className="user-info" onClick={onUserClick} style={{ cursor: 'pointer' }}>
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

      {/* 📱 NAVEGAÇÃO MOBILE (BOTTOM BAR) */}
      <nav className="mobile-bottom-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>
          <FaHome />
          <span>Home</span>
        </NavLink>
        
        <NavLink to="/montador" className={({ isActive }) => isActive ? "active" : ""}>
          <FaTools />
          <span>Montar</span>
        </NavLink>

        <NavLink to="/catalogo" className={({ isActive }) => isActive ? "active" : ""}>
          <FaDatabase />
          <span>Peças</span>
        </NavLink>

        <NavLink to="/guias" className={({ isActive }) => isActive ? "active" : ""}>
          <FaListAlt />
          <span>Builds</span>
        </NavLink>
        
        {/* Clique garantido: style pointer e onClick direto */}
          <div 
          className="mobile-user-btn" 
          onClick={(e) => {
            e.preventDefault();
            console.log("Botão Perfil Clicado!"); // Verifique se isso aparece no F12 do navegador
            onUserClick();
          }} 
          style={{ 
            cursor: 'pointer', 
            zIndex: 9999, 
            position: 'relative',
            pointerEvents: 'auto' 
          }}
        >
          <FaUserCircle />
          <span>{currentUser ? "Perfil" : "Entrar"}</span>
        </div>
      </nav>
    </>
  );
}

export default Header;