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
  AlertCircle
} from 'lucide-react';

export function CheckoutModal({
  isOpen,
  onClose,
  items,
  onOrderCompleted,
  config
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cep: '',
    address: '',
    number: '',
    neighborhood: '',
    city: 'São Paulo',
    reference: '',
    paymentMethod: 'pix', // 'pix' | 'card_delivery' | 'cash'
    cashChangeFor: '',
    notes: ''
  });

  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => {
    const itemPrice = formData.paymentMethod === 'pix'
      ? (item.pixDiscountPrice || item.price * 0.9)
      : item.price;
    return acc + itemPrice * item.quantity;
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
        price: formData.paymentMethod === 'pix'
          ? (item.pixDiscountPrice || item.price * 0.9)
          : item.price
      })),
      subtotal,
      deliveryFee,
      total,
      paymentMethod: formData.paymentMethod,
      cashChangeFor: formData.cashChangeFor,
      status: 'pending', // 'pending' -> 'preparing' -> 'delivering' -> 'delivered'
      courierId: null,
      notes: formData.notes
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onOrderCompleted(generatedOrder);
    }, 600);
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal-dialog checkout-modal-dialog glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="checkout-modal-header flex-between">
          <div className="flex-center gap-2">
            <Truck size={22} className="text-cyan" />
            <div>
              <h3 className="checkout-title font-bold text-lg">
                Finalizar Pedido com KronoPex Delivery
              </h3>
              <p className="text-xs text-muted">
                Sem cadastro obrigatório. Preencha apenas os dados para entrega.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="checkout-alert-error flex-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="checkout-form-grid">
          {/* Left Form: Delivery and Contact */}
          <div className="checkout-form-fields">
            {/* Customer Contact */}
            <div className="form-section-group">
              <h4 className="form-section-title flex-center gap-2">
                <User size={16} className="text-cyan" />
                <span>Seus Dados de Contato</span>
              </h4>

              <div className="input-row">
                <div className="form-field flex-1">
                  <label>Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva / Oficina AutoCenter"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="form-field flex-1">
                  <label>WhatsApp / Telefone para Confirmação *</label>
                  <div className="input-with-icon">
                    <Phone size={15} className="field-icon" />
                    <input
                      type="tel"
                      required
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="form-section-group">
              <h4 className="form-section-title flex-center gap-2">
                <MapPin size={16} className="text-cyan" />
                <span>Endereço Completo de Entrega</span>
              </h4>

              <div className="input-row">
                <div className="form-field" style={{ maxWidth: '180px' }}>
                  <label>CEP (Opcional)</label>
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={formData.cep}
                    onBlur={handleCepBlur}
                    onChange={(e) =>
                      setFormData({ ...formData, cep: e.target.value })
                    }
                  />
                  {isLoadingCep && (
                    <span className="text-xs text-cyan">Buscando CEP...</span>
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

              <div className="input-row">
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

              <div className="form-field">
                <label>Ponto de Referência ou Nome da Oficina</label>
                <input
                  type="text"
                  placeholder="Ex: Em frente ao posto Ipiranga, oficina Box 4"
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData({ ...formData, reference: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="form-section-group">
              <h4 className="form-section-title flex-center gap-2">
                <CreditCard size={16} className="text-cyan" />
                <span>Forma de Pagamento</span>
              </h4>

              <div className="payment-options-grid">
                <label
                  className={`payment-option-card ${
                    formData.paymentMethod === 'pix' ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="pix"
                    checked={formData.paymentMethod === 'pix'}
                    onChange={() =>
                      setFormData({ ...formData, paymentMethod: 'pix' })
                    }
                  />
                  <div className="option-inner">
                    <QrCode size={22} className="text-cyan" />
                    <div>
                      <strong className="block">PIX Imediato</strong>
                      <span className="text-xs text-green font-bold">
                        10% de Desconto
                      </span>
                    </div>
                  </div>
                </label>

                <label
                  className={`payment-option-card ${
                    formData.paymentMethod === 'card_delivery' ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card_delivery"
                    checked={formData.paymentMethod === 'card_delivery'}
                    onChange={() =>
                      setFormData({ ...formData, paymentMethod: 'card_delivery' })
                    }
                  />
                  <div className="option-inner">
                    <CreditCard size={22} className="text-cyan" />
                    <div>
                      <strong className="block">Cartão na Entrega</strong>
                      <span className="text-xs text-muted">
                        Maquininha com Motoboy
                      </span>
                    </div>
                  </div>
                </label>

                <label
                  className={`payment-option-card ${
                    formData.paymentMethod === 'cash' ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={() =>
                      setFormData({ ...formData, paymentMethod: 'cash' })
                    }
                  />
                  <div className="option-inner">
                    <Banknote size={22} className="text-cyan" />
                    <div>
                      <strong className="block">Dinheiro</strong>
                      <span className="text-xs text-muted">
                        Pagar no recebimento
                      </span>
                    </div>
                  </div>
                </label>
              </div>

              {formData.paymentMethod === 'cash' && (
                <div className="form-field mt-2 animate-slide-down">
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
          <div className="checkout-summary-box glass-panel">
            <h4 className="summary-title font-bold text-base mb-3">
              Resumo do Pedido ({items.reduce((acc, i) => acc + i.quantity, 0)} itens)
            </h4>

            <div className="checkout-items-preview">
              {items.map((item) => (
                <div key={item.id} className="preview-item-row flex-between text-xs">
                  <span className="preview-item-name">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="preview-item-val font-semibold">
                    R$ {((formData.paymentMethod === 'pix' ? (item.pixDiscountPrice || item.price * 0.9) : item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-calc-lines mt-3 pt-3 border-top">
              <div className="flex-between text-xs text-muted mb-1">
                <span>Subtotal dos produtos</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex-between text-xs text-muted mb-1">
                <span>Taxa de Entrega</span>
                <span>
                  {deliveryFee === 0 ? (
                    <strong className="text-cyan">GRÁTIS</strong>
                  ) : (
                    `R$ ${deliveryFee.toFixed(2)}`
                  )}
                </span>
              </div>
              {formData.paymentMethod === 'pix' && (
                <div className="flex-between text-xs text-green mb-1 font-semibold">
                  <span>Desconto Especial PIX</span>
                  <span>-10% aplicado</span>
                </div>
              )}
              <div className="flex-between text-base font-bold text-main mt-3 pt-2 border-top">
                <span>Total a Pagar:</span>
                <span className="text-gradient-cyan text-xl">
                  R$ {total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full btn-lg mt-4 flex-center gap-2"
            >
              <CheckCircle2 size={18} />
              <span>
                {isSubmitting ? 'Processando Pedido...' : 'Confirmar e Enviar Pedido'}
              </span>
            </button>

            <p className="checkout-security-notice text-xs text-muted text-center mt-3">
              🔒 Ao confirmar, seu pedido será separado imediatamente no estoque da KronoPex e você receberá atualizações em tempo real.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
