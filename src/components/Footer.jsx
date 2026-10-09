import React from 'react';
import { MessageCircle, MapPin, Clock, Shield, Sparkles } from 'lucide-react';

export function Footer({ onOpenAdmin, currentUser }) {
  return (
    <footer className="footer-section">
      <div className="container footer-grid">
        {/* Brand Column */}
        <div className="footer-brand-col">
          <img
            src="/logo.png"
            alt="KronoPex Auto Peças"
            className="footer-logo-img"
          />
          <p className="footer-about-text text-sm text-muted">
            Especialistas em autopeças de alta performance e reposição original.
            Agilidade, procedência e entrega expressa para mecânicos e proprietários.
          </p>

          <div className="social-links-row flex-center gap-3">
            <a
              href="https://www.instagram.com/kronopex?obrf=d2IydWYyYXp0NjNm"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn instagram-btn flex-center gap-2"
              title="Siga a KronoPex no Instagram"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span>@kronopex</span>
            </a>

            <a
              href="https://wa.me/5511999998888"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn whatsapp-btn flex-center gap-2"
              title="Atendimento WhatsApp"
            >
              <MessageCircle size={17} />
              <span>WhatsApp Oficial</span>
            </a>
          </div>
        </div>

        {/* Operating Hours & Info */}
        <div className="footer-info-col">
          <h4 className="footer-heading font-bold text-sm mb-3">Atendimento & Despacho</h4>
          <ul className="footer-info-list text-xs text-muted">
            <li className="flex-center gap-2 mb-2">
              <Clock size={15} className="text-cyan" />
              <span>Segunda a Sexta: 08:00 às 18:30 | Sábado: 08:00 às 14:00</span>
            </li>
            <li className="flex-center gap-2 mb-2">
              <MapPin size={15} className="text-cyan" />
              <span>São Paulo - SP | Atendimento & KronoPex Delivery para toda a região</span>
            </li>
            <li className="flex-center gap-2">
              <Sparkles size={15} className="text-cyan" />
              <span>Despacho rápido via motoboy para oficinas mecânicas parceiras</span>
            </li>
          </ul>
        </div>

        {/* Admin / Staff Portal Discrete Access */}
        <div className="footer-staff-col">
          <h4 className="footer-heading font-bold text-sm mb-3">Área Restrita da Equipe</h4>
          <p className="text-xs text-muted mb-3">
            Acesso reservado para administradores, gerentes de estoque e operadores de entrega.
          </p>
          <button
            onClick={onOpenAdmin}
            className="btn btn-secondary btn-sm flex-center gap-2 w-full"
          >
            <Shield size={15} className="text-cyan" />
            <span>
              {currentUser
                ? `Painel de Gestão (${currentUser.roleName})`
                : 'Acessar Painel Administrativo'}
            </span>
          </button>
        </div>
      </div>

      <div className="footer-bottom-bar text-center text-xs text-muted border-top">
        <div className="container flex-between py-3">
          <span>&copy; {new Date().getFullYear()} KronoPex Auto Peças & Delivery. Todos os direitos reservados.</span>
          <span className="flex-center gap-1">
            Plataforma Integrada AppWrite & FCM
          </span>
        </div>
      </div>
    </footer>
  );
}
