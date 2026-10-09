import React, { useState } from 'react';
import { Truck, Plus, Phone, Trash2, CheckCircle2, Star, UserCheck } from 'lucide-react';

export function AdminCouriers({ couriers, onSaveCouriers, canEdit = true }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicle: '',
    plate: ''
  });

  const handleToggleStatus = (id) => {
    if (!canEdit) return;
    const updated = couriers.map((c) => {
      if (c.id === id) {
        const nextStatus = c.status === 'available' ? 'offline' : 'available';
        return { ...c, status: nextStatus };
      }
      return c;
    });
    onSaveCouriers(updated);
  };

  const handleDelete = (id) => {
    if (!canEdit) return;
    if (window.confirm('Deseja remover este entregador da equipe KronoPex?')) {
      onSaveCouriers(couriers.filter((c) => c.id !== id));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newCourier = {
      id: `cour-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      phone: formData.phone,
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
      <div className="admin-page-header flex-between mb-4">
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
            <div key={courier.id} className="courier-card glass-panel">
              <div className="courier-head flex-between">
                <div className="flex-center gap-2">
                  <div className="courier-avatar-box">
                    <Truck size={18} className="text-cyan" />
                  </div>
                  <div>
                    <strong className="text-sm block text-main">{courier.name}</strong>
                    <span className="text-xs text-muted flex-center gap-1">
                      <Phone size={12} /> {courier.phone}
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

              <div className="courier-vehicle-info mt-3 p-2 rounded bg-surface text-xs">
                <span className="text-muted block">Veículo / Identificação:</span>
                <span className="font-semibold text-main">{courier.vehicle}</span>
              </div>

              <div className="courier-stats-row flex-between mt-3 text-xs">
                <span className="text-muted">
                  <strong>{courier.deliveriesCompleted}</strong> entregas realizadas
                </span>
                <span className="flex-center gap-1 text-cyan font-bold">
                  <Star size={13} fill="#00d2ff" /> {courier.rating}
                </span>
              </div>

              {canEdit && (
                <div className="courier-actions-row flex-between mt-3 pt-2 border-top">
                  <button
                    onClick={() => handleToggleStatus(courier.id)}
                    className="btn btn-secondary btn-xs flex-1 mr-2"
                  >
                    {isAvailable ? 'Marcar Offline' : 'Marcar Disponível'}
                  </button>
                  <button
                    onClick={() => handleDelete(courier.id)}
                    className="table-action-btn text-danger"
                    title="Remover entregador"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Add Courier */}
      {isModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-dialog admin-courier-dialog glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header flex-between mb-3">
              <h3 className="font-bold text-base flex-center gap-2">
                <Truck size={18} className="text-cyan" />
                <span>Novo Entregador KronoPex Delivery</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="admin-form-grid">
              <div className="form-field full-width">
                <label>Nome do Entregador / Motoboy *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo da Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-field full-width">
                <label>Telefone / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="(11) 98765-4321"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Modelo do Veículo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Honda CG 160 Titan / Fiorino"
                  value={formData.vehicle}
                  onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Placa do Veículo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: BRA2E19"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                />
              </div>

              <div className="full-width flex-center gap-2 justify-end mt-3">
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
    </div>
  );
}
