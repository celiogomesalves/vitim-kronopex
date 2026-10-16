import React from 'react';
import { MessageCircle, MapPin, Clock, Shield, Sparkles } from 'lucide-react';

export function Footer({ onOpenAdmin, onOpenPartnerModal, currentUser }) {
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
          <h4 className="footer-heading font-bold text-sm mb-3">Parcerias & Área Restrita</h4>
          <p className="text-xs text-muted mb-3">
            Distribuidores parceiros e equipe operacional KronoPex.
          </p>
          <div className="space-y-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={onOpenPartnerModal}
              className="btn btn-outline-primary btn-sm flex-center gap-2 w-full"
            >
              <span>Seja um Fornecedor Parceiro</span>
            </button>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="btn btn-secondary btn-sm flex-center gap-2 w-full"
            >
              <Shield size={15} className="text-cyan" />
              <span>
                {currentUser
                  ? `Painel (${currentUser.roleName})`
                  : 'Acessar Painel / Equipe'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar text-center text-xs text-muted border-top">
        <div className="container flex-between py-3">
          <span>&copy; {new Date().getFullYear()} KronoPex Auto Peças & Delivery. Todos os direitos reservados.</span>
          <div className="flex-center gap-3">
            <a href="/privacidade.html" target="_blank" rel="noopener noreferrer" className="hover-underline text-muted">
              Privacidade
            </a>
            <span>•</span>
            <a href="/termos.html" target="_blank" rel="noopener noreferrer" className="hover-underline text-muted">
              Termos de Uso
            </a>
            <span>•</span>
            <span className="flex-center gap-1">
              Plataforma Appwrite & FCM
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
