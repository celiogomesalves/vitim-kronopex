import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Building2,
  Package,
  Plus,
  LogOut,
  Store,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle
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
  const [isQuickCatOpen, setIsQuickCatOpen] = useState(false);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
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

  const [formData, setFormData] = useState({
    name: '',
    category: 'freios',
    brand: partner?.tradeName || 'Distribuidora',
    oemCode: '',
    vehicles: '',
    price: 0,
    stock: '',
    image: 'https://images.unsplash.com/photo-1600793575654-910699b5e4d4?w=800&auto=format&fit=crop&q=80',
    description: ''
  });

  const [priceInputDisplay, setPriceInputDisplay] = useState('');

  // Filtra produtos pertencentes a este parceiro
  const partnerProducts = useMemo(() => {
    return products.filter(
      (p) => p.partnerId === partner?.id || p.brand?.includes(partner?.tradeName)
    );
  }, [products, partner]);

  const totalPages = Math.ceil(partnerProducts.length / itemsPerPage) || 1;
  const paginatedPartnerProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return partnerProducts.slice(start, start + itemsPerPage);
  }, [partnerProducts, currentPage, itemsPerPage]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setPriceInputDisplay('');
    setFormData({
      name: '',
      category: categories.find((c) => c.id !== 'all')?.id || 'freios',
      brand: partner?.tradeName || 'Distribuidora',
      oemCode: '',
      vehicles: '',
      price: 0,
      stock: '',
      image: 'https://images.unsplash.com/photo-1600793575654-910699b5e4d4?w=800&auto=format&fit=crop&q=80',
      description: ''
    });
    setIsAddModalOpen(true);
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
      image: product.image,
      description: product.description || ''
    });
    setIsAddModalOpen(true);
  };

  const handlePriceChange = (e) => {
    const rawValue = e.target.value;
    const formatted = maskCurrencyInput(rawValue);
    setPriceInputDisplay(formatted);
    const numeric = parseCurrencyToNumber(formatted);
    setFormData((prev) => ({ ...prev, price: numeric }));
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
    const priceNum = Number(data.price) || 0;
    const stockNum = parseInt(data.stock, 10) || 0;
    const vehiclesArr = (data.vehicles || '')
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
                {paginatedPartnerProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted text-xs">
                      Você ainda não cadastrou nenhuma peça. Clique em "Anunciar Nova Peça" para começar!
                    </td>
                  </tr>
                ) : (
                  paginatedPartnerProducts.map((p) => {
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

            {/* Paginação do Parceiro */}
            {totalPages > 1 && (
              <div className="p-4 border-top">
                <SmartPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={partnerProducts.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Adicionar / Editar Peça via Portal */}
      {isAddModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="modal-backdrop-portal"
          onClick={() => setIsAddModalOpen(false)}
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
                    {editingProduct ? 'Editar Anúncio de Peça' : 'Anunciar Peça na Vitrine KronoPex'}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                    A peça será analisada e validada pelo administrador
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
              >
                ✕
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
                  placeholder="Ex: Amortecedor Dianteiro TurboGás"
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
                    className="text-xs text-cyan hover-underline flex-center gap-1"
                    title="Adicionar categoria rápida"
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
                  placeholder="Ex: Cofap, Bosch, Monroe"
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
                  Código OEM / Part Number
                </label>
                <input
                  type="text"
                  placeholder="Ex: GP-32890"
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

              {/* Preço com Máscara Monetária Real */}
              <div className="form-field">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.45rem' }}>
                  Preço ao Consumidor (R$) *
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
                    Seu repasse líquido estimado: {formatCurrency(formData.price * (1 - (partner?.commissionRate || 12) / 100))}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.45rem' }}>
                  Estoque Disponível *
                </label>
                <input
                  type="number"
                  required
                  placeholder="8"
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

              <div className="form-field full-width" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.45rem' }}>
                  Veículos Compatíveis
                </label>
                <input
                  type="text"
                  placeholder="Ex: Onix 1.0/1.4, Prisma 2013 a 2019"
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
                  Descrição do Produto
                </label>
                <textarea
                  rows={3}
                  placeholder="Especificações, estado do item e garantia..."
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

              {/* Botões Pill hu169yr */}
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
                  onClick={() => setIsAddModalOpen(false)}
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
                  {editingProduct ? 'Salvar Alterações' : 'Submeter para Avaliação'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Rápido de Criação de Categoria */}
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
