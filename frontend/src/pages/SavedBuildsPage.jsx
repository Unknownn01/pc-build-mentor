// ARQUIVO: frontend/src/pages/SavedBuildsPage.jsx
// (ATUALIZADO COM O BOTÃO "LEVAR PARA O MONTADOR")

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash, FaWrench } from 'react-icons/fa';
import BuildDetailModal from '../components/BuildDetailModal.jsx';
import './SavedBuildsPage.css';
import { API_BASE_URL } from '../config'

function SavedBuildsPage({ currentUser, setBuild }) {
    const [savedBuilds, setSavedBuilds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBuild, setSelectedBuild] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            setError("Você precisa estar logado para ver suas builds salvas.");
            setIsLoading(false);
            return;
        }
        const fetchSavedBuilds = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/builds/user/${currentUser.id}`);
                setSavedBuilds(response.data);
            } catch (err) {
                setError("Não foi possível carregar suas builds.");
                console.error("Erro ao buscar builds salvas:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSavedBuilds();
    }, [currentUser]);

    const handleChooseBuild = (build) => {
        const buildData = JSON.parse(build.buildData);
        setBuild(buildData);
        navigate('/montador');
    };

    const handleDeleteBuild = async (buildId, buildName, event) => {
        event.stopPropagation();
        if (window.confirm(`Tem certeza que deseja excluir a build "${buildName}"?`)) {
            try {
                await axios.delete(`${API_BASE_URL}/api/builds/delete/${buildId}`);
                setSavedBuilds(prevBuilds => prevBuilds.filter(b => b.id !== buildId));
            } catch (err) {
                alert("Erro ao excluir a build.");
                console.error(err);
            }
        }
    };

    const handleClearAllBuilds = async () => {
       if (window.confirm("Tem certeza que deseja excluir TODAS as suas builds salvas? Esta ação não pode ser desfeita.")) {
            try {
                await axios.delete(`${API_BASE_URL}/api/builds/clear/${currentUser.id}`);
                setSavedBuilds([]);
            } catch (err) {
                alert("Erro ao limpar as builds.");
                console.error(err);
            }
        }
    };

    if (isLoading) return <div className="loading-screen">Carregando builds salvas...</div>;
    if (error) return <div className="error-screen">{error}</div>;

    return (
        <div className="saved-builds-container">
            <div className="page-header">
                <h1>Minhas Builds Salvas</h1>
                {savedBuilds.length > 0 && (
                    <button onClick={handleClearAllBuilds} className="btn-clear-all">
                        <FaTrash /> Limpar Todas
                    </button>
                )}
            </div>
            {savedBuilds.length === 0 ? (
                <p className="no-builds-message">Você ainda não salvou nenhuma build.</p>
            ) : (
                <div className="saved-builds-grid">
                    {savedBuilds.map(savedBuild => {
                        const buildData = JSON.parse(savedBuild.buildData);
                        const precoTotal = Object.values(buildData).reduce((total, peca) => total + (peca ? parseFloat(peca.preco?.toFixed(2)) : 0), 0);
                        return (
                            <div key={savedBuild.id} className="saved-build-card">
                                <button 
                                    className="btn-delete-card" 
                                    onClick={(e) => handleDeleteBuild(savedBuild.id, savedBuild.buildName, e)}
                                >
                                    <FaTrash />
                                </button>
                                <div className="card-content" onClick={() => setSelectedBuild(savedBuild)}>
                                    <h3>{savedBuild.buildName}</h3>
                                    <div className="saved-build-specs">
                                        <p><strong>CPU:</strong> {buildData.cpu?.nome || 'N/A'}</p>
                                        <p>
                                            <strong>GPU:</strong>
                                            {/* Verifica se a placa de vídeo existe na build salva */}
                                            {buildData.placaDeVideo
                                                // Se existir, monta o nome completo e correto
                                                ? ` ${buildData.placaDeVideo.marca} ${buildData.placaDeVideo.modelo_especifico} ${buildData.placaDeVideo.nome_chip}`
                                                // Se não existir, mostra 'N/A'
                                                : ' N/A'
                                            }
                                            </p>
                                    </div>
                                    <p className="saved-build-price">R$ {precoTotal.toFixed(2)}</p>
                                </div>
                                <div className="build-actions-single">
                                    <button className="btn-action-full" onClick={() => handleChooseBuild(savedBuild)}>
                                        <FaWrench /> Levar para o Montador
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {selectedBuild && <BuildDetailModal build={selectedBuild} onClose={() => setSelectedBuild(null)} currentUser={currentUser} />}
        </div>
    );
}

export default SavedBuildsPage;