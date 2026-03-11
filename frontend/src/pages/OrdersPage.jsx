// ARQUIVO: frontend/src/pages/OrdersPage.jsx
// (ATUALIZADO PARA FUNCIONAR)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BuildDetailModal from '../components/BuildDetailModal.jsx';
import './OrdersPage.css';
import { API_BASE_URL } from '../config'; // Ajuste o caminho '../' conforme necessário


function OrdersPage({ currentUser }) {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            setError("Você precisa estar logado para ver seus pedidos.");
            setIsLoading(false);
            return;
        }
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/orders/user/${currentUser.id}`);
                setOrders(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            } catch (err) {
                setError("Não foi possível carregar seus pedidos.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [currentUser]);

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
                        <div key={order.id} className="order-card" onClick={() => setSelectedOrder(order)}>
                            <div className="order-card-header">
                                <span>Pedido #{order.id}</span> 
                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="order-card-body">
                                <p>Total: <strong>R$ {order.total}</strong></p>
                                <p>Status: <strong>{order.status}</strong></p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {selectedOrder && <BuildDetailModal build={{ buildName: `Detalhes do Pedido #${selectedOrder.id}`, buildData: selectedOrder.items }} onClose={() => setSelectedOrder(null)} />}
        </div>
    );
}

export default OrdersPage;