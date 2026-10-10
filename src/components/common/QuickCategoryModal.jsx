import React, { useState } from 'react';
import {
  Layers,
  Plus,
  X,
  Wrench,
  Flame,
  Disc,
  ShieldAlert,
  Zap,
  Droplets,
  Sparkles,
  Package
} from 'lucide-react';
import { StorageService } from '../../services/storage';

const QUICK_ICONS = [
  { id: 'Wrench', label: 'Mecânica / Geral', Component: Wrench },
  { id: 'Flame', label: 'Motor / Injeção', Component: Flame },
  { id: 'Disc', label: 'Freios', Component: Disc },
  { id: 'ShieldAlert', label: 'Suspensão', Component: ShieldAlert },
  { id: 'Zap', label: 'Elétrica', Component: Zap },
  { id: 'Droplets', label: 'Óleos & Filtros', Component: Droplets },
  { id: 'Sparkles', label: 'Acessórios', Component: Sparkles },
  { id: 'Package', label: 'Peças Diversas', Component: Package }
];

export function QuickCategoryModal({ isOpen, onClose, onCategoryCreated }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Wrench');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Por favor, informe o nome da categoria.');
      return;
    }

    const currentCats = StorageService.getCategories();
    const slug = trimmedName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-');

    if (currentCats.some((c) => c.id === slug || c.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('Já existe uma categoria cadastrada com este nome.');
      return;
    }

    const newCategory = {
      id: slug,
      name: trimmedName,
      icon
    };

    const updated = [...currentCats, newCategory];
    StorageService.saveCategories(updated);

    if (onCategoryCreated) {
      onCategoryCreated(newCategory);
    }

    setName('');
    setIcon('Wrench');
    onClose();
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose} style={{ zIndex: 10000 }}>
      <div
        className="modal-dialog quick-category-dialog glass-panel p-5"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', width: '92%' }}
      >
        <div className="modal-header flex-between mb-3 pb-2 border-bottom">
          <h4 className="font-bold text-sm flex-center gap-2 text-main">
            <Layers size={16} className="text-cyan" />
            <span>Cadastrar Nova Categoria</span>
          </h4>
          <button type="button" onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="checkout-alert-error p-2 mb-3 text-xs rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="form-field">
            <label className="text-xs font-semibold text-main block mb-1">
              Nome da Categoria *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Escapamentos & Catalisadores"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs"
            />
          </div>

          <div className="form-field">
            <label className="text-xs font-semibold text-main block mb-2">
              Selecione o Ícone
            </label>
            <div className="icon-selector-grid">
              {QUICK_ICONS.map((item) => {
                const Comp = item.Component;
                const isSelected = icon === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setIcon(item.id)}
                    className={`icon-select-btn ${isSelected ? 'active' : ''}`}
                    title={item.label}
                  >
                    <Comp size={16} />
                    <span className="icon-select-label">{item.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-center gap-2 justify-end pt-3 border-top mt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm flex-center gap-1"
            >
              <Plus size={14} />
              <span>Salvar e Selecionar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
