import React, { useState } from 'react';
import axios from 'axios';
import { FaUserEdit, FaLock, FaEnvelope, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import './AccountPage.css';
import { API_BASE_URL } from '../config';

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
            case 'delete': return { title: 'Excluir Minha Conta', fieldLabel: 'Digite seu e-mail para confirmar', inputType: 'email' };
            default: return {};
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsProcessing(true);
        let url = '';
        let payload = {};

        try {
            switch (modalType) {
                case 'name':
                    url = `${API_BASE_URL}/api/users/update/name`;
                    payload = { userId: currentUser.id, newUsername: newValue, password: currentPassword };
                    break;
                case 'email':
                    url = `${API_BASE_URL}/api/users/update/email`;
                    payload = { userId: currentUser.id, newEmail: newValue, password: currentPassword };
                    break;
                case 'password':
                    if (newPassword !== confirmNewPassword) throw new Error('As novas senhas não coincidem.');
                    url = `${API_BASE_URL}/api/users/update/password`;
                    payload = { userId: currentUser.id, currentPassword, newPassword };
                    break;
                case 'delete':
                    if (newValue !== currentUser.email) throw new Error('O e-mail digitado não coincide com sua conta.');
                    if (!window.confirm("⚠️ ATENÇÃO: Esta ação é irreversível. Todos os seus dados serão apagados. Deseja continuar?")) {
                        setIsProcessing(false);
                        return;
                    }
                    url = `${API_BASE_URL}/api/users/delete-account`;
                    payload = { userId: currentUser.id, password: currentPassword };
                    break;
                default: return;
            }

            const response = await axios.put(url, payload);
            
            if (modalType === 'delete') {
                alert("Conta excluída com sucesso.");
                localStorage.clear(); // Limpa token/dados
                window.location.href = "/"; 
                return;
            }

            if (response.data.user) setCurrentUser(response.data.user);
            alert(response.data.message);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Ocorreu um erro.');
        } finally {
            setIsProcessing(false);
        }
    };

    const { title, fieldLabel, inputType } = getModalInfo();

    return (
        <div className="modal-backdrop-account" onClick={onClose}>
            <div className={`modal-content-account ${modalType === 'delete' ? 'border-danger' : ''}`} onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn-account" onClick={onClose}><FaTimes /></button>
                <h3 className={modalType === 'delete' ? 'danger-text' : ''}>{title}</h3>
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

                    <button type="submit" className={`btn-confirm-update ${modalType === 'delete' ? 'btn-danger-bg' : ''}`} disabled={isProcessing}>
                        {isProcessing ? 'Processando...' : modalType === 'delete' ? 'EXCLUIR MINHA CONTA' : 'Salvar Alterações'}
                    </button>
                </form>
            </div>
        </div>
    );
};

function AccountPage({ currentUser, setCurrentUser }) {
  const [modalType, setModalType] = useState(null);

  if (!currentUser) return <div className="account-container"><div className="error-screen">Faça login para acessar.</div></div>;

  return (
    <div className="account-container">
      <div className="account-header">
        <h1>Minha Conta</h1>
        <p>Gerencie suas informações pessoais e segurança.</p>
      </div>
      
      <div className="account-card-large">
        <div className="account-info-row">
          <div className="info-group">
            <FaUserEdit className="info-icon" />
            <div><span className="info-label">Nome de Usuário</span><p className="info-data">{currentUser.nome || currentUser.name}</p></div>
          </div>
          <button className="btn-edit-account" onClick={() => setModalType('name')}>Alterar</button>
        </div>

        <div className="account-info-row">
          <div className="info-group">
            <FaEnvelope className="info-icon" />
            <div><span className="info-label">Email</span><p className="info-data">{currentUser.email}</p></div>
          </div>
          <button className="btn-edit-account" onClick={() => setModalType('email')}>Alterar</button>
        </div>

        <div className="account-info-row">
          <div className="info-group">
            <FaLock className="info-icon" />
            <div><span className="info-label">Senha</span><p className="info-data">********</p></div>
          </div>
          <button className="btn-edit-account" onClick={() => setModalType('password')}>Alterar</button>
        </div>

        <div className="account-info-row danger-zone">
          <div className="info-group">
            <FaExclamationTriangle className="info-icon danger-text" />
            <div>
              <span className="info-label danger-text">Zona de Perigo</span>
              <p className="info-data">Excluir sua conta e apagar todos os dados.</p>
            </div>
          </div>
          <button className="btn-delete-account" onClick={() => setModalType('delete')}>Excluir Conta</button>
        </div>
      </div>

      {modalType && <UpdateModal modalType={modalType} currentUser={currentUser} setCurrentUser={setCurrentUser} onClose={() => setModalType(null)} />}
    </div>
  );
}

export default AccountPage;