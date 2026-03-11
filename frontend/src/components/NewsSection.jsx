import React from 'react';
import { Link } from 'react-router-dom'; // Importa o Link do React Router para navegação
import './NewsSection.css'; // Mantenha a importação do seu CSS

// Removemos toda a lógica de useState, useEffect e axios. O componente volta a ser simples.
function NewsSection() {
  return (
    <section className="news-section">
      <h2>Notícias Recentes sobre Hardware</h2>

      {/* O card inteiro agora é um link clicável para a página de notícias */}
      <Link to="/noticias" className="featured-news-card">
        <img
          src="https://netshopinformatica.com.br/uploads/content_manager/contents/347/importancia-de-profissionais-qualificados-na-montagem-de-pc-gamer.png" // Sua imagem estática de antes
          alt="PC Gamer com iluminação roxa"
          className="news-image"
        />
        <div className="news-content">
          <h3>Placas de Vídeo de Próxima Geração: Potência Liberada</h3>
          <p>Explore os últimos avanços na tecnologia de gráficos, com ray tracing aprimorado, desempenho refinado e visuais impressionantes.</p>
          {/* O link "Ler Mais" agora é apenas um indicador visual */}
          <span className="read-more-link">Ler Todas as Notícias →</span>
        </div>
      </Link>
    </section>
  );
}

export default NewsSection;