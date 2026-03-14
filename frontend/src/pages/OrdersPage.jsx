import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BuildDetailModal from '../components/BuildDetailModal.jsx';
import './OrdersPage.css';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';

function OrdersPage({ currentUser }) {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Função para buscar pedidos
    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/orders/user/${currentUser.id}`);
            // Ordena pelos mais recentes
            setOrders(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            setError("Não foi possível carregar seus pedidos.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!currentUser) {
            setError("Você precisa estar logado para ver seus pedidos.");
            setIsLoading(false);
            return;
        }
        fetchOrders();
    }, [currentUser]);

    // Função para Cancelar Pedido (Lógica de Usuário)
    const handleCancelOrder = async (orderId) => {
        const confirm = window.confirm("Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.");
        
        if (confirm) {
            try {
                await axios.patch(`${API_BASE_URL}/api/orders/${orderId}/cancel`);
                toast.success("Pedido cancelado com sucesso.");
                fetchOrders(); // Recarrega a lista para atualizar o status na tela
            } catch (err) {
                const msg = err.response?.data?.message || "Erro ao cancelar pedido.";
                toast.error(msg);
            }
        }
    };

    if (isLoading) return <div className="loading-screen">Carregando seus pedidos...</div>;
    if (error) return <div className="error-screen">{error}</div>;

    return (
        <div className="orders-container">
            <h1>Meus Pedidos</h1>
            {orders.length === 0 ? (
                <p className="no-orders-message">Você ainda não fez nenhum pedido.</p>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.id} className={`order-card status-${order.status?.toLowerCase()}`}>
                            <div className="order-card-header" onClick={() => setSelectedOrder(order)}>
                                <span>Pedido #{order.id}</span> 
                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="order-card-body" onClick={() => setSelectedOrder(order)}>
                                <p>Total: <strong>R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></p>
                                <p>Status: <span className={`status-badge ${order.status?.toLowerCase()}`}>{order.status}</span></p>
                            </div>

                            {/* LÓGICA DE CANCELAMENTO: Só aparece se o status for inicial */}
                            {["PENDENTE", "PROCESSANDO"].includes(order.status?.toUpperCase()) && (
                                <div className="order-card-footer">
                                    <button 
                                        className="btn-cancel" 
                                        onClick={(e) => {
                                            e.stopPropagation(); // Impede de abrir o modal ao clicar no botão
                                            handleCancelOrder(order.id);
                                        }}
                                    >
                                        Cancelar Pedido
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Mantém a função do Modal de Detalhes */}

            {selectedOrder && (
                <BuildDetailModal 
                    build={{ 
                        // O Modal espera 'buildName' e 'buildData'
                        buildName: `Peças do Pedido #${selectedOrder.id}`, 
                        // Passamos o campo 'items' que contém o JSON das peças
                        buildData: selectedOrder.items 
                    }} 
                    onClose={() => setSelectedOrder(null)} 
                />
            )}
        </div>
    );
}

export default OrdersPage;