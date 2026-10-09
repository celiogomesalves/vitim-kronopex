import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, ShieldCheck } from 'lucide-react';

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  freeDeliveryThreshold = 200.00
}) {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => {
    const itemPrice = item.pixDiscountPrice || item.price;
    return acc + itemPrice * item.quantity;
  }, 0);

  const missingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const deliveryProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  return (
    <div className="cart-backdrop animate-fade-in" onClick={onClose}>
      <aside
        className="cart-drawer glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="cart-drawer-header flex-between">
          <div className="flex-center gap-2">
            <ShoppingBag size={20} className="text-cyan" />
            <h3 className="cart-drawer-title font-bold text-lg">
              Carrinho de Compras
            </h3>
            <span className="cart-items-counter">
              {items.reduce((acc, i) => acc + i.quantity, 0)} itens
            </span>
          </div>
          <button
            onClick={onClose}
            className="cart-close-btn"
            aria-label="Fechar carrinho"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Delivery Bar */}
        <div className="delivery-progress-container">
          <div className="flex-between text-xs mb-1">
            <span className="flex-center gap-1 font-semibold">
              <Truck size={14} className="text-cyan" />
              {missingForFreeDelivery === 0
                ? '🎉 Parabéns! Você ganhou Frete Grátis KronoPex'
                : `Faltam R$ ${missingForFreeDelivery.toFixed(2)} para Frete Grátis`}
            </span>
            <span className="text-muted">{deliveryProgress.toFixed(0)}%</span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${deliveryProgress}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="cart-items-scroll">
          {items.length === 0 ? (
            <div className="empty-cart-state text-center">
              <div className="empty-cart-icon">
                <ShoppingBag size={48} className="text-muted" />
              </div>
              <h4 className="font-bold text-base mb-1">Seu carrinho está vazio</h4>
              <p className="text-xs text-muted mb-4">
                Explore nossa vitrine de peças automotivas e adicione os itens compatíveis com o seu veículo.
              </p>
              <button onClick={onClose} className="btn btn-secondary text-sm">
                Voltar à Vitrine
              </button>
            </div>
          ) : (
            items.map((item) => {
              const unitPrice = item.pixDiscountPrice || item.price;
              return (
                <div key={item.id} className="cart-item-card">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-img"
                  />
                  <div className="cart-item-details">
                    <span className="cart-item-brand">{item.brand}</span>
                    <h5 className="cart-item-name">{item.name}</h5>
                    <div className="cart-item-price">
                      R$ {(unitPrice * item.quantity).toFixed(2)}
                      {item.quantity > 1 && (
                        <span className="cart-unit-price text-muted">
                          (R$ {unitPrice.toFixed(2)} cada)
                        </span>
                      )}
                    </div>

                    <div className="cart-qty-row flex-between">
                      <div className="quantity-stepper">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="qty-number">{item.quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="remove-item-btn text-muted"
                        title="Remover do carrinho"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer / Summary */}
        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-lines">
              <div className="flex-between text-sm text-muted">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex-between text-sm text-muted">
                <span>Entrega KronoPex Delivery</span>
                <span>
                  {missingForFreeDelivery === 0 ? (
                    <strong className="text-cyan">GRÁTIS</strong>
                  ) : (
                    'A calcular no checkout'
                  )}
                </span>
              </div>
              <div className="flex-between text-base font-bold text-main mt-2 pt-2 border-top">
                <span>Total Estimado (PIX):</span>
                <span className="text-gradient-cyan text-lg">
                  R$ {subtotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="btn btn-primary w-full btn-lg flex-center gap-2 mt-4"
            >
              <span>Continuar para Entrega</span>
              <ArrowRight size={18} />
            </button>

            <div className="cart-trust-note text-center text-xs text-muted mt-2">
              <ShieldCheck size={13} className="text-cyan inline mr-1" />
              Sem cadastro prévio. Finalize em menos de 1 minuto.
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
