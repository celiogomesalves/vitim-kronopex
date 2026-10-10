import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CreditCard,
  QrCode,
  Banknote,
  Plus,
  Edit2,
  Trash2,
  FileText
} from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';

export function AdminPayments({ paymentMethods, onSavePaymentMethods }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'pix',
    discountPercent: '0',
    description: '',
    instructions: '',
    active: true,
    requiresChange: false
  });

  // Confirmações
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionType: '',
    payload: null,
    variant: 'danger'
  });

  const handleOpenAdd = () => {
    setEditingMethod(null);
    setFormData({
      name: '',
      type: 'pix',
      discountPercent: '0',
      description: '',
      instructions: '',
      active: true,
      requiresChange: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (method) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      type: method.type,
      discountPercent: String(method.discountPercent || 0),
      description: method.description || '',
      instructions: method.instructions || '',
      active: method.active !== false,
      requiresChange: Boolean(method.requiresChange)
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = (method) => {
    setConfirmModal({
      isOpen: true,
      title: method.active ? 'Desativar Forma de Pagamento' : 'Ativar Forma de Pagamento',
      message: `Deseja realmente ${method.active ? 'desativar' : 'ativar'} a opção "${method.name}" no checkout da loja?`,
      actionType: 'toggle_status',
      payload: method.id,
      variant: method.active ? 'warning' : 'primary'
    });
  };

  const handlePromptDelete = (method) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirmar Exclusão de Forma de Pagamento',
      message: `Tem certeza que deseja excluir "${method.name}"? Clientes não poderão mais selecionar esta opção no checkout.`,
      actionType: 'delete',
      payload: method.id,
      variant: 'danger'
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingMethod) {
      setConfirmModal({
        isOpen: true,
        title: 'Confirmar Alterações na Forma de Pagamento',
        message: `Deseja salvar as alterações efetuadas em "${formData.name}"?`,
        actionType: 'save_edit',
        payload: { ...formData },
        variant: 'primary'
      });
    } else {
      const newMethod = {
        id: `pay-${Date.now().toString().slice(-4)}`,
        name: formData.name.trim(),
        type: formData.type,
        discountPercent: parseFloat(formData.discountPercent) || 0,
        description: formData.description.trim(),
        instructions: formData.instructions.trim(),
        active: formData.active,
        requiresChange: formData.requiresChange
      };
      onSavePaymentMethods([...paymentMethods, newMethod]);
      setIsModalOpen(false);
    }
  };

  const handleExecuteConfirmedAction = () => {
    if (confirmModal.actionType === 'delete') {
      const updated = paymentMethods.filter((m) => m.id !== confirmModal.payload);
      onSavePaymentMethods(updated);
    } else if (confirmModal.actionType === 'toggle_status') {
      const updated = paymentMethods.map((m) =>
        m.id === confirmModal.payload ? { ...m, active: !m.active } : m
      );
      onSavePaymentMethods(updated);
    } else if (confirmModal.actionType === 'save_edit') {
      const updated = paymentMethods.map((m) => {
        if (m.id === editingMethod.id) {
          return {
            ...m,
            name: confirmModal.payload.name.trim(),
            type: confirmModal.payload.type,
            discountPercent: parseFloat(confirmModal.payload.discountPercent) || 0,
            description: confirmModal.payload.description.trim(),
            instructions: confirmModal.payload.instructions.trim(),
            active: confirmModal.payload.active,
            requiresChange: confirmModal.payload.requiresChange
          };
        }
        return m;
      });
      onSavePaymentMethods(updated);
      setIsModalOpen(false);
    }
    setConfirmModal({ isOpen: false, title: '', message: '', actionType: '', payload: null, variant: 'danger' });
  };

  const getMethodIcon = (type) => {
    switch (type) {
      case 'pix':
        return <QrCode size={22} className="text-cyan" />;
      case 'card_delivery':
      case 'debit_delivery':
        return <CreditCard size={22} className="text-primary" />;
      case 'cash':
        return <Banknote size={22} className="text-green" />;
      default:
        return <FileText size={22} className="text-warning" />;
    }
  };

  return (
    <div className="admin-page-content animate-fade-in">
      <div className="admin-page-header flex-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Formas de Pagamento Aceitas</h2>
          <p className="text-xs text-muted">
            Configure as opções de pagamento disponíveis no checkout da loja (PIX, cartões, dinheiro e faturamento)
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn btn-primary btn-sm flex-center gap-2"
        >
          <Plus size={16} />
          <span>Nova Forma de Pagamento</span>
        </button>
      </div>

      {/* Grid de Formas de Pagamento */}
      <div className="admin-grid-cards mb-6">
        {paymentMethods.map((method) => (
          <div key={method.id} className="payment-admin-card glass-panel p-5">
            <div className="flex-between mb-3">
              <div className="flex-center gap-3">
                <div className="payment-icon-wrap p-3 rounded-lg bg-surface">
                  {getMethodIcon(method.type)}
                </div>
                <div>
                  <strong className="text-sm block text-main">{method.name}</strong>
                  <span className="text-xs text-muted font-mono">Tipo: {method.type}</span>
                </div>
              </div>
              <span className={`badge ${method.active ? 'badge-stock' : 'badge-low-stock'}`}>
                {method.active ? 'Ativo na Loja' : 'Desativado'}
              </span>
            </div>

            <p className="text-xs text-muted leading-relaxed my-2">
              {method.description || 'Sem descrição cadastrada.'}
            </p>

            <div className="payment-card-meta flex-between text-xs py-2 border-top border-bottom my-3">
              <span className="text-muted">Desconto no Pedido:</span>
              <strong className="text-green">
                {method.discountPercent > 0 ? `${method.discountPercent}% OFF` : 'Sem desconto'}
              </strong>
            </div>

            {method.instructions && (
              <div className="text-xs text-dim mb-3 italic">
                Instruções: {method.instructions}
              </div>
            )}

            <div className="flex-center gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => handleToggleStatus(method)}
                className={`btn btn-secondary btn-xs ${method.active ? 'text-warning' : 'text-green'}`}
              >
                {method.active ? 'Desativar' : 'Ativar'}
              </button>
              <button
                type="button"
                onClick={() => handleOpenEdit(method)}
                className="btn btn-secondary btn-xs flex-center gap-1"
              >
                <Edit2 size={13} />
                <span>Editar</span>
              </button>
              <button
                type="button"
                onClick={() => handlePromptDelete(method)}
                className="btn btn-secondary btn-xs text-danger flex-center gap-1"
              >
                <Trash2 size={13} />
                <span>Excluir</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Adicionar / Editar via Portal */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="modal-backdrop-portal"
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            backgroundColor: 'rgba(3, 7, 18, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            overflowY: 'auto'
          }}
        >
          <div
            className="admin-payment-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#0d1524',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '24px',
              padding: '2.25rem',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 40px rgba(0, 210, 255, 0.12)',
              position: 'relative',
              margin: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: 'rgba(0, 210, 255, 0.12)',
                    border: '1px solid rgba(0, 210, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00d2ff'
                  }}
                >
                  <CreditCard size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    {editingMethod ? 'Editar Forma de Pagamento' : 'Cadastrar Forma de Pagamento'}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                    Configure os parâmetros e condições de pagamento
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              <div className="form-field full-width" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.45rem' }}>
                  Nome Visível no Checkout *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cartão de Crédito em até 6x"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '14px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div className="form-field">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.45rem' }}>
                  Tipo / Mecanismo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '14px',
                    background: '#0b1322',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="pix">PIX Instantâneo</option>
                  <option value="card_delivery">Cartão de Crédito (Na Entrega)</option>
                  <option value="debit_delivery">Cartão de Débito (Na Entrega)</option>
                  <option value="cash">Dinheiro em Espécie (Na Entrega)</option>
                  <option value="boleto">Boleto Faturado (CNPJ / Oficina)</option>
                </select>
              </div>

              <div className="form-field">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.45rem' }}>
                  Desconto Oferecido (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  placeholder="0"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '14px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div className="form-field full-width" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.45rem' }}>
                  Descrição para o Cliente
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pagamento na maquininha sem fio no ato do recebimento"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '14px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div className="form-field full-width" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.45rem' }}>
                  Instruções Operacionais (Para o entregador / expedição)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Entregador deve portar maquininha compatível com bandeiras Visa/Master"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '14px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div
                className="form-field full-width"
                style={{
                  gridColumn: 'span 2',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  padding: '0.75rem 0'
                }}
              >
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.85rem', color: '#e2e8f0' }}>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#00d2ff' }}
                  />
                  <span>Disponível para seleção no checkout</span>
                </label>

                {formData.type === 'cash' && (
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.85rem', color: '#e2e8f0' }}>
                    <input
                      type="checkbox"
                      checked={formData.requiresChange}
                      onChange={(e) => setFormData({ ...formData, requiresChange: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#00d2ff' }}
                    />
                    <span>Exigir campo de troco</span>
                  </label>
                )}
              </div>

              {/* Botões Pill hu169yr */}
              <div
                className="full-width"
                style={{
                  gridColumn: 'span 2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '1rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.75rem 1.75rem',
                    borderRadius: '9999px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    color: '#e2e8f0',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, #00d2ff 0%, #0077ff 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0, 210, 255, 0.35)',
                    transition: 'all 0.2s'
                  }}
                >
                  {editingMethod ? 'Salvar Alterações' : 'Cadastrar Forma de Pagamento'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmação Universal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={handleExecuteConfirmedAction}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
}
