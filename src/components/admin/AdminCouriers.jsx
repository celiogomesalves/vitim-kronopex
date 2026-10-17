import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Truck, Plus, Phone, Trash2, CheckCircle2, Star, UserCheck, X } from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { EmptyState } from '../common/EmptyState';
import { formatPhone } from '../../utils/formatters';

export function AdminCouriers({ couriers, onSaveCouriers, canEdit = true }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicle: '',
    plate: ''
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

  const handleToggleStatus = (courier) => {
    if (!canEdit) return;
    const nextStatus = courier.status === 'available' ? 'offline' : 'available';
    setConfirmModal({
      isOpen: true,
      title: nextStatus === 'available' ? 'Colocar Entregador em Prontidão' : 'Desativar Turno do Entregador',
      message: `Deseja alterar o status de "${courier.name}" para ${nextStatus === 'available' ? 'Disponível' : 'Offline'}?`,
      actionType: 'toggle_status',
      payload: courier.id,
      variant: 'primary'
    });
  };

  const handlePromptDelete = (courier) => {
    if (!canEdit) return;
    setConfirmModal({
      isOpen: true,
      title: 'Confirmar Exclusão de Entregador',
      message: `Tem certeza que deseja remover "${courier.name}" da equipe de delivery?`,
      actionType: 'delete_courier',
      payload: courier.id,
      variant: 'danger'
    });
  };

  const handleExecuteConfirmedAction = () => {
    if (confirmModal.actionType === 'delete_courier') {
      onSaveCouriers(couriers.filter((c) => c.id !== confirmModal.payload));
    } else if (confirmModal.actionType === 'toggle_status') {
      const updated = couriers.map((c) => {
        if (c.id === confirmModal.payload) {
          const nextStatus = c.status === 'available' ? 'offline' : 'available';
          return { ...c, status: nextStatus };
        }
        return c;
      });
      onSaveCouriers(updated);
    }
    setConfirmModal({ isOpen: false, title: '', message: '', actionType: '', payload: null, variant: 'danger' });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newCourier = {
      id: `cour-${Date.now().toString().slice(-4)}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      vehicle: `${formData.vehicle} (Placa: ${formData.plate.toUpperCase()})`,
      status: 'available',
      deliveriesCompleted: 0,
      rating: 5.0,
      activeOrderCount: 0
    };
    onSaveCouriers([...couriers, newCourier]);
    setIsModalOpen(false);
    setFormData({ name: '', phone: '', vehicle: '', plate: '' });
  };

  return (
    <div className="admin-page-content animate-fade-in">
      <div className="admin-page-header flex-between mb-6">
        <div>
          <h2 className="text-xl font-bold">KronoPex Delivery - Equipe de Entregadores</h2>
          <p className="text-xs text-muted">
            Gerencie motoboys e furgões responsáveis pela entrega expressa aos clientes e oficinas
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary btn-sm flex-center gap-2"
          >
            <Plus size={16} />
            <span>Cadastrar Entregador</span>
          </button>
        )}
      </div>

      {/* Couriers Cards Grid or Empty State */}
      {couriers.length === 0 ? (
        <EmptyState
          icon={Truck}
          badgeText="Frota de Entrega Expressa"
          title="Nenhum Entregador Cadastrado"
          description="Cadastre motoboys e motoristas de utilitários para despachar pedidos diretamente para oficinas mecânicas e clientes finais com agilidade e rastreio em tempo real."
          actionText={canEdit ? 'Cadastrar Primeiro Entregador' : undefined}
          onAction={canEdit ? () => setIsModalOpen(true) : undefined}
        />
      ) : (
        <div className="couriers-cards-grid">
          {couriers.map((courier) => {
            const isAvailable = courier.status === 'available';
            const isDelivering = courier.status === 'delivering';

            return (
              <div key={courier.id} className="courier-card glass-panel p-5">
                <div className="courier-head flex-between mb-3">
                  <div className="flex-center gap-3">
                    <div className="courier-avatar-box p-3 rounded-lg bg-surface">
                      <Truck size={20} className="text-cyan" />
                    </div>
                    <div>
                      <strong className="text-sm block text-main">{courier.name}</strong>
                      <span className="text-xs text-muted flex-center gap-1">
                        <Phone size={12} /> {formatPhone(courier.phone)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`badge ${
                      isDelivering
                        ? 'badge-express'
                        : isAvailable
                        ? 'badge-stock'
                        : 'badge-low-stock'
                    }`}
                  >
                    {isDelivering ? '🛵 Em Rota' : isAvailable ? '🟢 Disponível' : '⚪ Offline'}
                  </span>
                </div>

                <div className="courier-vehicle-row text-xs text-muted py-2 border-top border-bottom my-3">
                  <span>Veículo & Placa:</span>
                  <strong className="text-main block">{courier.vehicle}</strong>
                </div>

                <div className="courier-metrics-row flex-between text-xs my-2">
                  <span className="flex-center gap-1 text-muted">
                    <Star size={13} className="text-warning fill-warning" />
                    <strong>{courier.rating || '5.0'}</strong> ({courier.deliveriesCompleted} entregas)
                  </span>
                  <span className="text-cyan font-semibold">
                    {courier.activeOrderCount || 0} em andamento
                  </span>
                </div>

                {canEdit && (
                  <div className="courier-actions-row flex-center gap-2 justify-end pt-3 border-top mt-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(courier)}
                      className="btn btn-secondary btn-xs"
                    >
                      {isAvailable ? 'Desativar Turno' : 'Disponibilizar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePromptDelete(courier)}
                      className="btn btn-secondary btn-xs text-danger"
                      title="Remover da frota"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Cadastrar Entregador via Portal */}
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
            className="admin-courier-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
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
                  <Truck size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    Cadastrar Novo Entregador
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                    Dados do piloto para alocação de entregas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="drawer-close-btn"
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              <div className="form-field full-width" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.45rem' }}>
                  Nome Completo do Entregador *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Roberto Nascimento"
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

              <div className="form-field full-width" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.45rem' }}>
                  Telefone / WhatsApp com DDD *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(11) 98765-4321"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
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
                  Modelo do Veículo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Honda CG 160 Fan"
                  value={formData.vehicle}
                  onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
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
                  Placa do Veículo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: ABC-1234 ou ABC1D23"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
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
                  Cadastrar Entregador
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
