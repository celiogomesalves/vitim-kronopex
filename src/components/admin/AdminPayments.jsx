import React, { useState } from 'react';
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

      {/* Modal Adicionar / Editar */}
      {isModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-dialog admin-payment-dialog glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', width: '92%' }}
          >
            <div className="modal-header flex-between mb-4">
              <h3 className="font-bold text-base flex-center gap-2">
                <CreditCard size={18} className="text-cyan" />
                <span>{editingMethod ? 'Editar Forma de Pagamento' : 'Cadastrar Forma de Pagamento'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="admin-form-grid">
              <div className="form-field full-width mb-3">
                <label>Nome Visível no Checkout *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cartão de Crédito em até 6x"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-field mb-3">
                <label>Tipo / Mecanismo *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="pix">PIX Instantâneo</option>
                  <option value="card_delivery">Cartão de Crédito (Na Entrega)</option>
                  <option value="debit_delivery">Cartão de Débito (Na Entrega)</option>
                  <option value="cash">Dinheiro em Espécie (Na Entrega)</option>
                  <option value="boleto">Boleto Faturado (CNPJ / Oficina)</option>
                </select>
              </div>

              <div className="form-field mb-3">
                <label>Desconto Oferecido (%)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  placeholder="0"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                />
              </div>

              <div className="form-field full-width mb-3">
                <label>Descrição para o Cliente</label>
                <input
                  type="text"
                  placeholder="Ex: Pagamento na maquininha sem fio no ato do recebimento"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-field full-width mb-3">
                <label>Instruções Operacionais (Para o entregador / expedição)</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Entregador deve portar maquininha compatível com bandeiras Visa/Master"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                />
              </div>

              <div className="form-field full-width mb-4 flex-center gap-4">
                <label className="flex-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <span>Disponível para seleção no checkout</span>
                </label>

                {formData.type === 'cash' && (
                  <label className="flex-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={formData.requiresChange}
                      onChange={(e) => setFormData({ ...formData, requiresChange: e.target.checked })}
                    />
                    <span>Exigir campo de troco</span>
                  </label>
                )}
              </div>

              <div className="full-width flex-center gap-3 justify-end pt-3 border-top">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMethod ? 'Salvar Alterações' : 'Cadastrar Forma de Pagamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
