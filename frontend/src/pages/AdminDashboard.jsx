import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './AdminDashboard.css';

function AdminDashboard() {
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                console.log("📡 Buscando pedidos em:", `${API_BASE_URL}/api/admin/orders`);
                const res = await axios.get(`${API_BASE_URL}/api/admin/orders`);
                console.log("✅ Dados recebidos:", res.data);
                setAllOrders(res.data);
            } catch (err) {
                console.error("❌ Erro ao buscar pedidos:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await axios.patch(`${API_BASE_URL}/api/orders/${orderId}/status`, { status: newStatus });
            setAllOrders(allOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            alert("Status atualizado!");
        } catch (err) {
            console.error(err);
            alert("Erro ao atualizar status.");
        }
    };

    if (loading) return <div style={{padding: '100px', color: 'white'}}>Carregando painel...</div>;

    return (
        <div className="admin-container">
            <h1>Painel Técnico - Gestão de Pedidos</h1>
            
            {allOrders.length === 0 ? (
                <p style={{color: 'white'}}>Nenhum pedido encontrado no banco.</p>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Total</th>
                                <th>Status Atual</th>
                                <th>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allOrders.map(order => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>{order.user?.name || 'Cliente'}</td>
                                    <td>R$ {order.total?.toFixed(2)}</td>
                                    <td>
                                        <span className={`status-text status-${order.status?.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <select 
                                            className="status-select"
                                            value={order.status} 
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                        >
                                            {["PENDENTE", "PROCESSANDO", "MONTAGEM", "PRONTO", "ENTREGUE", "CANCELADO"].map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;