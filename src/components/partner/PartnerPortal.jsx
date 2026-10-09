import React, { useState } from 'react';
import {
  Building2,
  Package,
  Plus,
  DollarSign,
  TrendingUp,
  Percent,
  LogOut,
  Store,
  Layers,
  Edit2,
  Trash2,
  CheckCircle,
  Truck
} from 'lucide-react';
import { INITIAL_CATEGORIES } from '../../data/mockProducts';

export function PartnerPortal({
  partner,
  onLogout,
  onBackToStore,
  products,
  onSaveProducts
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'freios',
    brand: partner?.tradeName || 'Distribuidora',
    oemCode: '',
    vehicles: '',
    price: '',
    stock: '',
    image: 'https://images.unsplash.com/photo-1600793575654-910699b5e4d4?w=800&auto=format&fit=crop&q=80',
    description: ''
  });

  // Filter products belonging to this partner or matching categories
  const partnerProducts = products.filter((p) => p.partnerId === partner?.id || p.brand?.includes(partner?.tradeName));

  const handleCreateProduct = (e) => {
    e.preventDefault();
    const priceNum = parseFloat(formData.price) || 0;
    const stockNum = parseInt(formData.stock, 10) || 0;
    const vehiclesArr = formData.vehicles
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newPiece = {
      id: `kp-partner-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      category: formData.category,
      brand: formData.brand,
      oemCode: formData.oemCode,
      vehicles: vehiclesArr,
      price: priceNum,
      pixDiscountPrice: priceNum * 0.9,
      stock: stockNum,
      minStock: 2,
      isExpressDelivery: true,
      partnerId: partner?.id,
      partnerName: partner?.tradeName,
      partnerCommissionRate: (partner?.commissionRate || 12) / 100,
      image: formData.image,
      description: formData.description,
      specs: {
        'Distribuidor Parceiro': partner?.companyName,
        'Garantia': 'Garantia de 90 dias / Envio KronoPex'
      }
    };

    onSaveProducts([newPiece, ...products]);
    setIsAddModalOpen(false);
  };

  const handleStockAdjust = (id, delta) => {
    const updated = products.map((p) => {
      if (p.id === id) {
        return { ...p, stock: Math.max(0, p.stock + delta) };
      }
      return p;
    });
    onSaveProducts(updated);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Deseja remover esta peça do seu anúncio na KronoPex?')) {
      onSaveProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="admin-root-container">
      {/* Sidebar for Partner */}
      <aside className="admin-sidebar glass-panel">
        <div className="admin-brand-header flex-between">
          <img src="/logo.png" alt="KronoPex" className="admin-sidebar-logo" />
        </div>

        {/* Partner Identity Card */}
        <div className="admin-user-badge-card glass-panel my-3">
          <div className="flex-center gap-3">
            <div className="courier-avatar-box">
              <Building2 size={20} className="text-cyan" />
            </div>
            <div className="user-text-col">
              <strong className="block text-xs text-main">{partner?.tradeName}</strong>
              <span className="badge badge-express">Fornecedor Parceiro</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToStore}
          className="btn btn-outline-primary w-full btn-sm flex-center gap-2 mb-4"
        >
          <Store size={15} />
          <span>Ver Vitrine da Loja</span>
        </button>

        <nav className="admin-nav-list">
          <div className="admin-nav-item active flex-center gap-3">
            <Package size={17} className="text-cyan" />
            <span>Meus Produtos & Estoque</span>
          </div>
        </nav>

        <div className="admin-sidebar-foot mt-auto pt-4 border-top">
          <button
            type="button"
            onClick={onLogout}
            className="btn btn-secondary w-full btn-sm flex-center gap-2 text-danger"
          >
            <LogOut size={15} />
            <span>Sair do Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="admin-main-viewport">
        <header className="admin-viewport-topbar glass-panel flex-between px-6 py-3">
          <div className="flex-center gap-2 text-xs text-muted">
            <span className="text-cyan font-bold">Portal do Fornecedor</span>
            <span>•</span>
            <span className="text-main font-semibold">{partner?.companyName}</span>
          </div>

          <div className="badge badge-express font-bold">
            Comissão KronoPex: {partner?.commissionRate}%
          </div>
        </header>

        <div className="admin-content-scroll px-6 py-4">
          {/* Welcome Banner & KPI Cards */}
          <div className="partner-welcome-banner glass-panel p-4 mb-4 flex-between">
            <div>
              <h2 className="text-lg font-bold text-main">
                Olá, {partner?.contactName}!
              </h2>
              <p className="text-xs text-muted">
                Seu estoque está conectado à vitrine KronoPex. Entregas expressas feitas pela frota da loja.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary btn-sm flex-center gap-2"
            >
              <Plus size={16} />
              <span>Anunciar Nova Peça</span>
            </button>
          </div>

          <div className="kpi-cards-grid mb-4">
            <div className="kpi-card glass-panel">
              <div className="kpi-icon-wrap bg-primary-glow">
                <TrendingUp size={22} className="text-primary" />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Vendas Totais</span>
                <span className="kpi-value">R$ {(partner?.metrics?.totalSold || 0).toFixed(2)}</span>
                <span className="kpi-trend text-xs text-muted">Faturamento bruto</span>
              </div>
            </div>

            <div className="kpi-card glass-panel">
              <div className="kpi-icon-wrap bg-cyan-glow">
                <DollarSign size={22} className="text-cyan" />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Líquido a Receber</span>
                <span className="kpi-value text-cyan">R$ {(partner?.metrics?.payoutDue || 0).toFixed(2)}</span>
                <span className="kpi-trend text-xs text-green">Já com dedução de {partner?.commissionRate}%</span>
              </div>
            </div>

            <div className="kpi-card glass-panel">
              <div className="kpi-icon-wrap bg-green-glow">
                <Package size={22} className="text-green" />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Peças Cadastradas</span>
                <span className="kpi-value">{partnerProducts.length} itens</span>
                <span className="kpi-trend text-xs text-muted">Disponíveis na vitrine</span>
              </div>
            </div>

            <div className="kpi-card glass-panel">
              <div className="kpi-icon-wrap bg-warning-glow">
                <Truck size={22} className="text-warning" />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Logística Ativa</span>
                <span className="kpi-value">KronoPex Express</span>
                <span className="kpi-trend text-xs text-muted">Despacho em até 1h</span>
              </div>
            </div>
          </div>

          {/* Partner Products Table */}
          <div className="admin-panel-card glass-panel">
            <div className="panel-header flex-between mb-3">
              <h3 className="font-bold text-sm text-main">
                Catálogo de Peças da Sua Distribuidora
              </h3>
              <span className="text-xs text-muted">
                {partnerProducts.length} itens encontrados
              </span>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Peça / Produto</th>
                    <th>Categoria</th>
                    <th>OEM</th>
                    <th>Preço de Venda</th>
                    <th>Seu Líquido ({100 - (partner?.commissionRate || 12)}%)</th>
                    <th>Estoque</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {partnerProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-muted text-xs">
                        Você ainda não cadastrou nenhuma peça. Clique em "Anunciar Nova Peça" acima!
                      </td>
                    </tr>
                  ) : (
                    partnerProducts.map((p) => {
                      const netPerUnit = p.price * (1 - (partner?.commissionRate || 12) / 100);
                      return (
                        <tr key={p.id}>
                          <td>
                            <div className="flex-center gap-2">
                              <img src={p.image} alt={p.name} className="table-product-thumb" />
                              <div>
                                <strong className="text-xs text-main block">{p.name}</strong>
                                <span className="text-xs text-dim">ID: {p.id}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-express">{p.category}</span>
                          </td>
                          <td>
                            <span className="font-mono text-xs text-cyan">{p.oemCode || 'N/A'}</span>
                          </td>
                          <td>
                            <strong className="text-xs text-main">R$ {p.price.toFixed(2)}</strong>
                          </td>
                          <td>
                            <strong className="text-xs text-green">R$ {netPerUnit.toFixed(2)}</strong>
                          </td>
                          <td>
                            <div className="flex-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleStockAdjust(p.id, -1)}
                                className="stock-btn-step"
                              >
                                -
                              </button>
                              <span className="badge badge-stock font-bold">{p.stock} un.</span>
                              <button
                                type="button"
                                onClick={() => handleStockAdjust(p.id, 1)}
                                className="stock-btn-step"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="table-action-btn text-danger"
                              title="Remover"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Add Partner Product */}
      {isAddModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="modal-dialog admin-product-dialog glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header flex-between mb-3">
              <h3 className="font-bold text-base text-main flex-center gap-2">
                <Package size={18} className="text-cyan" />
                <span>Anunciar Peça na Vitrine KronoPex</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="admin-form-grid">
              <div className="form-field full-width">
                <label>Nome Comercial da Peça *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bomba D'água com Rotor de Alumínio"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Categoria *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {INITIAL_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Código OEM / Part Number *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: OEM-94812"
                  value={formData.oemCode}
                  onChange={(e) => setFormData({ ...formData, oemCode: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Preço de Venda ao Cliente (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="180.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
                {formData.price && (
                  <span className="text-xs text-green">
                    Seu líquido: R$ {(parseFloat(formData.price) * (1 - (partner?.commissionRate || 12) / 100)).toFixed(2)} (após {partner?.commissionRate}% KronoPex)
                  </span>
                )}
              </div>

              <div className="form-field">
                <label>Estoque Disponível *</label>
                <input
                  type="number"
                  required
                  placeholder="15"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>

              <div className="form-field full-width">
                <label>Veículos Compatíveis (Separados por vírgula)</label>
                <input
                  type="text"
                  placeholder="Ex: Corolla 2.0, Civic 1.8/2.0, Cruze 1.4 Turbo"
                  value={formData.vehicles}
                  onChange={(e) => setFormData({ ...formData, vehicles: e.target.value })}
                />
              </div>

              <div className="form-field full-width">
                <label>URL da Imagem da Peça</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>

              <div className="form-field full-width">
                <label>Descrição & Garantia</label>
                <textarea
                  rows={2}
                  placeholder="Aplicação, procedência e garantia da peça..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="full-width flex-center gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Publicar na Vitrine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
