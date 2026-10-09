import React from 'react';
import { Truck, ShieldCheck, Zap, PhoneCall, Award } from 'lucide-react';

export function HeroShowcase({ onSelectCategory, onWhatsAppClick }) {
  return (
    <section className="hero-showcase-section">
      <div className="container hero-grid">
        {/* Left: Headline & Value Proposition */}
        <div className="hero-content">
          <div className="hero-tagline flex-center gap-2">
            <span className="badge badge-express">
              <Zap size={13} /> Vitrine Digital de Autopeças
            </span>
            <span className="text-xs text-muted">Estoque 100% atualizado</span>
          </div>

          <h1 className="hero-title">
            A Peça Certa, no Tempo Certo. <br />
            <span className="text-gradient-cyan">Entrega Expressa Direto na Sua Oficina.</span>
          </h1>

          <p className="hero-description">
            Navegue pela nossa vitrine completa de autopeças. Escolha as peças compatíveis com o seu veículo e adicione ao carrinho sem complicações de cadastro prévio.
          </p>

          {/* Quick Value Badges */}
          <div className="hero-features-row">
            <div className="feature-item">
              <div className="feature-icon-circle">
                <Truck size={18} className="text-cyan" />
              </div>
              <div>
                <strong className="block text-sm">KronoPex Delivery</strong>
                <span className="text-xs text-muted">Entrega rápida motoboy/furgão</span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-circle">
                <ShieldCheck size={18} className="text-cyan" />
              </div>
              <div>
                <strong className="block text-sm">Garantia Comprovada</strong>
                <span className="text-xs text-muted">Peças novas e com nota fiscal</span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-circle">
                <Award size={18} className="text-cyan" />
              </div>
              <div>
                <strong className="block text-sm">10% OFF no PIX</strong>
                <span className="text-xs text-muted">Economia direta no fechamento</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Vitrine Banner Card with KronoPex Atmosphere */}
        <div className="hero-banner-visual">
          <div className="showcase-card glass-panel">
            <div className="showcase-header">
              <span className="pulse-indicator"></span>
              <span className="text-xs uppercase tracking-wider font-bold text-cyan">
                Vitrine Oficial KronoPex
              </span>
            </div>
            
            <div className="showcase-highlight-body">
              <div className="showcase-logo-watermark">
                <img src="/logo.png" alt="KronoPex" className="showcase-logo-img" />
              </div>
              <div className="showcase-stats-grid">
                <div className="stat-card">
                  <span className="stat-number text-cyan">2.500+</span>
                  <span className="stat-label">Itens no Catálogo</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number text-cyan">30 min</span>
                  <span className="stat-label">Despacho Médio</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number text-cyan">100%</span>
                  <span className="stat-label">Sem Burocracia</span>
                </div>
              </div>

              <div className="showcase-cta-bar">
                <button
                  onClick={onWhatsAppClick}
                  className="btn btn-secondary w-full flex-center gap-2"
                >
                  <PhoneCall size={16} className="text-cyan" />
                  <span>Dúvida sobre compatibilidade? Fale no WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
