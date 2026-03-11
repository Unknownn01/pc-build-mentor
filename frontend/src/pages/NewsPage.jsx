import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NewsPage.css'; // Vamos criar este arquivo de estilo a seguir
import { API_BASE_URL } from '../config'; // Ajuste o caminho '../' conforme necessário

function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Busca 20 notícias da nossa API
        const response = await axios.get(`${API_BASE_URL}/api/news?limit=20`);
        setArticles(response.data);
      } catch (err) {
        setError('Não foi possível carregar as notícias.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="news-page-container">
      <div className="news-page-header">
        <h1>Notícias de Hardware</h1>
        <p>Fique por dentro das últimas novidades do mundo da tecnologia e PC gaming.</p>
      </div>

      {isLoading && <p className="loading-message">Carregando notícias...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="news-page-grid">
        {articles.map((article, index) => (
          <a href={article.link} target="_blank" rel="noopener noreferrer" key={index} className="news-page-card">
            {/* Idealmente, teríamos uma imagem, mas o texto é o foco */}
            <div className="news-card-content">
              <h3>{article.title}</h3>
              <p className="snippet">{article.contentSnippet}</p>
              <div className="card-footer">
                <span className="read-more">Ler Artigo Completo →</span>
                <span className="date">{new Date(article.isoDate).toLocaleDateString()}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default NewsPage;