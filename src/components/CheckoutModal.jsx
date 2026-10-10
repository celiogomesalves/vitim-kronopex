import React, { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  User,
  CreditCard,
  QrCode,
  Banknote,
  Truck,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { formatCurrency, formatPhone, formatCEP } from '../utils/formatters';

export function CheckoutModal({
  isOpen,
  onClose,
  items,
  onOrderCompleted,
  config,
  paymentMethods = []
}) {
  const activePaymentMethods = (paymentMethods.length > 0 ? paymentMethods : StorageService.getPaymentMethods()).filter(
    (m) => m.active !== false
  );

  const defaultMethod = activePaymentMethods[0]?.id || 'pay-pix';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cep: '',
    address: '',
    number: '',
    neighborhood: '',
    city: 'São Paulo',
    reference: '',
    selectedPaymentId: defaultMethod,
    cashChangeFor: '',
    notes: ''
  });

  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentPayment = activePaymentMethods.find((m) => m.id === formData.selectedPaymentId) || activePaymentMethods[0];
  const discountRate = (currentPayment?.discountPercent || 0) / 100;

  const subtotal = items.reduce((acc, item) => {
    const rawPrice = item.price;
    const finalPrice = discountRate > 0 ? rawPrice * (1 - discountRate) : rawPrice;
    return acc + finalPrice * item.quantity;
  }, 0);

  const deliveryFee = subtotal >= (config?.freeDeliveryThreshold || 200)
    ? 0
    : (config?.defaultDeliveryFee || 15.00);

  const total = subtotal + deliveryFee;

  // Handle CEP auto-fill
  const handleCepBlur = async () => {
    const cleanCep = formData.cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setIsLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            address: data.logradouro || prev.address,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city
          }));
        }
      } catch (err) {
        console.warn('Erro ao consultar CEP:', err);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Por favor, informe seu nome completo.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('Por favor, informe seu WhatsApp para o envio dos detalhes e rastreio.');
      return;
    }
    if (!formData.address.trim() || !formData.number.trim()) {
      setErrorMsg('Por favor, informe a rua e número para a entrega da peça.');
      return;
    }

    setIsSubmitting(true);

    const generatedOrder = {
      id: `KP-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      customer: {
        name: formData.name,
        phone: formData.phone,
        cep: formData.cep,
        address: `${formData.address}, ${formData.number}`,
        neighborhood: formData.neighborhood,
        city: formData.city,
        reference: formData.reference
      },
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: discountRate > 0 ? item.price * (1 - discountRate) : item.price
      })),
      subtotal,
      deliveryFee,
      total,
      paymentMethod: currentPayment?.type || 'pix',
      paymentMethodName: currentPayment?.name || 'PIX',
      cashChangeFor: formData.cashChangeFor,
      status: 'pending',
      courierId: null,
      notes: formData.notes
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onOrderCompleted(generatedOrder);
    }, 600);
  };

  const getMethodIcon = (type) => {
    switch (type) {
      case 'pix':
        return <QrCode size={22} className="text-cyan" />;
      case 'card_delivery':
      case 'debit_delivery':
        return <CreditCard size={22} className="text-cyan" />;
      case 'cash':
        return <Banknote size={22} className="text-green" />;
      default:
        return <FileText size={22} className="text-warning" />;
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal-dialog checkout-modal-dialog glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="checkout-modal-header flex-between mb-4">
          <div className="flex-center gap-2">
            <Truck size={22} className="text-cyan" />
            <div>
              <h3 className="checkout-title font-bold text-lg">
                Finalizar Pedido com KronoPex Delivery
              </h3>
              <p className="text-xs text-muted">
                Sem burocracia ou cadastro prévio. Peças novas entregues no seu endereço com rapidez.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="checkout-alert-error flex-center gap-2 mb-4 p-3 rounded">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="checkout-form-grid">
          {/* Left Form: Delivery and Contact */}
          <div className="checkout-form-fields space-y-4">
            {/* Customer Contact */}
            <div className="form-section-group glass-panel p-4">
              <h4 className="form-section-title flex-center gap-2 mb-3">
                <User size={16} className="text-cyan" />
                <span className="font-semibold text-sm">Seus Dados de Contato</span>
              </h4>

              <div className="input-row">
                <div className="form-field flex-1">
                  <label>Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva / AutoCenter"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="form-field flex-1">
                  <label>WhatsApp para Confirmação *</label>
                  <div className="input-with-icon">
                    <Phone size={15} className="field-icon" />
                    <input
                      type="tel"
                      required
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: formatPhone(e.target.value) })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="form-section-group glass-panel p-4">
              <h4 className="form-section-title flex-center gap-2 mb-3">
                <MapPin size={16} className="text-cyan" />
                <span className="font-semibold text-sm">Endereço de Entrega da Peça</span>
              </h4>

              <div className="input-row">
                <div className="form-field" style={{ maxWidth: '180px' }}>
                  <label>CEP</label>
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={formData.cep}
                    onBlur={handleCepBlur}
                    onChange={(e) =>
                      setFormData({ ...formData, cep: formatCEP(e.target.value) })
                    }
                  />
                  {isLoadingCep && (
                    <span className="text-xs text-cyan">Consultando CEP...</span>
                  )}
                </div>
                <div className="form-field flex-1">
                  <label>Rua / Avenida *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Rua das Autopeças"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
                <div className="form-field" style={{ maxWidth: '120px' }}>
                  <label>Número *</label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    value={formData.number}
                    onChange={(e) =>
                      setFormData({ ...formData, number: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="input-row mt-3">
                <div className="form-field flex-1">
                  <label>Bairro</label>
                  <input
                    type="text"
                    placeholder="Bairro"
                    value={formData.neighborhood}
                    onChange={(e) =>
                      setFormData({ ...formData, neighborhood: e.target.value })
                    }
                  />
                </div>
                <div className="form-field flex-1">
                  <label>Cidade</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-field mt-3">
                <label>Ponto de Referência ou Nome da Oficina</label>
                <input
                  type="text"
                  placeholder="Ex: Em frente ao posto, portão azul"
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData({ ...formData, reference: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Payment Method Selector (Dinâmico do Administrador) */}
            <div className="form-section-group glass-panel p-4">
              <h4 className="form-section-title flex-center gap-2 mb-3">
                <CreditCard size={16} className="text-cyan" />
                <span className="font-semibold text-sm">Forma de Pagamento Aceita</span>
              </h4>

              <div className="payment-options-grid">
                {activePaymentMethods.map((method) => {
                  const isSelected = formData.selectedPaymentId === method.id;
                  return (
                    <label
                      key={method.id}
                      className={`payment-option-card ${isSelected ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={isSelected}
                        onChange={() =>
                          setFormData({ ...formData, selectedPaymentId: method.id })
                        }
                      />
                      <div className="option-inner flex-center gap-3">
                        {getMethodIcon(method.type)}
                        <div>
                          <strong className="block text-xs text-main">{method.name}</strong>
                          {method.discountPercent > 0 ? (
                            <span className="text-xs text-green font-bold">
                              {method.discountPercent}% de Desconto
                            </span>
                          ) : (
                            <span className="text-xs text-muted">
                              {method.description || 'Pagamento seguro'}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {currentPayment?.requiresChange && (
                <div className="form-field mt-3 animate-slide-down">
                  <label>Precisa de troco para quanto?</label>
                  <input
                    type="text"
                    placeholder="Ex: Troco para R$ 100,00"
                    value={formData.cashChangeFor}
                    onChange={(e) =>
                      setFormData({ ...formData, cashChangeFor: e.target.value })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Confirmation */}
          <div className="checkout-summary-box glass-panel p-5">
            <h4 className="summary-title font-bold text-base mb-3">
              Resumo do Pedido ({items.reduce((acc, i) => acc + i.quantity, 0)} itens)
            </h4>

            <div className="checkout-items-preview space-y-2">
              {items.map((item) => {
                const itemFinalPrice = discountRate > 0 ? item.price * (1 - discountRate) : item.price;
                return (
                  <div key={item.id} className="preview-item-row flex-between text-xs py-1 border-bottom">
                    <span className="preview-item-name text-muted">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="preview-item-val font-semibold text-main">
                      {formatCurrency(itemFinalPrice * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="summary-calc-lines mt-4 pt-3 border-top space-y-2">
              <div className="flex-between text-xs text-muted">
                <span>Subtotal dos produtos:</span>
                <span className="text-main">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex-between text-xs text-muted">
                <span>Taxa de Entrega:</span>
                <span>
                  {deliveryFee === 0 ? (
                    <strong className="text-cyan">GRÁTIS</strong>
                  ) : (
                    formatCurrency(deliveryFee)
                  )}
                </span>
              </div>
              {discountRate > 0 && (
                <div className="flex-between text-xs text-green font-semibold">
                  <span>Desconto ({currentPayment.name}):</span>
                  <span>-{(discountRate * 100).toFixed(0)}% aplicado</span>
                </div>
              )}
              <div className="flex-between text-base font-bold text-main mt-3 pt-3 border-top">
                <span>Total a Pagar:</span>
                <span className="text-cyan text-xl">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full btn-lg mt-5 flex-center gap-2"
            >
              <CheckCircle2 size={18} />
              <span>
                {isSubmitting ? 'Processando Pedido...' : 'Confirmar e Enviar Pedido'}
              </span>
            </button>

            <p className="checkout-security-notice text-xs text-muted text-center mt-3 leading-relaxed">
              🔒 Ao confirmar, seu pedido será separado imediatamente no estoque da KronoPex e você receberá atualizações em tempo real pelo WhatsApp.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
