// Responsável por montar a página inicial com os componentes.

import React from 'react';

import Hero from '../components/hero.jsx';
import NewsSection from '../components/NewsSection.jsx';
import HowToUseSection from '../components/HowToUseSection.jsx';

function HomePage() {
  return (
    <>
      <Hero />
      <NewsSection />
      <HowToUseSection />
    </>
  );
}

export default HomePage;