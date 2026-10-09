import React, { useState } from 'react';
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  MessageCircle,
  MapPin,
  Phone,
  User,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { FcmService } from '../../services/fcm';

export function AdminOrders({
  orders,
  couriers,
  onSaveOrders,
  canUpdateStatus = true
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  const handleUpdateStatus = (orderId, newStatus) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const orderUpdated = { ...o, status: newStatus };
        FcmService.notifyStatusUpdate(orderUpdated);
        return orderUpdated;
      }
      return o;
    });
    onSaveOrders(updated);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handleAssignCourier = (orderId, courierId) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, courierId: courierId || null, status: courierId ? 'delivering' : o.status };
      }
      return o;
    });
    onSaveOrders(updated);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, courierId: courierId || null }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-low-stock">🕒 Pendente</span>;
      case 'preparing':
        return <span className="badge badge-operator">📦 Em Separação</span>;
      case 'delivering':
        return <span className="badge badge-express">🛵 Saiu para Entrega</span>;
      case 'delivered':
        return <span className="badge badge-stock">✅ Entregue</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  const openWhatsAppWithCustomer = (order) => {
    const cleanPhone = order.customer.phone.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Olá ${order.customer.name}! Aqui é da equipe KronoPex Auto Peças. Estamos atualizando sobre o seu pedido #${order.id}. Está tudo pronto e estamos em prontidão para tirar dúvidas!`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="admin-page-content animate-fade-in">
      <div className="admin-page-header flex-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Administração de Pedidos & Expedição</h2>
          <p className="text-xs text-muted">
            Acompanhe o ciclo de vida: do recebimento à entrega expressa pelo motoboy
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="orders-filter-tabs glass-panel mb-4 flex-center gap-2">
        {[
          { id: 'all', label: 'Todos os Pedidos', count: orders.length },
          { id: 'pending', label: 'Pendentes', count: orders.filter((o) => o.status === 'pending').length },
          { id: 'preparing', label: 'Em Separação', count: orders.filter((o) => o.status === 'preparing').length },
          { id: 'delivering', label: 'Em Rota de Entrega', count: orders.filter((o) => o.status === 'delivering').length },
          { id: 'delivered', label: 'Concluídos', count: orders.filter((o) => o.status === 'delivered').length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`order-tab-btn ${statusFilter === tab.id ? 'active' : ''}`}
          >
            <span>{tab.label}</span>
            <span className="order-tab-counter">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="orders-dashboard-layout">
        <div className="orders-list-col">
          {filteredOrders.length === 0 ? (
            <div className="glass-panel text-center py-8">
              <p className="text-muted text-sm">Nenhum pedido encontrado nesta etapa.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              const courier = couriers.find((c) => c.id === order.courierId);

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`order-admin-card glass-panel ${isSelected ? 'selected' : ''}`}
                >
                  <div className="order-card-head flex-between">
                    <div className="flex-center gap-2">
                      <span className="font-mono font-bold text-cyan text-sm">
                        #{order.id}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <span className="text-xs text-muted">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="order-card-body mt-2">
                    <strong className="text-sm block text-main">{order.customer.name}</strong>
                    <div className="flex-center gap-1 text-xs text-muted">
                      <MapPin size={12} className="text-cyan" />
                      <span>{order.customer.neighborhood} - {order.customer.city}</span>
                    </div>

                    <div className="order-card-items-snippet mt-2 text-xs text-muted">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                  </div>

                  <div className="order-card-foot flex-between mt-3 pt-2 border-top text-xs">
                    <span className="font-bold text-main">
                      R$ {order.total.toFixed(2)} ({order.paymentMethod.toUpperCase()})
                    </span>
                    <span className="text-cyan flex-center gap-1">
                      <span>Ver detalhes</span>
                      <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Order Details Panel */}
        <div className="order-details-col">
          {selectedOrder ? (
            <div className="glass-panel order-detail-sheet animate-fade-in">
              <div className="sheet-header flex-between mb-3">
                <div>
                  <span className="font-mono text-cyan font-bold text-base">
                    Pedido #{selectedOrder.id}
                  </span>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <button
                  onClick={() => openWhatsAppWithCustomer(selectedOrder)}
                  className="btn btn-primary btn-sm flex-center gap-1"
                  style={{ background: '#25D366' }}
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp Cliente</span>
                </button>
              </div>

              {/* Status Stepper Progression */}
              {canUpdateStatus && (
                <div className="status-progression-bar glass-panel p-2 mb-3">
                  <span className="text-xs font-semibold text-muted mb-2 block">
                    Atualizar Etapa do Pedido:
                  </span>
                  <div className="status-buttons-row flex-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'pending')}
                      className={`btn btn-xs flex-1 ${selectedOrder.status === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Pendente
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'preparing')}
                      className={`btn btn-xs flex-1 ${selectedOrder.status === 'preparing' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Em Separação
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'delivering')}
                      className={`btn btn-xs flex-1 ${selectedOrder.status === 'delivering' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Em Entrega
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                      className={`btn btn-xs flex-1 ${selectedOrder.status === 'delivered' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Concluído
                    </button>
                  </div>
                </div>
              )}

              {/* Courier Assignment */}
              <div className="courier-assign-box mb-3">
                <label className="text-xs font-semibold text-muted block mb-1">
                  Atribuir Entregador KronoPex Delivery:
                </label>
                <select
                  value={selectedOrder.courierId || ''}
                  onChange={(e) => handleAssignCourier(selectedOrder.id, e.target.value)}
                  className="admin-select w-full"
                >
                  <option value="">Nenhum entregador atribuído ainda</option>
                  {couriers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.vehicle} ({c.status === 'available' ? 'Livre' : 'Ocupado'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Info */}
              <div className="sheet-section mb-3">
                <h5 className="text-xs font-bold text-main uppercase tracking-wider mb-2">
                  Dados do Cliente & Entrega
                </h5>
                <div className="info-box-pill text-xs">
                  <div className="flex-center gap-2 mb-1">
                    <User size={14} className="text-cyan" />
                    <strong>{selectedOrder.customer.name}</strong>
                  </div>
                  <div className="flex-center gap-2 mb-1 text-muted">
                    <Phone size={14} className="text-cyan" />
                    <span>{selectedOrder.customer.phone}</span>
                  </div>
                  <div className="flex-center gap-2 text-muted">
                    <MapPin size={14} className="text-cyan" />
                    <span>{selectedOrder.customer.address} - {selectedOrder.customer.neighborhood}, {selectedOrder.customer.city}</span>
                  </div>
                  {selectedOrder.customer.reference && (
                    <div className="text-xs text-dim mt-1">
                      Ref: {selectedOrder.customer.reference}
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="sheet-section">
                <h5 className="text-xs font-bold text-main uppercase tracking-wider mb-2">
                  Peças do Pedido ({selectedOrder.items.length})
                </h5>
                <div className="sheet-items-table">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="sheet-item-row flex-between text-xs py-1">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="font-semibold text-cyan">
                        R$ {(it.price * it.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="sheet-total-row flex-between font-bold text-sm pt-2 border-top mt-2">
                    <span>Total ({selectedOrder.paymentMethod.toUpperCase()}):</span>
                    <span className="text-gradient-cyan text-base">
                      R$ {selectedOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel text-center py-12 text-muted text-xs">
              <Package size={32} className="mx-auto mb-2 text-dim" />
              Selecione um pedido ao lado para visualizar os detalhes e despachar com o motoboy.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
