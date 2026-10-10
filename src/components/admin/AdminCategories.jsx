import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Wrench,
  Flame,
  Disc,
  ShieldAlert,
  Zap,
  Droplets,
  Sparkles,
  Package,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';

const AVAILABLE_ICONS = [
  { id: 'Wrench', label: 'Ferramenta / Mecânica', Component: Wrench },
  { id: 'Flame', label: 'Motor / Combustão', Component: Flame },
  { id: 'Disc', label: 'Disco / Freio', Component: Disc },
  { id: 'ShieldAlert', label: 'Suspensão / Segurança', Component: ShieldAlert },
  { id: 'Zap', label: 'Elétrica / Bateria', Component: Zap },
  { id: 'Droplets', label: 'Óleos / Fluidos', Component: Droplets },
  { id: 'Sparkles', label: 'Estética / Acessórios', Component: Sparkles },
  { id: 'Package', label: 'Caixa / Peças Gerais', Component: Package }
];

export function AdminCategories({
  categories,
  onSaveCategories,
  products = []
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    id: '',
    icon: 'Wrench'
  });

  // Confirmações
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionType: '',
    payload: null,
    variant: 'danger'
  });

  const getProductCount = (catId) => {
    if (catId === 'all') return products.length;
    return products.filter((p) => p.category === catId).length;
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      id: '',
      icon: 'Wrench'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      id: category.id,
      icon: category.icon || 'Wrench'
    });
    setIsModalOpen(true);
  };

  const handlePromptDelete = (cat) => {
    if (cat.id === 'all') {
      alert('A categoria padrão "Todas as Peças" não pode ser removida.');
      return;
    }
    const count = getProductCount(cat.id);
    setConfirmModal({
      isOpen: true,
      title: 'Confirmar Exclusão de Categoria',
      message: `Tem certeza que deseja excluir a categoria "${cat.name}"? Existem ${count} peça(s) associadas a ela.`,
      actionType: 'delete',
      payload: cat.id,
      variant: 'danger'
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      setConfirmModal({
        isOpen: true,
        title: 'Confirmar Alteração de Categoria',
        message: `Deseja salvar as alterações na categoria "${formData.name}"?`,
        actionType: 'save_edit',
        payload: { ...formData },
        variant: 'primary'
      });
    } else {
      // Criação direta ou validação de slug
      const slug = formData.id.trim()
        ? formData.id.toLowerCase().replace(/\s+/g, '-')
        : formData.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-');

      if (categories.some((c) => c.id === slug)) {
        alert('Já existe uma categoria cadastrada com este identificador/slug.');
        return;
      }

      const newCategory = {
        id: slug,
        name: formData.name.trim(),
        icon: formData.icon
      };

      onSaveCategories([...categories, newCategory]);
      setIsModalOpen(false);
    }
  };

  const handleExecuteConfirmedAction = () => {
    if (confirmModal.actionType === 'delete') {
      const updated = categories.filter((c) => c.id !== confirmModal.payload);
      onSaveCategories(updated);
    } else if (confirmModal.actionType === 'save_edit') {
      const updated = categories.map((c) =>
        c.id === editingCategory.id
          ? { ...c, name: confirmModal.payload.name, icon: confirmModal.payload.icon }
          : c
      );
      onSaveCategories(updated);
      setIsModalOpen(false);
    }
    setConfirmModal({ isOpen: false, title: '', message: '', actionType: '', payload: null, variant: 'danger' });
  };

  return (
    <div className="admin-page-content animate-fade-in">
      <div className="admin-page-header flex-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Gestão de Categorias & Prateleiras</h2>
          <p className="text-xs text-muted">
            Cadastre novas seções do catálogo para organizar o estoque e a vitrine dos clientes
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn btn-primary btn-sm flex-center gap-2"
        >
          <Plus size={16} />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Grid de Categorias */}
      <div className="admin-grid-cards mb-6">
        {categories.map((cat) => {
          const count = getProductCount(cat.id);
          const iconObj = AVAILABLE_ICONS.find((i) => i.id === cat.icon) || AVAILABLE_ICONS[0];
          const IconComp = iconObj.Component;

          return (
            <div key={cat.id} className="category-admin-card glass-panel p-5">
              <div className="flex-between mb-3">
                <div className="flex-center gap-3">
                  <div className="category-icon-box p-3 rounded-lg bg-surface text-cyan">
                    <IconComp size={22} />
                  </div>
                  <div>
                    <strong className="text-sm block text-main">{cat.name}</strong>
                    <span className="text-xs text-muted font-mono">ID: {cat.id}</span>
                  </div>
                </div>
                <span className="badge badge-stock font-bold">
                  {count} peça{count !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex-center gap-2 justify-end pt-3 border-top mt-3">
                {cat.id !== 'all' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cat)}
                      className="btn btn-secondary btn-xs flex-center gap-1"
                      title="Editar categoria"
                    >
                      <Edit2 size={13} />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePromptDelete(cat)}
                      className="btn btn-secondary btn-xs text-danger flex-center gap-1"
                      title="Excluir categoria"
                    >
                      <Trash2 size={13} />
                      <span>Excluir</span>
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-dim italic">Categoria Geral Fixa</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Categoria */}
      {isModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-dialog admin-category-dialog glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', width: '92%' }}
          >
            <div className="modal-header flex-between mb-4">
              <h3 className="font-bold text-base flex-center gap-2">
                <Layers size={18} className="text-cyan" />
                <span>{editingCategory ? 'Editar Categoria' : 'Cadastrar Nova Categoria'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="admin-form-grid">
              <div className="form-field full-width mb-3">
                <label>Nome da Categoria *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ar-Condicionado & Climatização"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {!editingCategory && (
                <div className="form-field full-width mb-3">
                  <label>Identificador Único (Slug opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: ar-condicionado (deixe vazio para gerar auto)"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  />
                  <span className="text-xs text-dim block mt-1">
                    Será usado no filtro de busca e rotas.
                  </span>
                </div>
              )}

              <div className="form-field full-width mb-4">
                <label className="block mb-2">Ícone Visual da Categoria</label>
                <div className="icon-selector-grid">
                  {AVAILABLE_ICONS.map((iconItem) => {
                    const Comp = iconItem.Component;
                    const isSelected = formData.icon === iconItem.id;
                    return (
                      <button
                        type="button"
                        key={iconItem.id}
                        onClick={() => setFormData({ ...formData, icon: iconItem.id })}
                        className={`icon-select-btn ${isSelected ? 'active' : ''}`}
                        title={iconItem.label}
                      >
                        <Comp size={18} />
                        <span className="icon-select-label">{iconItem.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
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
                  {editingCategory ? 'Salvar Alterações' : 'Cadastrar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Universal de Confirmação */}
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
