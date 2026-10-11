import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  XCircle,
  X,
  Sparkles
} from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { ImageUploadSelector } from '../common/ImageUploadSelector';
import { SmartPagination } from '../common/SmartPagination';
import { QuickCategoryModal } from '../common/QuickCategoryModal';
import {
  formatCurrency,
  maskCurrencyInput,
  parseCurrencyToNumber
} from '../../utils/formatters';

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
  const [isQuickCatOpen, setIsQuickCatOpen] = useState(false);

  // Paginação
  const [inventoryPage, setInventoryPage] = useState(1);
  const [moderationPage, setModerationPage] = useState(1);
  const itemsPerPage = 8;

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
    price: 0,
    stock: '',
    minStock: '3',
    image: '',
    description: ''
  });

  const [priceInputDisplay, setPriceInputDisplay] = useState('');

  // Produtos pendentes de aprovação enviados por parceiros
  const pendingPartnerProducts = useMemo(() => {
    return products.filter((p) => Boolean(p.partnerId) && p.approvalStatus === 'pending');
  }, [products]);

  const inventoryProducts = useMemo(() => {
    return products.filter((p) => !p.partnerId || p.approvalStatus === 'approved');
  }, [products]);

  const filteredProducts = useMemo(() => {
    return inventoryProducts.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.oemCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [inventoryProducts, searchTerm, categoryFilter]);

  // Paginação para Estoque
  const totalInventoryPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedInventoryProducts = useMemo(() => {
    const start = (inventoryPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, inventoryPage, itemsPerPage]);

  // Paginação para Moderação
  const totalModerationPages = Math.ceil(pendingPartnerProducts.length / itemsPerPage) || 1;
  const paginatedModerationProducts = useMemo(() => {
    const start = (moderationPage - 1) * itemsPerPage;
    return pendingPartnerProducts.slice(start, start + itemsPerPage);
  }, [pendingPartnerProducts, moderationPage, itemsPerPage]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setPriceInputDisplay('');
    setFormData({
      name: '',
      category: categories.find((c) => c.id !== 'all')?.id || 'motor',
      brand: '',
      oemCode: '',
      vehicles: '',
      price: 0,
      stock: '',
      minStock: '3',
      image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setPriceInputDisplay(maskCurrencyInput(Math.round(product.price * 100)));
    setFormData({
      name: product.name,
      category: product.category,
      brand: product.brand,
      oemCode: product.oemCode,
      vehicles: product.vehicles ? product.vehicles.join(', ') : '',
      price: product.price,
      stock: product.stock.toString(),
      minStock: (product.minStock || 3).toString(),
      image: product.image,
      description: product.description || ''
    });
    setIsModalOpen(true);
  };

  const handlePriceChange = (e) => {
    const rawValue = e.target.value;
    const formatted = maskCurrencyInput(rawValue);
    setPriceInputDisplay(formatted);
    const numeric = parseCurrencyToNumber(formatted);
    setFormData((prev) => ({ ...prev, price: numeric }));
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
    const priceNum = Number(data.price) || 0;
    const stockNum = parseInt(data.stock, 10) || 0;
    const minStockNum = parseInt(data.minStock, 10) || 3;
    const vehiclesArr = (data.vehicles || '')
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

      {/* Abas de Navegação */}
      <div className="orders-filter-tabs glass-panel mb-6 flex-center gap-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab('inventory');
            setInventoryPage(1);
          }}
          className={`order-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
        >
          <Package size={16} />
          <span>Peças Aprovadas na Vitrine</span>
          <span className="order-tab-counter">{inventoryProducts.length}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('moderation');
            setModerationPage(1);
          }}
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setInventoryPage(1);
                }}
                className="search-input"
              />
            </div>

            <div className="flex-center gap-2">
              <Layers size={16} className="text-muted" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setInventoryPage(1);
                }}
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
                {paginatedInventoryProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted text-xs">
                      Nenhuma peça encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  paginatedInventoryProducts.map((p) => {
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
                  })
                )}
              </tbody>
            </table>

            {/* Paginação Inteligente */}
            {totalInventoryPages > 1 && (
              <div className="p-4 border-top">
                <SmartPagination
                  currentPage={inventoryPage}
                  totalPages={totalInventoryPages}
                  totalItems={filteredProducts.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setInventoryPage}
                />
              </div>
            )}
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
            <>
              <div className="admin-grid-cards mb-4">
                {paginatedModerationProducts.map((p) => (
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

              {totalModerationPages > 1 && (
                <div className="glass-panel p-4">
                  <SmartPagination
                    currentPage={moderationPage}
                    totalPages={totalModerationPages}
                    totalItems={pendingPartnerProducts.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setModerationPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modal Add / Edit Product via Portal */}
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
            className="admin-product-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '680px',
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
                  <Package size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    {editingProduct ? 'Editar Peça' : 'Cadastrar Nova Peça no Estoque'}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                    Preencha os detalhes técnicos e comerciais da peça
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
                  Nome Comercial da Peça *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Jogo de Velas Iridium G-Power"
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

              {/* Categoria com Botão de Acesso Rápido */}
              <div className="form-field">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Categoria *</label>
                  <button
                    type="button"
                    onClick={() => setIsQuickCatOpen(true)}
                    className="btn-action-badge"
                    title="Adicionar nova categoria rapidamente"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '9999px',
                      background: 'rgba(0, 210, 255, 0.15)',
                      border: '1px solid rgba(0, 210, 255, 0.35)',
                      color: '#00d2ff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={12} />
                    <span>+ Nova Categoria</span>
                  </button>
                </div>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '14px',
                    background: '#0b1322',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.95rem'
                  }}
                >
                  {categories.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.45rem' }}>
                  Marca / Fabricante *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bosch, Cofap, NGK"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
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
                  Código OEM / Part Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: BKR6EIX-11"
                  value={formData.oemCode}
                  onChange={(e) => setFormData({ ...formData, oemCode: e.target.value })}
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

              {/* Campo Preço com Máscara Monetária Real pt-BR */}
              <div className="form-field">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.45rem' }}>
                  Preço de Venda (R$) *
                </label>
                <div className="input-currency-group">
                  <span className="currency-prefix">R$</span>
                  <input
                    type="text"
                    required
                    placeholder="0,00"
                    value={priceInputDisplay}
                    onChange={handlePriceChange}
                    className="input-currency"
                    style={{
                      borderRadius: '14px',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
                {formData.price > 0 && (
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#10b981', marginTop: '0.35rem' }}>
                    Preço no PIX (-10%): {formatCurrency(formData.price * 0.9)}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.45rem' }}>
                  Estoque Atual *
                </label>
                <input
                  type="number"
                  required
                  placeholder="10"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
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
                  Estoque Mínimo de Alerta
                </label>
                <input
                  type="number"
                  placeholder="3"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
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
                  Veículos Compatíveis (Separados por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Gol G5/G6, Fox 1.6, Voyage 1.6"
                  value={formData.vehicles}
                  onChange={(e) => setFormData({ ...formData, vehicles: e.target.value })}
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

              {/* Upload e Galeria de Imagens */}
              <div className="form-field full-width" style={{ gridColumn: 'span 2' }}>
                <ImageUploadSelector
                  value={formData.image}
                  onChange={(img) => setFormData({ ...formData, image: img })}
                />
              </div>

              <div className="form-field full-width" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.45rem' }}>
                  Descrição Técnica
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalhes, especificações e diferenciais da peça..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '14px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Ações com botões em formato de Pílula (hu169yr) */}
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
                  {editingProduct ? 'Salvar Alterações' : 'Cadastrar Peça'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Rápido de Criação de Categoria sem sair da tela */}
      <QuickCategoryModal
        isOpen={isQuickCatOpen}
        onClose={() => setIsQuickCatOpen(false)}
        onCategoryCreated={(newCat) => {
          setFormData((prev) => ({ ...prev, category: newCat.id }));
        }}
      />

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
