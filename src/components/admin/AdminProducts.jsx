import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  Check,
  Package,
  Layers,
  Image as ImageIcon,
  DollarSign
} from 'lucide-react';
import { INITIAL_CATEGORIES } from '../../data/mockProducts';

export function AdminProducts({ products, onSaveProducts, canEdit = true }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

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

  const filteredProducts = products.filter((p) => {
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
      category: 'motor',
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

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta peça do catálogo da KronoPex?')) {
      const updated = products.filter((p) => p.id !== id);
      onSaveProducts(updated);
    }
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
    const priceNum = parseFloat(formData.price) || 0;
    const stockNum = parseInt(formData.stock, 10) || 0;
    const minStockNum = parseInt(formData.minStock, 10) || 3;
    const vehiclesArr = formData.vehicles
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingProduct) {
      // Update
      const updated = products.map((p) => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: formData.name,
            category: formData.category,
            brand: formData.brand,
            oemCode: formData.oemCode,
            vehicles: vehiclesArr,
            price: priceNum,
            pixDiscountPrice: priceNum * 0.9,
            stock: stockNum,
            minStock: minStockNum,
            image: formData.image || p.image,
            description: formData.description
          };
        }
        return p;
      });
      onSaveProducts(updated);
    } else {
      // Add new
      const newProduct = {
        id: `kp-${Date.now().toString().slice(-4)}`,
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        oemCode: formData.oemCode,
        vehicles: vehiclesArr,
        price: priceNum,
        pixDiscountPrice: priceNum * 0.9,
        stock: stockNum,
        minStock: minStockNum,
        isExpressDelivery: true,
        rating: 5.0,
        reviewsCount: 1,
        image: formData.image || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
        description: formData.description,
        specs: {
          'Procedência': 'Peça Nova Original / Garantia KronoPex',
          'Aplicação': vehiclesArr.join(' / ')
        }
      };
      onSaveProducts([newProduct, ...products]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="admin-page-content animate-fade-in">
      {/* Header & Controls */}
      <div className="admin-page-header flex-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Catálogo & Controle de Estoque</h2>
          <p className="text-xs text-muted">
            Cadastre novas peças, ajuste preços e controle a disponibilidade em tempo real
          </p>
        </div>
        {canEdit && (
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm flex-center gap-2">
            <Plus size={16} />
            <span>Cadastrar Nova Peça</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filters-bar glass-panel mb-4 flex-between">
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
            {INITIAL_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
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
              <th>Categoria</th>
              <th>Código OEM</th>
              <th>Preço (PIX)</th>
              <th>Estoque Disponível</th>
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
                    <span className="badge badge-express">{p.category}</span>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-cyan">{p.oemCode}</span>
                  </td>
                  <td>
                    <div>
                      <strong className="text-xs text-main">R$ {p.price.toFixed(2)}</strong>
                      <span className="text-xs text-green block">
                        PIX: R$ {(p.pixDiscountPrice || p.price * 0.9).toFixed(2)}
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
                          onClick={() => handleOpenEdit(p)}
                          className="table-action-btn"
                          title="Editar peça"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
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

      {/* Modal Add / Edit Product */}
      {isModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-dialog admin-product-dialog glass-panel"
            onClick={(e) => e.stopPropagation()}
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
              <div className="form-field full-width">
                <label>Nome Comercial da Peça *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Jogo de Velas Iridium G-Power"
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
                  {INITIAL_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Marca / Fabricante *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bosch, Cofap, NGK"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Código OEM / Part Number *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: BKR6EIX-11"
                  value={formData.oemCode}
                  onChange={(e) => setFormData({ ...formData, oemCode: e.target.value })}
                />
              </div>

              <div className="form-field">
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

              <div className="form-field">
                <label>Estoque Atual *</label>
                <input
                  type="number"
                  required
                  placeholder="10"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Estoque Mínimo de Alerta</label>
                <input
                  type="number"
                  placeholder="3"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                />
              </div>

              <div className="form-field full-width">
                <label>Veículos Compatíveis (Separados por vírgula)</label>
                <input
                  type="text"
                  placeholder="Ex: Gol G5/G6, Fox 1.6, Voyage 1.6"
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
                <label>Descrição Técnica</label>
                <textarea
                  rows={3}
                  placeholder="Detalhes, especificações e diferenciais da peça..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="full-width flex-center gap-3 justify-end mt-3">
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
    </div>
  );
}
