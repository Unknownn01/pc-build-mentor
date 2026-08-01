import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { FaTrash, FaUserShield, FaUserEdit, FaUser } from 'react-icons/fa';
import './UserManager.css';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';

function UserManager({ currentUser }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/admin/users`);
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Erro ao carregar usuários:", err);
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const toggleAdmin = async (userId, currentStatus) => {
        if (userId === currentUser.id) {
            toast.error("Você não pode alterar seu próprio nível de acesso!");
            return;
        }

        const confirmMsg = currentStatus 
            ? "Rebaixar para CLIENTE?" 
            : "Promover para ADMIN? Este usuário terá controle total do sistema.";
            
        if (window.confirm(confirmMsg)) {
            try {
                await axios.put(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
                    isAdmin: !currentStatus
                });
                fetchUsers();
            } catch (err) {
                toast.error("Erro ao alterar permissão.");
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        const result = await Swal.fire({
            title: 'Excluir Utilizador?',
            text: "Esta ação removerá permanentemente o acesso deste utilizador!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar',
            background: '#161B22',
            color: '#fff'
        });
    
        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_BASE_URL}/api/admin/users/${id}`);
                toast.success("Utilizador excluído com sucesso!");
                fetchUsers();
            } catch (err) {
                console.error("Erro ao excluir:", err);
                toast.error("Não foi possível excluir o utilizador.");
            }
        }
    };

    if (loading) return <div className="loading">Carregando usuários...</div>;

    return (
        <div className="user-manager-container">
            <header className="user-header">
                <h1>👥 Gestão de Usuários</h1>
                <p>Controle de níveis de acesso e contas cadastradas</p>
            </header>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>NOME</th>
                            <th>EMAIL</th>
                            <th>NÍVEL</th>
                            <th>AÇÕES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className={user.id === currentUser.id ? "current-user-row" : ""}>
                                <td>#{user.id}</td>
                                <td>{user.nome} {user.id === currentUser.id && "(Você)"}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`badge-role ${user.isAdmin ? 'admin' : 'client'}`}>
                                        {user.isAdmin ? <><FaUserShield /> ADMIN</> : <><FaUser /> CLIENTE</>}
                                    </span>
                                </td>
                                <td>
                                    <button 
                                        className={`btn-action ${user.isAdmin ? 'demote' : 'promote'}`}
                                        title={user.isAdmin ? "Remover Admin" : "Tornar Admin"}
                                        onClick={() => toggleAdmin(user.id, user.isAdmin)}
                                    >
                                        <FaUserEdit />
                                    </button>
                                    <button 
                                        className="btn-action delete"
                                        title="Excluir Usuário"
                                        onClick={() => handleDeleteUser(user.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UserManager;