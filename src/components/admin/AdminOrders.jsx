import React, { useState } from 'react';
import {
  Package,
  MessageCircle,
  MapPin,
  Phone,
  User,
  ChevronRight
} from 'lucide-react';
import { FcmService } from '../../services/fcm';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { SmartPagination } from '../common/SmartPagination';
import { formatCurrency, formatPhone, formatDateTime } from '../../utils/formatters';

const ORDERS_PER_PAGE = 8;

export function AdminOrders({
  orders,
  couriers,
  onSaveOrders,
  canUpdateStatus = true
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ordersPage, setOrdersPage] = useState(1);

  // Confirmações
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionType: '',
    payload: null,
    variant: 'primary'
  });

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  const totalOrderPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE) || 1;
  const currentOrderPage = Math.min(ordersPage, totalOrderPages);
  const paginatedOrders = filteredOrders.slice(
    (currentOrderPage - 1) * ORDERS_PER_PAGE,
    currentOrderPage * ORDERS_PER_PAGE
  );

  const handlePromptUpdateStatus = (orderId, newStatus) => {
    const statusLabels = {
      pending: 'Pendente',
      preparing: 'Em Separação',
      delivering: 'Em Rota de Entrega',
      delivered: 'Concluído / Entregue'
    };
    setConfirmModal({
      isOpen: true,
      title: 'Alterar Status do Pedido',
      message: `Deseja avançar o pedido #${orderId} para "${statusLabels[newStatus] || newStatus}"?`,
      actionType: 'update_status',
      payload: { orderId, newStatus },
      variant: newStatus === 'delivered' ? 'primary' : 'warning'
    });
  };

  const executeUpdateStatus = (orderId, newStatus) => {
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
    const courier = couriers.find((c) => c.id === courierId);
    setConfirmModal({
      isOpen: true,
      title: 'Atribuir Entregador ao Pedido',
      message: courierId
        ? `Deseja alocar o motoboy "${courier?.name}" para realizar a entrega do pedido #${orderId}?`
        : `Deseja desvincular o entregador do pedido #${orderId}?`,
      actionType: 'assign_courier',
      payload: { orderId, courierId },
      variant: 'primary'
    });
  };

  const executeAssignCourier = (orderId, courierId) => {
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

  const handleExecuteConfirmedAction = () => {
    if (confirmModal.actionType === 'update_status') {
      executeUpdateStatus(confirmModal.payload.orderId, confirmModal.payload.newStatus);
    } else if (confirmModal.actionType === 'assign_courier') {
      executeAssignCourier(confirmModal.payload.orderId, confirmModal.payload.courierId);
    }
    setConfirmModal({ isOpen: false, title: '', message: '', actionType: '', payload: null, variant: 'primary' });
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
      <div className="admin-page-header flex-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Administração de Pedidos & Expedição</h2>
          <p className="text-xs text-muted">
            Acompanhe o ciclo de vida: do recebimento à entrega expressa pelo motoboy
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="orders-filter-tabs glass-panel mb-6 flex-center gap-2">
        {[
          { id: 'all', label: 'Todos os Pedidos', count: orders.length },
          { id: 'pending', label: 'Pendentes', count: orders.filter((o) => o.status === 'pending').length },
          { id: 'preparing', label: 'Em Separação', count: orders.filter((o) => o.status === 'preparing').length },
          { id: 'delivering', label: 'Em Rota de Entrega', count: orders.filter((o) => o.status === 'delivering').length },
          { id: 'delivered', label: 'Concluídos', count: orders.filter((o) => o.status === 'delivered').length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setStatusFilter(tab.id);
              setOrdersPage(1);
            }}
            className={`order-tab-btn ${statusFilter === tab.id ? 'active' : ''}`}
          >
            <span>{tab.label}</span>
            <span className="order-tab-counter">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Orders Grid Layout */}
      <div className="orders-admin-layout">
        {/* Orders Cards List */}
        <div className="orders-cards-col space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="glass-panel text-center py-10 text-muted text-xs">
              Nenhum pedido encontrado nesta etapa.
            </div>
          ) : (
            <>
              {paginatedOrders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`order-admin-card glass-panel p-4 ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="order-card-head flex-between">
                      <div className="flex-center gap-2">
                        <span className="font-mono font-bold text-cyan text-sm">
                          #{order.id}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <span className="text-xs text-muted">
                        {formatDateTime(order.createdAt)}
                      </span>
                    </div>

                    <div className="order-card-body mt-3">
                      <strong className="text-sm block text-main">{order.customer.name}</strong>
                      <div className="flex-center gap-1 text-xs text-muted mt-1">
                        <MapPin size={12} className="text-cyan" />
                        <span>{order.customer.neighborhood} - {order.customer.city}</span>
                      </div>

                      <div className="order-card-items-snippet mt-2 text-xs text-muted line-clamp-1">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                    </div>

                    <div className="order-card-foot flex-between mt-3 pt-3 border-top text-xs">
                      <span className="font-bold text-main">
                        {formatCurrency(order.total)} ({order.paymentMethodName || order.paymentMethod?.toUpperCase()})
                      </span>
                      <span className="text-cyan flex-center gap-1">
                        <span>Ver detalhes</span>
                        <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                );
              })}

              <SmartPagination
                currentPage={currentOrderPage}
                totalPages={totalOrderPages}
                totalItems={filteredOrders.length}
                itemsPerPage={ORDERS_PER_PAGE}
                onPageChange={setOrdersPage}
                label="pedidos"
              />
            </>
          )}
        </div>

        {/* Selected Order Details Panel */}
        <div className="order-details-col">
          {selectedOrder ? (
            <div className="glass-panel order-detail-sheet animate-fade-in p-5">
              <div className="sheet-header flex-between mb-4 pb-3 border-bottom">
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
                <div className="status-progression-bar glass-panel p-3 mb-4">
                  <span className="text-xs font-semibold text-muted mb-2 block">
                    Atualizar Etapa do Pedido (mediante confirmação):
                  </span>
                  <div className="status-buttons-row flex-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePromptUpdateStatus(selectedOrder.id, 'pending')}
                      className={`btn btn-xs flex-1 ${selectedOrder.status === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Pendente
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePromptUpdateStatus(selectedOrder.id, 'preparing')}
                      className={`btn btn-xs flex-1 ${selectedOrder.status === 'preparing' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Em Separação
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePromptUpdateStatus(selectedOrder.id, 'delivering')}
                      className={`btn btn-xs flex-1 ${selectedOrder.status === 'delivering' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Em Entrega
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePromptUpdateStatus(selectedOrder.id, 'delivered')}
                      className={`btn btn-xs flex-1 ${selectedOrder.status === 'delivered' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Concluído
                    </button>
                  </div>
                </div>
              )}

              {/* Courier Assignment */}
              <div className="courier-assign-box mb-4">
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
              <div className="sheet-section mb-4 p-3 rounded bg-surface">
                <h5 className="text-xs font-bold text-main uppercase tracking-wider mb-2">
                  Dados do Cliente & Entrega
                </h5>
                <div className="info-box-pill text-xs space-y-1">
                  <div className="flex-center gap-2">
                    <User size={14} className="text-cyan" />
                    <strong>{selectedOrder.customer.name}</strong>
                  </div>
                  <div className="flex-center gap-2 text-muted">
                    <Phone size={14} className="text-cyan" />
                    <span>{formatPhone(selectedOrder.customer.phone)}</span>
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
                <div className="sheet-items-table space-y-2">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="sheet-item-row flex-between text-xs py-1 border-bottom">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="font-semibold text-cyan">
                        {formatCurrency(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="sheet-total-row flex-between font-bold text-sm pt-3 border-top mt-2">
                    <span>Total ({selectedOrder.paymentMethodName || selectedOrder.paymentMethod?.toUpperCase()}):</span>
                    <span className="text-cyan text-base">
                      {formatCurrency(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel text-center py-16 text-muted text-xs">
              <Package size={36} className="mx-auto mb-3 text-cyan opacity-40" />
              Selecione um pedido ao lado para visualizar os detalhes e despachar com o motoboy.
            </div>
          )}
        </div>
      </div>

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
