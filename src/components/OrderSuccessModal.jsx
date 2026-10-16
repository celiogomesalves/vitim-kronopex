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
  Clock,
  ShieldCheck
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { MercadoPagoService } from '../services/mercadopago';

export function OrderSuccessModal({ order, onClose, config }) {
  const [copiedPix, setCopiedPix] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(order?.pixData?.status || 'pending');

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

  // Polling em tempo real se o PIX foi gerado pelo Mercado Pago
  useEffect(() => {
    const paymentId = order?.pixData?.paymentId;
    if (!paymentId || paymentStatus === 'approved') return;

    const interval = setInterval(async () => {
      try {
        const check = await MercadoPagoService.checkPaymentStatus(paymentId);
        if (check && check.status === 'approved') {
          setPaymentStatus('approved');
          clearInterval(interval);
          try {
            confetti({
              particleCount: 100,
              spread: 90,
              origin: { y: 0.5 }
            });
          } catch {}
        }
      } catch {
        // Ignora erros de polling
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [order?.pixData?.paymentId, paymentStatus]);

  if (!order) return null;

  const pixData = order.pixData;
  const isDynamicPix = Boolean(pixData?.qrCodeBase64 || pixData?.qrCode);
  const pixStringToCopy = pixData?.qrCode || config?.pixKey || 'pix@kronopex.com.br';

  const handleCopyPix = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pixStringToCopy);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    }
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
      `*Status do Pagamento:* ${paymentStatus === 'approved' ? 'PAGO / CONFIRMADO' : 'AGUARDANDO'}\n` +
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
        style={{ maxWidth: '520px', maxHeight: '92vh', overflowY: 'auto' }}
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
              <div className="flex-between mb-2">
                <div className="flex-center gap-2">
                  <QrCode size={20} className="text-cyan" />
                  <h4 className="font-bold text-sm">
                    {isDynamicPix ? 'PIX Dinâmico Oficial Mercado Pago' : 'Chave PIX da Loja'}
                  </h4>
                </div>
                {paymentStatus === 'approved' ? (
                  <span className="badge badge-admin flex-center gap-1 text-xs">
                    <ShieldCheck size={12} /> Aprovado!
                  </span>
                ) : (
                  <span className="badge badge-warning text-xs animate-pulse">
                    Aguardando Pagamento
                  </span>
                )}
              </div>

              {/* Se tiver QR Code em Base64 do Mercado Pago, exibe na tela */}
              {isDynamicPix && pixData?.qrCodeBase64 && (
                <div className="text-center my-3">
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '12px',
                      background: '#ffffff',
                      borderRadius: '16px',
                      boxShadow: '0 0 25px rgba(0, 210, 255, 0.25)'
                    }}
                  >
                    <img
                      src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                      alt="QR Code PIX Mercado Pago"
                      style={{ width: '180px', height: '180px', display: 'block' }}
                    />
                  </div>
                  <p className="text-xs text-muted mt-2">
                    Abra o app do seu banco e escaneie o código acima
                  </p>
                </div>
              )}

              <p className="text-xs text-muted mb-3">
                {isDynamicPix ? (
                  <>
                    Valor exato da compra:{' '}
                    <strong className="text-cyan font-bold">{formatCurrency(order.total)}</strong>.
                    Copie a chave Pix Copia-e-Cola abaixo:
                  </>
                ) : (
                  <>
                    Transfira o valor de <strong>{formatCurrency(order.total)}</strong> para a chave
                    oficial da KronoPex:
                  </>
                )}
              </p>

              <div className="pix-copy-input-row flex-between">
                <span
                  className="pix-key-text font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ maxWidth: '280px' }}
                >
                  {pixStringToCopy}
                </span>
                <button
                  onClick={handleCopyPix}
                  className="btn btn-secondary btn-sm flex-center gap-1 flex-shrink-0"
                >
                  {copiedPix ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                  <span>{copiedPix ? 'Copiado!' : 'Copiar Código PIX'}</span>
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
              <span>Enviar Pedido / Acompanhar no WhatsApp</span>
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
