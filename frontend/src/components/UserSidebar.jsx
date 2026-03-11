// ARQUIVO: frontend/src/components/UserSidebar.jsx
// (NOVO ARQUIVO)

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserSidebar.css';
import { FaBoxOpen, FaClipboardList, FaUserCog, FaSignOutAlt } from 'react-icons/fa';

function UserSidebar({ user, isOpen, onClose, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onClose();
    onLogout();
    navigate('/');
  };

  return (
    <>
      <div className={`sidebar-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`user-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Área do Usuário</h3>
          <span>{user.username}</span>
        </div>
        <nav className="sidebar-nav">
          <Link to="/builds-salvas" className="sidebar-link" onClick={onClose}>
            <FaBoxOpen /> Builds Salvas
          </Link>
          <Link to="/pedidos" className="sidebar-link" onClick={onClose}>
            <FaClipboardList /> Pedidos Feitos
          </Link>
          <Link to="/conta" className="sidebar-link" onClick={onClose}>
            <FaUserCog /> Minha Conta
          </Link>
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogoutClick}>
            <FaSignOutAlt /> Sair
          </button>
        </div>
      </aside>
    </>
  );
}

export default UserSidebar;