import React, { useState } from 'react';
import { Search, ShoppingBag, Truck, ShieldCheck, UserCheck, Shield, Briefcase } from 'lucide-react';

export function Navbar({
  searchTerm,
  setSearchTerm,
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onOpenPartnerModal,
  currentUser
}) {
  return (
    <header className="navbar-container glass-panel sticky-top">
      {/* Top micro-bar */}
      <div className="top-micro-bar">
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

      {/* Main Header */}
      <div className="container main-header-row">
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
          <div className="delivery-highlight-badge hide-mobile">
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
            <div className="cart-text-wrap hide-mobile">
              <span className="cart-label">Meu Carrinho</span>
              <span className="cart-sublabel font-bold text-cyan">
                {cartCount === 0 ? 'Vazio' : `${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
