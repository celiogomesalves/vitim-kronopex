import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  Package,
  Layers,
  ShieldCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { ImageUploadSelector } from '../common/ImageUploadSelector';
import { formatCurrency } from '../../utils/formatters';

export function AdminProducts({
  products,
  onSaveProducts,
  categories = [],
  canEdit = true
}) {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'moderation'
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'motor',
    brand: '',
    oemCode: '',
    vehicles: '',
    price: '',
    stock: '',
    minStock: '3',
    image: '',
    description: ''
  });

  // Produtos pendentes de aprovação enviados por parceiros
  const pendingPartnerProducts = products.filter(
    (p) => Boolean(p.partnerId) && p.approvalStatus === 'pending'
  );

  const inventoryProducts = products.filter(
    (p) => !p.partnerId || p.approvalStatus === 'approved'
  );

  const filteredProducts = inventoryProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.oemCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: categories.find((c) => c.id !== 'all')?.id || 'motor',
      brand: '',
      oemCode: '',
      vehicles: '',
      price: '',
      stock: '',
      minStock: '3',
      image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
      description: ''
    });
    setIsModalOpen(true);
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
      minStock: (product.minStock || 3).toString(),
      image: product.image,
      description: product.description || ''
    });
    setIsModalOpen(true);
  };

  const handlePromptDelete = (product) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirmar Exclusão de Peça',
      message: `Tem certeza que deseja excluir "${product.name}" do catálogo da KronoPex? Esta ação não pode ser desfeita.`,
      actionType: 'delete_product',
      payload: product.id,
      variant: 'danger'
    });
  };

  const handlePromptApprovePartnerProduct = (product) => {
    setConfirmModal({
      isOpen: true,
      title: 'Aprovar Produto de Fornecedor',
      message: `Deseja aprovar "${product.name}" do fornecedor "${product.partnerName}" para publicação imediata na Vitrine do Cliente?`,
      actionType: 'approve_product',
      payload: product.id,
      variant: 'primary'
    });
  };

  const handlePromptRejectPartnerProduct = (product) => {
    setConfirmModal({
      isOpen: true,
      title: 'Recusar Produto de Fornecedor',
      message: `Deseja recusar a publicação de "${product.name}" na Vitrine? O produto não será exposto aos clientes.`,
      actionType: 'reject_product',
      payload: product.id,
      variant: 'warning'
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      setConfirmModal({
        isOpen: true,
        title: 'Confirmar Alterações na Peça',
        message: `Deseja salvar as alterações cadastrais efetuadas em "${formData.name}"?`,
        actionType: 'save_product_edit',
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
    const minStockNum = parseInt(data.minStock, 10) || 3;
    const vehiclesArr = data.vehicles
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (targetId) {
      // Edit
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
            minStock: minStockNum,
            image: data.image || p.image,
            description: data.description
          };
        }
        return p;
      });
      onSaveProducts(updated);
    } else {
      // Create new
      const newProduct = {
        id: `kp-${Date.now().toString().slice(-4)}`,
        name: data.name,
        category: data.category,
        brand: data.brand,
        oemCode: data.oemCode,
        vehicles: vehiclesArr,
        price: priceNum,
        pixDiscountPrice: priceNum * 0.9,
        stock: stockNum,
        minStock: minStockNum,
        isExpressDelivery: true,
        approvalStatus: 'approved',
        rating: 5.0,
        reviewsCount: 1,
        image: data.image || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
        description: data.description,
        specs: {
          'Procedência': 'Peça Nova Original / Garantia KronoPex',
          'Aplicação': vehiclesArr.join(' / ')
        }
      };
      onSaveProducts([newProduct, ...products]);
    }
    setIsModalOpen(false);
  };

  const handleExecuteConfirmedAction = () => {
    if (confirmModal.actionType === 'delete_product') {
      const updated = products.filter((p) => p.id !== confirmModal.payload);
      onSaveProducts(updated);
    } else if (confirmModal.actionType === 'save_product_edit') {
      executeSaveProduct(editingProduct.id, confirmModal.payload);
    } else if (confirmModal.actionType === 'approve_product') {
      const updated = products.map((p) =>
        p.id === confirmModal.payload ? { ...p, approvalStatus: 'approved' } : p
      );
      onSaveProducts(updated);
    } else if (confirmModal.actionType === 'reject_product') {
      const updated = products.map((p) =>
        p.id === confirmModal.payload ? { ...p, approvalStatus: 'rejected' } : p
      );
      onSaveProducts(updated);
    }

    setConfirmModal({ isOpen: false, title: '', message: '', actionType: '', payload: null, variant: 'danger' });
  };

  return (
    <div className="admin-page-content animate-fade-in">
      {/* Header & Controls */}
      <div className="admin-page-header flex-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Catálogo, Peças & Moderação</h2>
          <p className="text-xs text-muted">
            Cadastre novas peças, gerencie o estoque e aprove os produtos enviados por fornecedores parceiros
          </p>
        </div>
        {canEdit && (
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm flex-center gap-2">
            <Plus size={16} />
            <span>Cadastrar Nova Peça</span>
          </button>
        )}
      </div>

      {/* Abas de Navegação (Estoque da Loja vs Moderação de Fornecedores) */}
      <div className="orders-filter-tabs glass-panel mb-6 flex-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`order-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
        >
          <Package size={16} />
          <span>Peças Aprovadas na Vitrine</span>
          <span className="order-tab-counter">{inventoryProducts.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('moderation')}
          className={`order-tab-btn ${activeTab === 'moderation' ? 'active' : ''}`}
        >
          <ShieldCheck size={16} />
          <span>Moderação de Parceiros</span>
          {pendingPartnerProducts.length > 0 && (
            <span className="badge badge-warning font-bold ml-1">
              {pendingPartnerProducts.length} pendente{pendingPartnerProducts.length !== 1 ? 's' : ''}
            </span>
          )}
        </button>
      </div>

      {/* ABA 1: Estoque Geral */}
      {activeTab === 'inventory' && (
        <>
          {/* Filter and Search Bar */}
          <div className="admin-filters-bar glass-panel mb-6 flex-between p-4">
            <div className="search-input-box flex-1 max-w-md">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Pesquisar por peça, marca ou OEM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="flex-center gap-2">
              <Layers size={16} className="text-muted" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">Todas as Categorias</option>
                {categories.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="admin-table-wrapper glass-panel">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Peça / Produto</th>
                  <th>Origem</th>
                  <th>Categoria</th>
                  <th>Código OEM</th>
                  <th>Preço de Venda</th>
                  <th>Estoque</th>
                  {canEdit && <th className="text-right">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isLow = p.stock <= p.minStock;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="flex-center gap-3">
                          <img src={p.image} alt={p.name} className="table-product-thumb" />
                          <div>
                            <strong className="block text-xs text-main">{p.name}</strong>
                            <span className="text-xs text-muted">{p.brand}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {p.partnerId ? (
                          <span className="badge badge-express" title={`Fornecedor: ${p.partnerName}`}>
                            {p.partnerName || 'Parceiro'}
                          </span>
                        ) : (
                          <span className="badge badge-stock">KronoPex Direto</span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-express">{p.category}</span>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-cyan">{p.oemCode}</span>
                      </td>
                      <td>
                        <div>
                          <strong className="text-xs text-main">{formatCurrency(p.price)}</strong>
                          <span className="text-xs text-green block">
                            PIX: {formatCurrency(p.pixDiscountPrice || p.price * 0.9)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex-center gap-2">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleStockAdjust(p.id, -1)}
                              className="stock-btn-step"
                            >
                              -
                            </button>
                          )}
                          <span className={`badge ${isLow ? 'badge-low-stock' : 'badge-stock'} font-bold`}>
                            {p.stock} un.
                          </span>
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleStockAdjust(p.id, +1)}
                              className="stock-btn-step"
                            >
                              +
                            </button>
                          )}
                        </div>
                      </td>
                      {canEdit && (
                        <td className="text-right">
                          <div className="flex-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(p)}
                              className="table-action-btn"
                              title="Editar peça"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePromptDelete(p)}
                              className="table-action-btn text-danger"
                              title="Remover peça"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ABA 2: Moderação de Produtos de Fornecedores */}
      {activeTab === 'moderation' && (
        <div className="moderation-container">
          {pendingPartnerProducts.length === 0 ? (
            <div className="glass-panel text-center py-12 text-muted text-xs">
              <CheckCircle2 size={40} className="mx-auto mb-3 text-cyan opacity-40" />
              <strong className="text-sm block text-main mb-1">Tudo em dia!</strong>
              Nenhum produto enviado por fornecedores aguardando aprovação no momento.
            </div>
          ) : (
            <div className="admin-grid-cards">
              {pendingPartnerProducts.map((p) => (
                <div key={p.id} className="moderation-card glass-panel p-5">
                  <div className="flex-between mb-3">
                    <span className="badge badge-warning flex-center gap-1 font-bold">
                      <AlertCircle size={13} /> Aguardando Moderação
                    </span>
                    <span className="text-xs font-mono text-muted">ID: {p.id}</span>
                  </div>

                  <div className="flex-center gap-4 mb-4">
                    <img src={p.image} alt={p.name} className="table-product-thumb" style={{ width: '70px', height: '70px' }} />
                    <div>
                      <strong className="text-sm block text-main">{p.name}</strong>
                      <span className="text-xs text-muted block">Fabricante: {p.brand} • OEM: {p.oemCode}</span>
                      <span className="text-xs text-cyan font-semibold block mt-1">
                        Fornecedor: {p.partnerName || 'Parceiro'}
                      </span>
                    </div>
                  </div>

                  <div className="moderation-meta-grid text-xs p-3 rounded bg-surface mb-4 space-y-1">
                    <div className="flex-between">
                      <span className="text-muted">Preço ao Consumidor:</span>
                      <strong className="text-main">{formatCurrency(p.price)}</strong>
                    </div>
                    <div className="flex-between">
                      <span className="text-muted">Desconto PIX:</span>
                      <strong className="text-green">{formatCurrency(p.pixDiscountPrice || p.price * 0.9)}</strong>
                    </div>
                    <div className="flex-between">
                      <span className="text-muted">Estoque Informado:</span>
                      <strong className="text-main">{p.stock} unidades</strong>
                    </div>
                    <div className="flex-between">
                      <span className="text-muted">Categoria da Peça:</span>
                      <strong className="text-cyan">{p.category}</strong>
                    </div>
                  </div>

                  {p.description && (
                    <p className="text-xs text-muted mb-4 line-clamp-2 italic">
                      "{p.description}"
                    </p>
                  )}

                  <div className="flex-center gap-3 justify-end pt-3 border-top">
                    <button
                      type="button"
                      onClick={() => handlePromptRejectPartnerProduct(p)}
                      className="btn btn-secondary btn-xs text-danger flex-center gap-1"
                    >
                      <XCircle size={14} />
                      <span>Recusar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePromptApprovePartnerProduct(p)}
                      className="btn btn-primary btn-xs flex-center gap-1"
                    >
                      <CheckCircle2 size={14} />
                      <span>Aprovar para Vitrine</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Add / Edit Product */}
      {isModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-dialog admin-product-dialog glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', width: '92%' }}
          >
            <div className="modal-header flex-between mb-4">
              <h3 className="font-bold text-base flex-center gap-2">
                <Package size={18} className="text-cyan" />
                <span>{editingProduct ? 'Editar Peça' : 'Cadastrar Nova Peça no Estoque'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="admin-form-grid">
              <div className="form-field full-width mb-3">
                <label>Nome Comercial da Peça *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Jogo de Velas Iridium G-Power"
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
                  placeholder="Ex: Bosch, Cofap, NGK"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>

              <div className="form-field mb-3">
                <label>Código OEM / Part Number *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: BKR6EIX-11"
                  value={formData.oemCode}
                  onChange={(e) => setFormData({ ...formData, oemCode: e.target.value })}
                />
              </div>

              <div className="form-field mb-3">
                <label>Preço de Venda (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="199.90"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div className="form-field mb-3">
                <label>Estoque Atual *</label>
                <input
                  type="number"
                  required
                  placeholder="10"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>

              <div className="form-field mb-3">
                <label>Estoque Mínimo de Alerta</label>
                <input
                  type="number"
                  placeholder="3"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                />
              </div>

              <div className="form-field full-width mb-3">
                <label>Veículos Compatíveis (Separados por vírgula)</label>
                <input
                  type="text"
                  placeholder="Ex: Gol G5/G6, Fox 1.6, Voyage 1.6"
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
                <label>Descrição Técnica</label>
                <textarea
                  rows={3}
                  placeholder="Detalhes, especificações e diferenciais da peça..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  {editingProduct ? 'Salvar Alterações' : 'Cadastrar Peça'}
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
