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
  Truck,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { ImageUploadSelector } from '../common/ImageUploadSelector';
import { formatCurrency } from '../../utils/formatters';

export function PartnerPortal({
  partner,
  onLogout,
  onBackToStore,
  products,
  onSaveProducts,
  categories = []
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Confirmações
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionType: '',
    payload: null,
    variant: 'danger'
  });

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

  // Filtra produtos pertencentes a este parceiro
  const partnerProducts = products.filter(
    (p) => p.partnerId === partner?.id || p.brand?.includes(partner?.tradeName)
  );

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: categories.find((c) => c.id !== 'all')?.id || 'freios',
      brand: partner?.tradeName || 'Distribuidora',
      oemCode: '',
      vehicles: '',
      price: '',
      stock: '',
      image: 'https://images.unsplash.com/photo-1600793575654-910699b5e4d4?w=800&auto=format&fit=crop&q=80',
      description: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      brand: product.brand,
      oemCode: product.oemCode,
      vehicles: product.vehicles ? product.vehicles.join(', ') : '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      image: product.image,
      description: product.description || ''
    });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      setConfirmModal({
        isOpen: true,
        title: 'Confirmar Edição do Produto',
        message: `Deseja salvar as alterações em "${formData.name}"? O produto passará por nova revisão do administrador caso necessário.`,
        actionType: 'save_edit',
        payload: { ...formData },
        variant: 'primary'
      });
    } else {
      executeSaveProduct(null, formData);
    }
  };

  const executeSaveProduct = (targetId, data) => {
    const priceNum = parseFloat(data.price) || 0;
    const stockNum = parseInt(data.stock, 10) || 0;
    const vehiclesArr = data.vehicles
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (targetId) {
      const updated = products.map((p) => {
        if (p.id === targetId) {
          return {
            ...p,
            name: data.name,
            category: data.category,
            brand: data.brand,
            oemCode: data.oemCode,
            vehicles: vehiclesArr,
            price: priceNum,
            pixDiscountPrice: priceNum * 0.9,
            stock: stockNum,
            image: data.image || p.image,
            description: data.description,
            approvalStatus: partner?.requiresApproval !== false ? 'pending' : 'approved'
          };
        }
        return p;
      });
      onSaveProducts(updated);
    } else {
      const newPiece = {
        id: `kp-partner-${Date.now().toString().slice(-4)}`,
        name: data.name,
        category: data.category,
        brand: data.brand,
        oemCode: data.oemCode,
        vehicles: vehiclesArr,
        price: priceNum,
        pixDiscountPrice: priceNum * 0.9,
        stock: stockNum,
        minStock: 2,
        isExpressDelivery: true,
        partnerId: partner?.id,
        partnerName: partner?.tradeName,
        partnerCommissionRate: (partner?.commissionRate || 12) / 100,
        approvalStatus: partner?.requiresApproval !== false ? 'pending' : 'approved',
        image: data.image,
        description: data.description,
        specs: {
          'Distribuidor Parceiro': partner?.companyName,
          'Garantia': 'Garantia de 90 dias / Envio KronoPex'
        }
      };
      onSaveProducts([newPiece, ...products]);
    }
    setIsAddModalOpen(false);
  };

  const handlePromptDelete = (prod) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirmar Exclusão de Anúncio',
      message: `Tem certeza que deseja remover "${prod.name}" da KronoPex?`,
      actionType: 'delete_product',
      payload: prod.id,
      variant: 'danger'
    });
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

  const handleExecuteConfirmedAction = () => {
    if (confirmModal.actionType === 'delete_product') {
      onSaveProducts(products.filter((p) => p.id !== confirmModal.payload));
    } else if (confirmModal.actionType === 'save_edit') {
      executeSaveProduct(editingProduct.id, confirmModal.payload);
    }
    setConfirmModal({ isOpen: false, title: '', message: '', actionType: '', payload: null, variant: 'danger' });
  };

  return (
    <div className="admin-root-container">
      {/* Sidebar do Fornecedor */}
      <aside className="admin-sidebar glass-panel">
        <div className="admin-brand-header flex-between">
          <img src="/logo.png" alt="KronoPex" className="admin-sidebar-logo" />
        </div>

        {/* Card de Identidade do Fornecedor */}
        <div className="admin-user-badge-card glass-panel my-4 p-4">
          <div className="flex-center gap-3">
            <div className="courier-avatar-box p-3 rounded-lg bg-surface">
              <Building2 size={22} className="text-cyan" />
            </div>
            <div className="user-text-col">
              <strong className="block text-xs text-main">{partner?.tradeName}</strong>
              <span className="badge badge-express">Fornecedor Homologado</span>
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
        <header className="admin-viewport-topbar glass-panel flex-between px-6 py-4">
          <div className="flex-center gap-2 text-xs text-muted">
            <span className="text-cyan font-bold">Portal do Fornecedor</span>
            <span>•</span>
            <span className="text-main font-semibold">{partner?.companyName}</span>
          </div>

          <div className="badge badge-express font-bold">
            Comissão KronoPex: {partner?.commissionRate}%
          </div>
        </header>

        <div className="admin-content-scroll px-6 py-6">
          {/* Welcome Banner */}
          <div className="partner-welcome-banner glass-panel p-5 mb-6 flex-between">
            <div>
              <h2 className="text-lg font-bold text-main mb-1">
                Bem-vindo ao Portal de Fornecedores KronoPex
              </h2>
              <p className="text-xs text-muted">
                Cadastre seus produtos para a vitrine. Todo produto cadastrado passa por aprovação do administrador antes de ser exposto aos clientes.
              </p>
            </div>
            {partner?.canUploadProducts !== false ? (
              <button
                onClick={handleOpenAdd}
                className="btn btn-primary btn-sm flex-center gap-2"
              >
                <Plus size={16} />
                <span>Anunciar Nova Peça</span>
              </button>
            ) : (
              <span className="badge badge-warning">Upload temporariamente suspenso</span>
            )}
          </div>

          {/* Lista de Peças do Parceiro */}
          <div className="admin-table-wrapper glass-panel">
            <div className="p-4 border-bottom flex-between">
              <h3 className="font-bold text-sm text-main">Meus Produtos Cadastrados</h3>
              <span className="text-xs text-muted">{partnerProducts.length} itens encontrados</span>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Peça / Fabricante</th>
                  <th>Categoria</th>
                  <th>Preço ao Consumidor</th>
                  <th>Seu Ganho Líquido</th>
                  <th>Estoque</th>
                  <th>Status na Vitrine</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {partnerProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted text-xs">
                      Você ainda não cadastrou nenhuma peça. Clique em "Anunciar Nova Peça" para começar!
                    </td>
                  </tr>
                ) : (
                  partnerProducts.map((p) => {
                    const commissionRate = (partner?.commissionRate || 12) / 100;
                    const netEarning = p.price * (1 - commissionRate);
                    const isApproved = p.approvalStatus === 'approved';
                    const isPending = !p.approvalStatus || p.approvalStatus === 'pending';

                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="flex-center gap-3">
                            <img src={p.image} alt={p.name} className="table-product-thumb" />
                            <div>
                              <strong className="block text-xs text-main">{p.name}</strong>
                              <span className="text-xs text-muted font-mono">{p.oemCode || p.brand}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-express">{p.category}</span>
                        </td>
                        <td>
                          <strong className="text-xs text-main">{formatCurrency(p.price)}</strong>
                        </td>
                        <td>
                          <strong className="text-xs text-green">{formatCurrency(netEarning)}</strong>
                          <span className="text-xs text-dim block">(-{partner?.commissionRate || 12}% comissão)</span>
                        </td>
                        <td>
                          <div className="flex-center gap-2">
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
                              onClick={() => handleStockAdjust(p.id, +1)}
                              className="stock-btn-step"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>
                          {isApproved ? (
                            <span className="badge badge-stock flex-center gap-1">
                              <CheckCircle2 size={12} /> Aprovado na Vitrine
                            </span>
                          ) : isPending ? (
                            <span className="badge badge-warning flex-center gap-1 font-semibold">
                              <Clock size={12} /> Aguardando Avaliação
                            </span>
                          ) : (
                            <span className="badge badge-low-stock flex-center gap-1">
                              <XCircle size={12} /> Recusado pelo Admin
                            </span>
                          )}
                        </td>
                        <td className="text-right">
                          <div className="flex-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(p)}
                              className="table-action-btn"
                              title="Editar anúncio"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePromptDelete(p)}
                              className="table-action-btn text-danger"
                              title="Remover anúncio"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Adicionar / Editar Peça */}
      {isAddModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="modal-dialog admin-product-dialog glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '620px', width: '92%' }}
          >
            <div className="modal-header flex-between mb-4">
              <h3 className="font-bold text-base flex-center gap-2">
                <Package size={18} className="text-cyan" />
                <span>{editingProduct ? 'Editar Anúncio de Peça' : 'Anunciar Peça na Vitrine KronoPex'}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="admin-form-grid">
              <div className="form-field full-width mb-3">
                <label>Nome Comercial da Peça *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amortecedor Dianteiro TurboGás"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-field mb-3">
                <label>Categoria *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field mb-3">
                <label>Marca / Fabricante *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cofap, Bosch, Monroe"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>

              <div className="form-field mb-3">
                <label>Código OEM / Part Number</label>
                <input
                  type="text"
                  placeholder="Ex: GP-32890"
                  value={formData.oemCode}
                  onChange={(e) => setFormData({ ...formData, oemCode: e.target.value })}
                />
              </div>

              <div className="form-field mb-3">
                <label>Preço de Venda ao Consumidor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="249.90"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div className="form-field mb-3">
                <label>Estoque Disponível *</label>
                <input
                  type="number"
                  required
                  placeholder="8"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>

              <div className="form-field full-width mb-3">
                <label>Veículos Compatíveis</label>
                <input
                  type="text"
                  placeholder="Ex: Onix 1.0/1.4, Prisma 2013 a 2019"
                  value={formData.vehicles}
                  onChange={(e) => setFormData({ ...formData, vehicles: e.target.value })}
                />
              </div>

              {/* Upload e Galeria de Imagens */}
              <div className="form-field full-width mb-3">
                <ImageUploadSelector
                  value={formData.image}
                  onChange={(img) => setFormData({ ...formData, image: img })}
                />
              </div>

              <div className="form-field full-width mb-4">
                <label>Descrição do Produto</label>
                <textarea
                  rows={3}
                  placeholder="Especificações, estado do item e garantia..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="full-width flex-center gap-3 justify-end pt-3 border-top">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Salvar Alterações' : 'Submeter para Avaliação'}
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
