import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  Truck,
  TrendingUp,
  Package,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export function AdminDashboard({
  products,
  orders,
  couriers,
  partners = [],
  onNavigate
}) {
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const deliveringOrders = orders.filter((o) => o.status === 'delivering');
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const activeCouriers = couriers.filter((c) => c.status !== 'offline');

  return (
    <div className="admin-page-content animate-fade-in">
      {/* Page Header */}
      <div className="admin-page-header flex-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Painel Geral KronoPex</h2>
          <p className="text-xs text-muted">
            Métricas em tempo real da vitrine online, catálogo de peças e logística express
          </p>
        </div>
        <div className="flex-center gap-2">
          <span className="live-pulse-badge flex-center gap-1 text-xs">
            <span className="pulse-dot"></span> Operação ao Vivo
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-cards-grid mb-6">
        <div className="kpi-card glass-panel">
          <div className="kpi-icon-wrap bg-cyan-glow">
            <DollarSign size={22} className="text-cyan" />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Faturamento Total</span>
            <span className="kpi-value text-cyan">{formatCurrency(totalRevenue)}</span>
            <span className="kpi-trend text-green flex-center gap-1 text-xs mt-1">
              <TrendingUp size={12} /> +18.4% esta semana
            </span>
          </div>
        </div>

        <div className="kpi-card glass-panel" onClick={() => onNavigate && onNavigate('orders')}>
          <div className="kpi-icon-wrap bg-primary-glow">
            <ShoppingBag size={22} className="text-primary" />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Pedidos Pendentes</span>
            <span className="kpi-value">{pendingOrders.length} novos</span>
            <span className="kpi-sub text-xs text-muted mt-1 block">
              {deliveringOrders.length} entregas em rota
            </span>
          </div>
        </div>

        <div className="kpi-card glass-panel" onClick={() => onNavigate && onNavigate('products')}>
          <div className="kpi-icon-wrap bg-warning-glow">
            <AlertTriangle size={22} className="text-warning" />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Estoque Crítico</span>
            <span className="kpi-value">{lowStockProducts.length} itens</span>
            <span className="kpi-sub text-xs text-muted mt-1 block">Abaixo do estoque mínimo</span>
          </div>
        </div>

        <div className="kpi-card glass-panel" onClick={() => onNavigate && onNavigate('couriers')}>
          <div className="kpi-icon-wrap bg-green-glow">
            <Truck size={22} className="text-green" />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">KronoPex Delivery</span>
            <span className="kpi-value">{activeCouriers.length} ativos</span>
            <span className="kpi-sub text-xs text-muted mt-1 block">Motoboys em prontidão</span>
          </div>
        </div>
      </div>

      {/* Content Columns: Recent Orders & Stock Alerts */}
      <div className="admin-grid-2cols">
        {/* Recent Orders List */}
        <div className="admin-panel-card glass-panel p-5">
          <div className="panel-header flex-between mb-4 pb-2 border-bottom">
            <h3 className="font-bold text-sm flex-center gap-2">
              <Clock size={16} className="text-cyan" />
              <span>Últimos Pedidos dos Clientes</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('orders')}
              className="btn-action-badge"
            >
              <span>Ver todos</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="recent-orders-list space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="recent-order-row flex-between py-2 border-bottom">
                <div>
                  <div className="flex-center gap-2">
                    <strong className="text-xs text-cyan font-mono">#{order.id}</strong>
                    <span className="text-xs text-main font-semibold">
                      {order.customer.name}
                    </span>
                  </div>
                  <span className="text-xs text-muted block mt-1">
                    {order.items.length} itens • {order.customer.neighborhood} ({order.paymentMethodName || order.paymentMethod?.toUpperCase()})
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xs block text-main">
                    {formatCurrency(order.total)}
                  </span>
                  <span className={`badge ${
                    order.status === 'pending'
                      ? 'badge-low-stock'
                      : order.status === 'delivering'
                      ? 'badge-express'
                      : 'badge-stock'
                  } mt-1`}>
                    {order.status === 'pending'
                      ? 'Pendente'
                      : order.status === 'preparing'
                      ? 'Separação'
                      : order.status === 'delivering'
                      ? 'Em Entrega'
                      : 'Concluído'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Stock Alert */}
        <div className="admin-panel-card glass-panel p-5">
          <div className="panel-header flex-between mb-4 pb-2 border-bottom">
            <h3 className="font-bold text-sm flex-center gap-2">
              <Package size={16} className="text-warning" />
              <span>Peças com Estoque Baixo</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('products')}
              className="btn-action-badge"
            >
              <span>Gerenciar Estoque</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="stock-alerts-list space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">
                Todos os produtos estão com níveis de estoque saudáveis!
              </p>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="stock-alert-row flex-between py-2 border-bottom">
                  <div className="flex-center gap-3">
                    <img src={p.image} alt={p.name} className="alert-part-thumb" />
                    <div>
                      <h5 className="text-xs font-semibold text-main line-clamp-1">{p.name}</h5>
                      <span className="text-xs text-muted">OEM: {p.oemCode}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-low-stock font-bold">
                      {p.stock} em estoque
                    </span>
                    <span className="text-xs text-dim block mt-1">mín: {p.minStock}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
