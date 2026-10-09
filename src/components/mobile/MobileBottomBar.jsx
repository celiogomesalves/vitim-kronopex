import React from 'react';
import { Home, Search, Layers, ShoppingBag, MessageCircle } from 'lucide-react';

export function MobileBottomBar({
  cartCount,
  onOpenCart,
  onFocusSearch,
  onScrollToCategories,
  onOpenWhatsApp
}) {
  return (
    <nav className="mobile-bottom-nav-bar glass-panel" aria-label="Navegação rápida móvel">
      <button
        type="button"
        className="mobile-nav-item"
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <Home size={20} />
        <span>Início</span>
      </button>

      <button
        type="button"
        className="mobile-nav-item"
        onClick={onFocusSearch}
      >
        <Search size={20} />
        <span>Buscar</span>
      </button>

      <button
        type="button"
        className="mobile-nav-item"
        onClick={onScrollToCategories}
      >
        <Layers size={20} />
        <span>Prateleiras</span>
      </button>

      <button
        type="button"
        className="mobile-nav-item cart-nav-item"
        onClick={onOpenCart}
      >
        <div className="mobile-cart-icon-box">
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span className="mobile-cart-badge">{cartCount}</span>
          )}
        </div>
        <span>Carrinho</span>
      </button>

      <button
        type="button"
        className="mobile-nav-item whatsapp-nav-item"
        onClick={onOpenWhatsApp}
      >
        <MessageCircle size={20} className="text-green" />
        <span>WhatsApp</span>
      </button>
    </nav>
  );
}
