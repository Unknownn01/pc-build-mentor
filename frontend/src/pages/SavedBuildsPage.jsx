// ARQUIVO: frontend/src/pages/SavedBuildsPage.jsx
// ATUALIZADO PARA POSTGRES/PRISMA

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

    // Função auxiliar para processar as peças (blindagem contra JSON ou Objeto)
    const getParsedPecas = (build) => {
        // No novo banco a coluna chama-se 'pecas'
        const data = build.pecas || build.buildData;
        if (typeof data === 'string') {
            try { return JSON.parse(data); } catch (e) { return {}; }
        }
        return data || {};
    };

    const handleChooseBuild = (build) => {
        const buildData = getParsedPecas(build);
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
                toast.error("Erro ao excluir a build.");
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
            </div>
            {savedBuilds.length === 0 ? (
                <p className="no-builds-message">Você ainda não salvou nenhuma build.</p>
            ) : (
                <div className="saved-builds-grid">
                    {savedBuilds.map(savedBuild => {
                        const buildData = getParsedPecas(savedBuild);
                        // Usa precoTotal direto do banco ou calcula se não existir
                        const precoExibicao = savedBuild.precoTotal || 0;
                        const nomeBuild = savedBuild.nome || savedBuild.buildName || "Build sem nome";

                        return (
                            <div key={savedBuild.id} className="saved-build-card">
                                <button 
                                    className="btn-delete-card" 
                                    onClick={(e) => handleDeleteBuild(savedBuild.id, nomeBuild, e)}
                                >
                                    <FaTrash />
                                </button>
                                <div className="card-content" onClick={() => setSelectedBuild(savedBuild)}>
                                    <h3>{nomeBuild}</h3>
                                    <div className="saved-build-specs">
                                        <p><strong>CPU:</strong> {buildData.cpu?.nome || 'N/A'}</p>
                                        <p><strong>GPU:</strong> {buildData.placaDeVideo?.nome || 'N/A'}</p>
                                    </div>
                                    <p className="saved-build-price">R$ {Number(precoExibicao).toFixed(2)}</p>
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
            {selectedBuild && (
                <BuildDetailModal 
                    build={selectedBuild} 
                    onClose={() => setSelectedBuild(null)} 
                    onChoose={handleChooseBuild} // Essa função que você já criou e funciona!
                    currentUser={currentUser}
                />
            )}
        </div>
    );
}

export default SavedBuildsPage;