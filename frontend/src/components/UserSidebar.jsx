import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserSidebar.css';
// Adicionei FaTools para o ícone do painel admin
import { FaBoxOpen, FaClipboardList, FaUserCog, FaSignOutAlt, FaTools , FaUsers} from 'react-icons/fa';

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
        {user.isAdmin && (
          <>
            <Link to="/admin" className="sidebar-link admin-link" onClick={onClose}>
              <FaTools /> Painel de Pedidos
            </Link>
            <Link to="/estoque" className="sidebar-link admin-link" onClick={onClose}>
              <FaBoxOpen /> Gerenciar Estoque
            </Link>
            {/* NOVO LINK ADICIONADO ABAIXO */}
            <Link to="/usuarios" className="sidebar-link admin-link" onClick={onClose}>
              <FaUsers /> Gestão de Usuários
            </Link>
          </>
        )}

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