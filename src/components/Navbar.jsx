import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Shield,
  Briefcase,
  Menu,
  X,
  Layers,
  Home,
  MessageCircle,
  Sparkles,
  PhoneCall
} from 'lucide-react';

export function Navbar({
  searchTerm,
  setSearchTerm,
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onOpenPartnerModal,
  currentUser,
  isMobileMenuOpen: controlledMenuOpen,
  setIsMobileMenuOpen: setControlledMenuOpen
}) {
  const [localMobileMenuOpen, setLocalMobileMenuOpen] = useState(false);
  const isMobileMenuOpen = controlledMenuOpen !== undefined ? controlledMenuOpen : localMobileMenuOpen;
  const setIsMobileMenuOpen = setControlledMenuOpen !== undefined ? setControlledMenuOpen : setLocalMobileMenuOpen;

  const handleScrollToCategories = () => {
    setIsMobileMenuOpen(false);
    const el = document.querySelector('.category-filter-wrapper');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="navbar-container glass-panel sticky-top">
        {/* Top micro-bar (DESKTOP ONLY - Hidden on Mobile to prevent any horizontal overflow) */}
        <div className="top-micro-bar hide-mobile">
          <div className="container flex-between text-xs">
            <div className="flex-center gap-2">
              <span className="pulse-dot"></span>
              <span className="font-semibold text-cyan">KRONOPEX DELIVERY:</span>
              <span>Entregas expressas para oficinas e residências</span>
            </div>
            <div className="top-micro-links flex-center gap-4">
              <span className="flex-center gap-1 text-muted">
                <ShieldCheck size={14} className="text-cyan" /> 100% Peças Originais
              </span>
              <button
                onClick={onOpenPartnerModal}
                className="partner-access-pill flex-center gap-1"
                title="Cadastre sua distribuidora para vender na KronoPex"
              >
                <Briefcase size={13} />
                <span>Seja um Parceiro / Distribuidor</span>
              </button>
              <button
                onClick={onOpenAdmin}
                className="admin-access-pill flex-center gap-1"
                title="Acesso da equipe e administradores"
              >
                <Shield size={13} />
                <span>{currentUser ? `${currentUser.roleName} (${currentUser.name.split(' ')[0]})` : 'Acesso Equipe'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Main Header */}
        <div className="container main-header-row hide-mobile">
          {/* Brand Logo */}
          <div className="brand-logo-area">
            <a href="#" className="logo-link">
              <img
                src="/logo.png"
                alt="KronoPex Auto Peças"
                className="brand-logo-img"
              />
            </a>
          </div>

          {/* Global Live Search */}
          <div className="search-bar-wrapper">
            <div className="search-input-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Busque por peça, código OEM ou modelo (ex: Pastilha, Gol G5, Civic, 5W30)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Controls */}
          <div className="header-actions">
            {/* Fast Delivery Info */}
            <div className="delivery-highlight-badge">
              <div className="delivery-icon-box">
                <Truck size={20} className="text-cyan" />
              </div>
              <div className="delivery-text-box">
                <span className="delivery-title">Delivery Rápido</span>
                <span className="delivery-subtitle">Enviamos hoje mesmo</span>
              </div>
            </div>

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="cart-trigger-btn"
              aria-label="Abrir carrinho de compras"
            >
              <div className="cart-icon-wrap">
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="cart-badge-count">{cartCount}</span>
                )}
              </div>
              <div className="cart-text-wrap">
                <span className="cart-label">Meu Carrinho</span>
                <span className="cart-sublabel font-bold text-cyan">
                  {cartCount === 0 ? 'Vazio' : `${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Native Mobile App Header (MOBILE ONLY - 100% width, zero horizontal overflow) */}
        <div className="mobile-app-header show-mobile">
          {/* Top Line: [Menu Hambúrguer] [Logo Centralizado] [Carrinho com Badge] */}
          <div className="mobile-header-top-row">
            <button
              type="button"
              className="mobile-icon-btn mobile-hamburger-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Abrir menu lateral"
            >
              <Menu size={24} />
            </button>

            <a href="#" className="mobile-logo-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img
                src="/logo.png"
                alt="KronoPex Auto Peças"
                className="mobile-brand-logo-img"
              />
            </a>

            <button
              type="button"
              onClick={onOpenCart}
              className="mobile-icon-btn mobile-cart-header-btn"
              aria-label="Ver carrinho"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="mobile-header-cart-badge">{cartCount}</span>
              )}
            </button>
          </div>

          {/* Bottom Line: Full-width live search bar */}
          <div className="mobile-search-row">
            <div className="search-input-box mobile-search-box">
              <Search size={18} className="search-icon" />
              <input
                id="main-mobile-search-input"
                type="text"
                placeholder="Qual peça ou carro você procura hoje?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpar busca"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick micro delivery info bar on mobile */}
          <div className="mobile-micro-ticker">
            <span className="pulse-dot"></span>
            <span className="ticker-text font-semibold text-cyan">KRONOPEX DELIVERY:</span>
            <span className="ticker-sub">Entrega expressa para oficinas & residências</span>
          </div>
        </div>
      </header>

      {/* Mobile Slide-in Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-backdrop animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="mobile-menu-drawer animate-slide-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="drawer-header flex-between">
              <img
                src="/logo.png"
                alt="KronoPex Auto Peças"
                className="drawer-brand-logo"
              />
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Fechar menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Drawer Tagline */}
            <div className="drawer-tagline-box">
              <span className="badge badge-express">
                <Sparkles size={12} /> Auto Peças & Delivery Express
              </span>
              <p className="text-xs text-muted mt-1">
                Catálogo completo de peças novas, originais e com procedência.
              </p>
            </div>

            {/* Navigation links */}
            <div className="drawer-nav-group">
              <span className="drawer-group-label">Navegação da Loja</span>
              
              <button
                type="button"
                className="drawer-link-item"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="drawer-link-icon bg-primary-glow">
                  <Home size={18} className="text-cyan" />
                </div>
                <div>
                  <span className="drawer-link-title">Início / Vitrine Principal</span>
                  <span className="drawer-link-desc">Ver todas as peças em destaque</span>
                </div>
              </button>

              <button
                type="button"
                className="drawer-link-item"
                onClick={handleScrollToCategories}
              >
                <div className="drawer-link-icon bg-cyan-glow">
                  <Layers size={18} className="text-cyan" />
                </div>
                <div>
                  <span className="drawer-link-title">Prateleiras & Categorias</span>
                  <span className="drawer-link-desc">Filtrar por motor, freios, suspensão...</span>
                </div>
              </button>
            </div>

            <div className="drawer-nav-group">
              <span className="drawer-group-label">Parcerias & Gestão</span>

              <button
                type="button"
                className="drawer-link-item"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenPartnerModal();
                }}
              >
                <div className="drawer-link-icon bg-green-glow">
                  <Briefcase size={18} className="text-green" />
                </div>
                <div>
                  <span className="drawer-link-title text-green">Seja um Parceiro / Distribuidor</span>
                  <span className="drawer-link-desc">Cadastre sua distribuidora para vender</span>
                </div>
              </button>

              <button
                type="button"
                className="drawer-link-item"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAdmin();
                }}
              >
                <div className="drawer-link-icon bg-warning-glow">
                  <Shield size={18} className="text-warning" />
                </div>
                <div>
                  <span className="drawer-link-title">
                    {currentUser ? `Painel: ${currentUser.roleName}` : 'Acesso Equipe (Painel)'}
                  </span>
                  <span className="drawer-link-desc">Controle de estoque, pedidos e delivery</span>
                </div>
              </button>
            </div>

            {/* Direct WhatsApp Contact Button */}
            <div className="drawer-footer-actions">
              <a
                href="https://wa.me/5511999998888?text=Ol%C3%A1%20KronoPex,%20gostaria%20de%20consultar%20uma%20pe%C3%A7a"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp w-full flex-center gap-2 justify-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageCircle size={18} />
                <span>Atendimento WhatsApp</span>
              </a>

              <div className="drawer-store-info text-center text-xs text-muted mt-3">
                <p>📍 São Paulo - SP</p>
                <p>🕒 Seg a Sex: 08h às 18h30 | Sáb: 08h às 14h</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
