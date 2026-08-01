import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserSidebar.css';
import { 
  FaBoxOpen, 
  FaClipboardList, 
  FaUserCog, 
  FaSignOutAlt, 
  FaTools, 
  FaUsers, 
  FaSignInAlt, 
  FaUserPlus,
  FaArrowLeft 
} from 'react-icons/fa';

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
        
        {/* BOTÃO FECHAR PARA MOBILE */}
        <button className="sidebar-close-btn" onClick={onClose}>
          <FaArrowLeft /> Voltar
        </button>

        <div className="sidebar-header">
          <h3>{user ? 'Área do Usuário' : 'Bem-vindo!'}</h3>
          <span>{user ? user.username : 'Identifique-se para continuar'}</span>
        </div>
        
        <nav className="sidebar-nav">
          {user ? (
            /* ==========================================
               CONTEÚDO PARA USUÁRIO LOGADO
               ========================================== */
            <>
              {user.isAdmin && (
                <div className="admin-section">
                  <Link to="/admin" className="sidebar-link admin-link" onClick={onClose}>
                    <FaTools /> Painel de Pedidos
                  </Link>
                  <Link to="/estoque" className="sidebar-link admin-link" onClick={onClose}>
                    <FaBoxOpen /> Gerenciar Estoque
                  </Link>
                  <Link to="/usuarios" className="sidebar-link admin-link" onClick={onClose}>
                    <FaUsers /> Gestão de Usuários
                  </Link>
                </div>
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
            </>
          ) : (
            /* ==========================================
               CONTEÚDO PARA QUEM NÃO ESTÁ LOGADO (A SOLUÇÃO)
               ========================================== */
            <div className="auth-mobile-nav">
              <Link to="/login" className="sidebar-link login-highlight" onClick={onClose}>
                <FaSignInAlt /> Entrar na Conta
              </Link>
              <Link to="/register" className="sidebar-link" onClick={onClose}>
                <FaUserPlus /> Criar nova conta
              </Link>
              
              <div className="auth-message">
                <p>Crie uma conta para salvar suas builds e acompanhar preços em tempo real.</p>
              </div>
            </div>
          )}
        </nav>

        {/* Rodapé da Sidebar só exibe Logout se houver usuário */}
        {user && (
          <div className="sidebar-footer">
            <button className="sidebar-logout-btn" onClick={handleLogoutClick}>
              <FaSignOutAlt /> Sair
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default UserSidebar;