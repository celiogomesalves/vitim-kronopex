import React from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  freeDeliveryThreshold = 200
}) {
  if (!isOpen) return null;

  const totalItemsCount = items.reduce((acc, i) => acc + i.quantity, 0);

  const subtotal = items.reduce((acc, item) => {
    const price = item.pixDiscountPrice || item.price;
    return acc + price * item.quantity;
  }, 0);

  const missingForFreeDelivery = Math.max(
    0,
    freeDeliveryThreshold - subtotal
  );

  const freeDeliveryProgress = Math.min(
    100,
    (subtotal / freeDeliveryThreshold) * 100
  );

  return (
    <div className="cart-drawer-overlay animate-fade-in" onClick={onClose}>
      <aside
        className="cart-drawer glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="cart-drawer-header flex-between">
          <div className="flex-center gap-2">
            <ShoppingBag size={20} className="text-cyan" />
            <h3 className="cart-title font-bold text-base">
              Seu Carrinho de Peças ({totalItemsCount})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="drawer-close-btn"
            title="Fechar carrinho"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="free-shipping-bar-box">
          <div className="flex-between text-xs mb-1">
            <span className="flex-center gap-1 text-muted">
              <Truck size={14} className="text-cyan" />
              <span>KronoPex Express Delivery</span>
            </span>
            <span className="font-semibold text-cyan">
              {missingForFreeDelivery === 0 ? (
                'Frete Grátis Liberado!'
              ) : (
                `Faltam ${formatCurrency(missingForFreeDelivery)} para Frete Grátis`
              )}
            </span>
          </div>
          <div className="shipping-progress-track">
            <div
              className="shipping-progress-fill"
              style={{ width: `${freeDeliveryProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="cart-items-scroll">
          {items.length === 0 ? (
            <div className="cart-empty-state text-center py-12">
              <div className="empty-icon-box mx-auto mb-3">
                <ShoppingBag size={40} className="text-muted" />
              </div>
              <h4 className="font-bold text-base text-main mb-1">
                Carrinho Vazio
              </h4>
              <p className="text-xs text-muted max-w-xs mx-auto mb-4">
                Explore as prateleiras da KronoPex e adicione peças compatíveis com seu veículo.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary btn-sm"
              >
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
                      {formatCurrency(unitPrice * item.quantity)}
                      {item.quantity > 1 && (
                        <span className="cart-unit-price text-muted">
                          ({formatCurrency(unitPrice)} cada)
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
                <span>{formatCurrency(subtotal)}</span>
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
                <span className="text-cyan text-lg">
                  {formatCurrency(subtotal)}
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
