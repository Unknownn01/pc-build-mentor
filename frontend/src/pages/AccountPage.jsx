// ARQUIVO: frontend/src/pages/AccountPage.jsx
// (ATUALIZADO PARA O VISUAL DE CARD ÚNICO)

import React, { useState } from 'react';
import axios from 'axios';
import { FaUserEdit, FaLock, FaEnvelope, FaTimes } from 'react-icons/fa';
import './AccountPage.css';
import { API_BASE_URL } from '../config'; // Ajuste o caminho '../' conforme necessário



// --- Componente do Modal Genérico (sem alterações) ---
const UpdateModal = ({ modalType, currentUser, setCurrentUser, onClose }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [newValue, setNewValue] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const getModalInfo = () => {
        switch (modalType) {
            case 'name': return { title: 'Alterar Nome de Usuário', fieldLabel: 'Novo Nome de Usuário', inputType: 'text' };
            case 'email': return { title: 'Alterar E-mail', fieldLabel: 'Novo E-mail', inputType: 'email' };
            case 'password': return { title: 'Alterar Senha' };
            default: return {};
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsProcessing(true);
        let url = '';
        let payload = {};

        switch (modalType) {
            case 'name':
                url = `${API_BASE_URL}/users/update/name`;
                payload = { userId: currentUser.id, newUsername: newValue, password: currentPassword };
                break;
            case 'email':
                url = `${API_BASE_URL}/users/update/email`;
                payload = { userId: currentUser.id, newEmail: newValue, password: currentPassword };
                break;
            case 'password':
                if (newPassword !== confirmNewPassword) {
                    setError('As novas senhas não coincidem.');
                    setIsProcessing(false);
                    return;
                }
                url = `${API_BASE_URL}/users/update/password`;
                payload = { userId: currentUser.id, currentPassword, newPassword };
                break;
            default:
                setIsProcessing(false);
                return;
        }

        try {
            const response = await axios.put(url, payload);
            if (response.data.user) {
                setCurrentUser(response.data.user);
            }
            alert(response.data.message);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Ocorreu um erro.');
        } finally {
            setIsProcessing(false);
        }
    };

    const { title, fieldLabel, inputType } = getModalInfo();

    return (
        <div className="modal-backdrop-account" onClick={onClose}>
            <div className="modal-content-account" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn-account" onClick={onClose}><FaTimes /></button>
                <h3>{title}</h3>
                <form onSubmit={handleSubmit}>
                    {error && <p className="error-message">{error}</p>}
                    {modalType !== 'password' && (
                        <div className="form-group-account">
                            <label>{fieldLabel}</label>
                            <input type={inputType} value={newValue} onChange={(e) => setNewValue(e.target.value)} required />
                        </div>
                    )}
                    <div className="form-group-account">
                        <label>Senha Atual</label>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                    </div>
                    {modalType === 'password' && (
                        <>
                            <div className="form-group-account">
                                <label>Nova Senha</label>
                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                            </div>
                            <div className="form-group-account">
                                <label>Confirmar Nova Senha</label>
                                <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
                            </div>
                        </>
                    )}
                    <button type="submit" className="btn-confirm-update" disabled={isProcessing}>
                        {isProcessing ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Componente da Página Principal ---
function AccountPage({ currentUser, setCurrentUser }) {
  const [modalType, setModalType] = useState(null);

  if (!currentUser) {
    return (
      <div className="account-container">
        <div className="error-screen">
          Você precisa estar logado para acessar esta página.
        </div>
      </div>
    );
  }

  return (
    <div className="account-container">
      <div className="account-header">
        <h1>Minha Conta</h1>
        <p>Gerencie suas informações pessoais e de segurança.</p>
      </div>
      
      <div className="account-card-large">
        {/* Linha do Nome de Usuário */}
        <div className="account-info-row">
          <div className="info-group">
            <FaUserEdit className="info-icon" />
            <div>
              <span className="info-label">Nome de Usuário</span>
              <p className="info-data">{currentUser.username}</p>
            </div>
          </div>
          <button className="btn-edit-account" onClick={() => setModalType('name')}>Alterar</button>
        </div>

        {/* Linha do Email */}
        <div className="account-info-row">
          <div className="info-group">
            <FaEnvelope className="info-icon" />
            <div>
              <span className="info-label">Email</span>
              <p className="info-data">{currentUser.email}</p>
            </div>
          </div>
          <button className="btn-edit-account" onClick={() => setModalType('email')}>Alterar</button>
        </div>

        {/* Linha da Senha */}
        <div className="account-info-row">
          <div className="info-group">
            <FaLock className="info-icon" />
            <div>
              <span className="info-label">Senha</span>
              <p className="info-data">********</p>
            </div>
          </div>
          <button className="btn-edit-account" onClick={() => setModalType('password')}>Alterar</button>
        </div>
      </div>

      {modalType && (
        <UpdateModal
          modalType={modalType}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          onClose={() => setModalType(null)}
        />
      )}
    </div>
  );
}

export default AccountPage;
