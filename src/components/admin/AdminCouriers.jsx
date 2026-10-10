import React, { useState } from 'react';
import { Truck, Plus, Phone, Trash2, CheckCircle2, Star, UserCheck } from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';
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

      {/* Couriers Cards Grid */}
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

      {/* Modal Cadastrar Entregador */}
      {isModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-dialog admin-courier-dialog glass-panel p-5"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', width: '92%' }}
          >
            <div className="modal-header flex-between mb-4">
              <h3 className="font-bold text-base flex-center gap-2">
                <Truck size={18} className="text-cyan" />
                <span>Cadastrar Novo Entregador</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="admin-form-grid">
              <div className="form-field full-width mb-3">
                <label>Nome Completo do Entregador *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Roberto Nascimento"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-field full-width mb-3">
                <label>Telefone / WhatsApp com DDD *</label>
                <input
                  type="tel"
                  required
                  placeholder="(11) 98765-4321"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                />
              </div>

              <div className="form-field mb-3">
                <label>Modelo do Veículo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Honda CG 160 Fan"
                  value={formData.vehicle}
                  onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                />
              </div>

              <div className="form-field mb-4">
                <label>Placa do Veículo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: ABC-1234 ou ABC1D23"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                />
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
                  Cadastrar Entregador
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
