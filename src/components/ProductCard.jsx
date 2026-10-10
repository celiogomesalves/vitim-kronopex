import React from 'react';
import { ZoomIn, ShoppingBag, Check, AlertCircle, Sparkles } from 'lucide-react';

export function ProductCard({
  product,
  onOpenZoom,
  onAddToCart,
  cartQuantity = 0
}) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.minStock;

  return (
    <div className="product-card">
      {/* Top Badges */}
      <div className="card-top-badges">
        {product.isExpressDelivery && (
          <span className="badge badge-express">
            <Sparkles size={10} />
            <span className="badge-text-full">Delivery Hoje</span>
            <span className="badge-text-mobile">Hoje</span>
          </span>
        )}
        {isOutOfStock ? (
          <span className="badge badge-danger">Esgotado</span>
        ) : isLowStock ? (
          <span className="badge badge-low-stock">
            <AlertCircle size={10} /> {product.stock} un.
          </span>
        ) : (
          <span className="badge badge-stock">
            <Check size={10} /> {product.stock} un.
          </span>
        )}
      </div>

      {/* Product Image Area with Quick Zoom Trigger */}
      <div className="product-img-wrapper" onClick={() => onOpenZoom(product)}>
        <img
          src={product.image}
          alt={product.name}
          className="product-img"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80';
          }}
        />
        <div className="zoom-overlay-hint">
          <button
            type="button"
            className="zoom-hint-btn flex-center gap-1"
            title="Ver com Zoom Ampliado"
          >
            <ZoomIn size={15} />
            <span>Zoom Detalhado</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="product-info-body">
        <div className="product-brand-oem flex-between text-xs text-muted">
          <span className="font-semibold text-main">{product.brand}</span>
          <span className="oem-code-tag">OEM: {product.oemCode}</span>
        </div>

        <h3
          className="product-title"
          title={product.name}
          onClick={() => onOpenZoom(product)}
        >
          {product.name}
        </h3>

        {/* Compatible Vehicles */}
        <div className="product-vehicles-list">
          {product.vehicles && product.vehicles.slice(0, 2).map((v, idx) => (
            <span key={idx} className="vehicle-tag">
              🚗 {v}
            </span>
          ))}
          {product.vehicles && product.vehicles.length > 2 && (
            <span className="vehicle-tag more-tag">
              +{product.vehicles.length - 2}
            </span>
          )}
        </div>

        {/* Pricing Area */}
        <div className="pricing-box">
          <div className="price-pix-row">
            <span className="price-pix-label">À vista PIX:</span>
            <span className="price-pix-value">
              R$ {product.pixDiscountPrice ? product.pixDiscountPrice.toFixed(2) : (product.price * 0.9).toFixed(2)}
            </span>
          </div>
          <div className="price-regular-row text-xs text-muted">
            ou R$ {product.price.toFixed(2)} cartão
          </div>
        </div>

        {/* Action Button */}
        <div className="product-card-actions">
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product)}
            className={`btn w-full ${cartQuantity > 0 ? 'btn-secondary' : 'btn-primary'} flex-center gap-2`}
          >
            <ShoppingBag size={16} />
            <span>
              {isOutOfStock
                ? 'Indisponível'
                : cartQuantity > 0
                ? `No Carrinho (${cartQuantity})`
                : 'Comprar'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
