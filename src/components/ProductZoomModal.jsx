import React, { useState, useRef } from 'react';
import { X, ZoomIn, ShoppingBag, ShieldCheck, Check, Truck, Car } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export function ProductZoomModal({
  product,
  onClose,
  onAddToCart,
  cartQuantity = 0
}) {
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const imageRef = useRef(null);

  if (!product) return null;

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  const handleTouchMove = (e) => {
    if (!imageRef.current || !e.touches[0]) return;
    const touch = e.touches[0];
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((touch.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((touch.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  const handleTouchStart = () => {
    setIsHovering((prev) => !prev);
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal-dialog zoom-modal-dialog glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Fechar janela"
        >
          <X size={20} />
        </button>

        <div className="zoom-modal-grid">
          {/* Left Column: Image with Interactive Zoom Lens */}
          <div className="zoom-image-column">
            <div
              className="zoom-image-container"
              ref={imageRef}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              <img
                src={product.image}
                alt={product.name}
                className="zoom-main-img"
              />

              {/* Magnifier Lens / Tooltip */}
              <div className="zoom-hint-badge">
                <ZoomIn size={14} className="text-cyan" />
                <span>Toque ou passe o dedo para ampliar</span>
              </div>

              {/* Zoom Overlay on Hover */}
              {isHovering && (
                <div
                  className="magnified-zoom-view"
                  style={{
                    backgroundImage: `url(${product.image})`,
                    backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                    backgroundSize: '250%'
                  }}
                />
              )}
            </div>

            <div className="zoom-guarantee-strip flex-between text-xs text-muted">
              <span className="flex-center gap-1">
                <Truck size={14} className="text-cyan" /> Pronta entrega KronoPex
              </span>
              <span className="flex-center gap-1">
                <ShieldCheck size={14} className="text-cyan" /> Garantia de Procedência
              </span>
            </div>
          </div>

          {/* Right Column: Specifications & Compatibility */}
          <div className="zoom-details-column">
            <div className="zoom-meta-tags flex-between">
              <span className="badge badge-express">
                {product.brand}
              </span>
              <span className="oem-code-tag">
                Código OEM: {product.oemCode}
              </span>
            </div>

            <h2 className="zoom-product-title">{product.name}</h2>

            <p className="zoom-description">{product.description}</p>

            {/* Vehicle Compatibility */}
            <div className="zoom-section">
              <h4 className="zoom-section-title flex-center gap-2">
                <Car size={16} className="text-cyan" />
                <span>Aplicações em Veículos Compatíveis:</span>
              </h4>
              <div className="zoom-vehicles-chips">
                {product.vehicles?.map((veh, idx) => (
                  <span key={idx} className="vehicle-chip-lg">
                    {veh}
                  </span>
                ))}
              </div>
            </div>

            {/* Technical Specs Table */}
            {product.specs && (
              <div className="zoom-section">
                <h4 className="zoom-section-title">Especificações Técnicas:</h4>
                <div className="specs-table">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="spec-row flex-between">
                      <span className="spec-key">{key}</span>
                      <span className="spec-value">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price & Buy Action */}
            <div className="zoom-buy-card">
              <div className="zoom-prices">
                <div className="zoom-pix-price-box">
                  <span className="text-xs text-muted">Valor no PIX (com desconto):</span>
                  <span className="zoom-pix-price text-gradient-cyan">
                    {formatCurrency(product.pixDiscountPrice || product.price * 0.9)}
                  </span>
                </div>
                <div className="text-xs text-muted">
                  ou {formatCurrency(product.price)} parcelado em até 6x no cartão
                </div>
              </div>

              <div className="zoom-actions-row">
                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={() => {
                    onAddToCart(product);
                  }}
                  className="btn btn-primary btn-lg flex-1 flex-center gap-2"
                >
                  <ShoppingBag size={18} />
                  <span>
                    {product.stock <= 0
                      ? 'Produto Esgotado'
                      : cartQuantity > 0
                      ? `No Carrinho (${cartQuantity}) - Adicionar +1`
                      : 'Adicionar ao Carrinho'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
