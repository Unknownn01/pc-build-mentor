// ARQUIVO: frontend/src/components/CheckoutModal.jsx
// (NOVO ARQUIVO)

import React, { useState, useMemo } from 'react';
import axios from 'axios';
import './CheckoutModal.css';
import { API_BASE_URL } from '../config'; // Ajuste o caminho '../' conforme necessário
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';


function CheckoutModal({ build, currentUser, onClose }) {
  const [assemblyOption, setAssemblyOption] = useState('separadas');
  const [address, setAddress] = useState({ rua: '', numero: '', bairro: '', cidade: '', estado: '', cep: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const buildData = useMemo(() => build.buildData ? (typeof build.buildData === 'string' ? JSON.parse(build.buildData) : build.buildData) : {}, [build.buildData]);
  const subtotal = useMemo(() => Object.values(buildData).reduce((total, peca) => total + (peca ? parseFloat(peca.preco, 10) : 0), 0), [buildData]);
  const precoTotal = useMemo(() => {
    const taxaMontagem = assemblyOption === 'montado' ? 200 : 0;
    return subtotal + taxaMontagem;
  }, [subtotal, assemblyOption]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!currentUser) { toast.error("Você precisa estar logado para finalizar o pedido."); return; }
    if (!Object.values(address).every(field => field.trim() !== '')) { toast.error("Por favor, preencha todos os campos do endereço."); return; }

    setIsProcessing(true);
    try {
        await axios.post(`${API_BASE_URL}/api/orders/create`, {
            userId: currentUser.id,
            total: precoTotal.toFixed(2),
            assemblyChoice: assemblyOption,
            shippingAddress: address,
            items: buildData
        });
        Swal.fire({
          title: 'Pedido Finalizado!',
          text: 'Você pode visualizá-lo na página "Meus Pedidos".',
          icon: 'success',
          background: '#161B22',
          color: '#fff',
          confirmButtonColor: '#5bc3e2'
      });
        onClose();
    } catch (error) {
        toast.error("Houve um erro ao processar seu pedido.");
        console.error("Erro ao criar pedido:", error);
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-modal-backdrop" onClick={onClose}>
      <div className="checkout-modal-content" onClick={e => e.stopPropagation()}>
        <h2>Finalizar Pedido</h2>
        <form onSubmit={handleSubmitOrder}>
          <div className="form-section">
            <h4>Opções de Montagem</h4>
            <div className={`assembly-option ${assemblyOption === 'separadas' ? 'selected' : ''}`} onClick={() => setAssemblyOption('separadas')}>
              <strong>Receber Peças Separadas</strong>
              <span>+ R$ 0,00</span>
            </div>
            <div className={`assembly-option ${assemblyOption === 'montado' ? 'selected' : ''}`} onClick={() => setAssemblyOption('montado')}>
              <strong>Receber PC Montado (+R$ 200,00)</strong>
              <span>Taxa de montagem e testes</span>
            </div>
          </div>
          <div className="form-section">
            <h4>Endereço de Entrega</h4>
            <div className="address-grid">
              <input name="rua" placeholder="Rua / Avenida" onChange={handleInputChange} required />
              <input name="numero" placeholder="Número" onChange={handleInputChange} required className="input-small"/>
              <input name="bairro" placeholder="Bairro" onChange={handleInputChange} required className="input-large"/>
              <input name="cidade" placeholder="Cidade" onChange={handleInputChange} required className="input-large"/>
              <input name="estado" placeholder="Estado" onChange={handleInputChange} required className="input-small"/>
              <input name="cep" placeholder="CEP" onChange={handleInputChange} required />
            </div>
          </div>
          <div className="checkout-summary">
            <span>Subtotal das Peças:</span>
            <span>R$ {subtotal.toFixed(2)}</span>
            <span>Taxa de Montagem:</span>
            <span>R$ {(assemblyOption === 'montado' ? 200 : 0).toFixed(2)}</span>
            <strong className="total-price">Valor Total:</strong>
            <strong className="total-price">R$ {precoTotal.toFixed(2)}</strong>
          </div>
          <button type="submit" className="btn-submit-order" disabled={isProcessing}>
            {isProcessing ? 'Processando...' : 'Confirmar Pedido'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CheckoutModal;