import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Copy,
  Check,
  MessageCircle,
  Truck,
  ArrowRight,
  QrCode,
  MapPin,
  Clock
} from 'lucide-react';

export function OrderSuccessModal({ order, onClose, config }) {
  const [copiedPix, setCopiedPix] = useState(false);

  useEffect(() => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  }, []);

  if (!order) return null;

  const pixKey = config?.pixKey || 'pix@kronopex.com.br';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const getWhatsAppMessage = () => {
    const itemsList = order.items
      .map((i) => `▪ ${i.quantity}x ${i.name} (R$ ${(i.price * i.quantity).toFixed(2)})`)
      .join('\n');

    return encodeURIComponent(
      ` Olá KronoPex! Acabei de realizar um pedido na Vitrine Online:\n\n` +
      `*Número do Pedido:* #${order.id}\n` +
      `*Cliente:* ${order.customer.name}\n` +
      `*Telefone:* ${order.customer.phone}\n` +
      `*Endereço:* ${order.customer.address} - ${order.customer.neighborhood}, ${order.customer.city}\n` +
      (order.customer.reference ? `*Ponto de Ref:* ${order.customer.reference}\n` : '') +
      `\n*Peças Solicitadas:*\n${itemsList}\n\n` +
      `*Forma de Pagamento:* ${order.paymentMethod.toUpperCase()}\n` +
      `*Total a Pagar:* R$ ${order.total.toFixed(2)}\n\n` +
      `Por favor, confirmem o envio express!`
    );
  };

  const whatsappPhone = config?.whatsapp?.replace(/\D/g, '') || '5511999998888';
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${getWhatsAppMessage()}`;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal-dialog success-modal-dialog glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="success-modal-body text-center">
          {/* Animated Success Badge */}
          <div className="success-icon-badge">
            <CheckCircle size={44} className="text-cyan animate-pulse" />
          </div>

          <span className="badge badge-stock mt-2">Pedido Recebido com Sucesso!</span>

          <h2 className="success-title font-bold text-2xl mt-2">
            Pedido <span className="text-gradient-cyan">#{order.id}</span>
          </h2>

          <p className="text-sm text-muted mt-1">
            Separando suas peças no estoque da KronoPex para despacho imediato!
          </p>

          {/* Delivery & Status Box */}
          <div className="order-summary-pill-card glass-panel text-left mt-4">
            <div className="flex-between text-xs mb-2">
              <span className="flex-center gap-1 font-semibold text-cyan">
                <Truck size={15} /> KronoPex Delivery Express
              </span>
              <span className="flex-center gap-1 text-muted">
                <Clock size={13} /> Tempo estimado: 35-50 min
              </span>
            </div>

            <div className="text-xs text-muted">
              <div className="flex-center gap-1 mb-1">
                <MapPin size={13} className="text-cyan" />
                <span className="text-main font-medium">{order.customer.address}</span>
              </div>
              <div>{order.customer.neighborhood} - {order.customer.city}</div>
            </div>
          </div>

          {/* PIX Payment Section if PIX */}
          {order.paymentMethod === 'pix' && (
            <div className="pix-instruction-box glass-panel mt-4 text-left">
              <div className="flex-center gap-2 mb-2">
                <QrCode size={20} className="text-cyan" />
                <h4 className="font-bold text-sm">Chave PIX para Pagamento</h4>
              </div>

              <p className="text-xs text-muted mb-3">
                Transfira o valor exato de <strong>R$ {order.total.toFixed(2)}</strong> para confirmar o despacho do motoboy:
              </p>

              <div className="pix-copy-input-row flex-between">
                <span className="pix-key-text font-mono text-xs">{pixKey}</span>
                <button
                  onClick={handleCopyPix}
                  className="btn btn-secondary btn-sm flex-center gap-1"
                >
                  {copiedPix ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                  <span>{copiedPix ? 'Copiado!' : 'Copiar Chave'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="success-actions-col mt-5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary w-full btn-lg flex-center gap-2 mb-2"
              style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
            >
              <MessageCircle size={20} />
              <span>Enviar Comprovante / Acompanhar no WhatsApp</span>
            </a>

            <button
              onClick={onClose}
              className="btn btn-secondary w-full flex-center gap-2"
            >
              <span>Continuar Explorando a Loja</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
