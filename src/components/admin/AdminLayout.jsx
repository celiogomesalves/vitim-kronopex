import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  Users,
  Settings,
  Briefcase,
  Store,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Layers,
  CreditCard
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminCouriers } from './AdminCouriers';
import { AdminPartners } from './AdminPartners';
import { AdminUsers } from './AdminUsers';
import { AdminSettings } from './AdminSettings';
import { AdminCategories } from './AdminCategories';
import { AdminPayments } from './AdminPayments';

export function AdminLayout({
  currentUser,
  onLogout,
  onBackToStore,
  products,
  onSaveProducts,
  categories,
  onSaveCategories,
  paymentMethods,
  onSavePaymentMethods,
  orders,
  onSaveOrders,
  couriers,
  onSaveCouriers,
  staff,
  onSaveStaff,
  partners = [],
  onSavePartners,
  partnerRequests = [],
  onApprovePartner,
  onRejectPartner,
  config,
  onSaveConfig
}) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const canEditProducts = currentUser.role === 'admin' || currentUser.role === 'manager';
  const pendingPartnerProductsCount = products.filter((p) => p.partnerId && p.approvalStatus === 'pending').length;

  const navItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    {
      id: 'products',
      label: 'Estoque & Peças',
      icon: Package,
      count: pendingPartnerProductsCount > 0 ? pendingPartnerProductsCount : products.filter((p) => p.stock <= p.minStock).length
    },
    { id: 'categories', label: 'Categorias & Prateleiras', icon: Layers, adminOnly: true },
    { id: 'orders', label: 'Pedidos & Expedição', icon: ShoppingBag, count: orders.filter((o) => o.status === 'pending').length },
    { id: 'couriers', label: 'KronoPex Delivery', icon: Truck },
    { id: 'payments', label: 'Formas de Pagamento', icon: CreditCard, adminOnly: true },
    { id: 'partners', label: 'Parceiros & Fornecedores', icon: Briefcase, count: partnerRequests.filter((r) => r.status === 'pending').length, adminOnly: true },
    { id: 'users', label: 'Equipe & Permissões', icon: Users, adminOnly: true },
    { id: 'settings', label: 'Configurações', icon: Settings, adminOnly: true }
  ];

  return (
    <div className="admin-root-container">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar glass-panel">
        {/* Brand Area */}
        <div className="admin-brand-header flex-between">
          <div className="flex-center gap-2">
            <img src="/logo.png" alt="KronoPex" className="admin-sidebar-logo" />
          </div>
        </div>

        {/* Current Logged User Card */}
        <div className="admin-user-badge-card glass-panel my-4 p-3">
          <div className="flex-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="admin-avatar-img"
            />
            <div className="user-text-col">
              <strong className="block text-xs text-main">{currentUser.name}</strong>
              <span className={`badge ${currentUser.role === 'admin' ? 'badge-admin' : currentUser.role === 'manager' ? 'badge-manager' : 'badge-operator'}`}>
                {currentUser.roleName}
              </span>
            </div>
          </div>
        </div>

        {/* Back to Vitrine Button */}
        <button
          type="button"
          onClick={onBackToStore}
          className="btn btn-outline-primary w-full btn-sm flex-center gap-2 mb-4"
        >
          <Store size={16} />
          <span>Voltar para Vitrine da Loja</span>
        </button>

        {/* Navigation Items */}
        <nav className="admin-nav-list">
          {navItems.map((item) => {
            if (item.adminOnly && currentUser.role !== 'admin') {
              return null; // hide admin-only pages for operators
            }
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`admin-nav-item flex-between ${isActive ? 'active' : ''}`}
              >
                <div className="flex-center gap-3">
                  <Icon size={17} className={isActive ? 'text-cyan' : 'text-muted'} />
                  <span>{item.label}</span>
                </div>
                {item.count > 0 && (
                  <span className="admin-badge-count">{item.count}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="admin-sidebar-foot mt-auto pt-4 border-top">
          <button
            onClick={onLogout}
            className="btn btn-secondary w-full btn-sm flex-center gap-2 text-danger"
          >
            <LogOut size={15} />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Viewport */}
      <main className="admin-main-viewport">
        {/* Top Header Bar */}
        <header className="admin-viewport-topbar glass-panel flex-between px-6 py-4">
          <div className="flex-center gap-2 text-xs text-muted">
            <span className="text-cyan font-semibold">KronoPex Gestão</span>
            <ChevronRight size={14} />
            <span className="text-main font-bold capitalize">{activeTab}</span>
          </div>

          <div className="flex-center gap-4">
            <div className="flex-center gap-2">
              <span className="status-indicator-live"></span>
              <span className="text-xs text-muted">Loja Aberta • Entregas Express</span>
            </div>
          </div>
        </header>

        {/* View Content Body */}
        <div className="admin-content-scroll px-6 py-6">
          {activeTab === 'dashboard' && (
            <AdminDashboard
              products={products}
              orders={orders}
              couriers={couriers}
              partners={partners}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'products' && (
            <AdminProducts
              products={products}
              onSaveProducts={onSaveProducts}
              categories={categories}
              canEdit={canEditProducts}
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategories
              categories={categories}
              onSaveCategories={onSaveCategories}
              products={products}
            />
          )}

          {activeTab === 'payments' && (
            <AdminPayments
              paymentMethods={paymentMethods}
              onSavePaymentMethods={onSavePaymentMethods}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrders
              orders={orders}
              onSaveOrders={onSaveOrders}
              couriers={couriers}
            />
          )}

          {activeTab === 'couriers' && (
            <AdminCouriers
              couriers={couriers}
              onSaveCouriers={onSaveCouriers}
              canEdit={currentUser.role === 'admin'}
            />
          )}

          {activeTab === 'partners' && (
            <AdminPartners
              partners={partners}
              partnerRequests={partnerRequests}
              onApprovePartner={onApprovePartner}
              onRejectPartner={onRejectPartner}
              onSavePartners={onSavePartners}
              orders={orders}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsers
              staff={staff}
              onSaveStaff={onSaveStaff}
              partners={partners}
              onSavePartners={onSavePartners}
              currentAdmin={currentUser}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettings
              config={config}
              onSaveConfig={onSaveConfig}
            />
          )}
        </div>
      </main>
    </div>
  );
}
