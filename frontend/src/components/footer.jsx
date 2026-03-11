// Responsável pelo rodapé.

import React from 'react';
import { FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import './footer.css';

function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-links">
        <a href="#sobre">Sobre Nós</a>
        <a href="#contato">Contato</a>
        <a href="#politica">Política de Privacidade</a>
        <a href="#termos">Termos de Serviço</a>
      </div>
      <div className="footer-social">
        <a href="#"><FaTwitter /></a>
        <a href="#"><FaInstagram /></a>
        <a href="#"><FaYoutube /></a>
      </div>
      <div className="footer-copyright">
        <p>© 2025 PC Build Mentor. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;