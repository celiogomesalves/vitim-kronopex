import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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

  const modalContent = (
    <div
      className="modal-backdrop-portal"
      onClick={onClose}
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
        className="quick-category-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#0d1524',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '2.25rem',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 40px rgba(0, 210, 255, 0.12)',
          position: 'relative',
          margin: 'auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(0, 210, 255, 0.12)',
                border: '1px solid rgba(0, 210, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)'
              }}
            >
              <Layers size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                Cadastrar Nova Categoria
              </h4>
              <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                Atalho direto no formulário da peça
              </span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="drawer-close-btn" title="Fechar">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="checkout-alert-error p-3 mb-4 text-xs rounded-xl" style={{ borderRadius: '12px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-field">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', display: 'block', marginBottom: '0.4rem' }}>
              Nome da Categoria *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Escapamentos & Catalisadores"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: '#090f1a',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                fontSize: '0.88rem'
              }}
            />
          </div>

          <div className="form-field">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', display: 'block', marginBottom: '0.6rem' }}>
              Selecione o Ícone
            </label>
            <div className="icon-selector-grid" style={{ gap: '0.5rem' }}>
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
                    style={{
                      borderRadius: '12px',
                      padding: '0.65rem 0.4rem',
                      background: isSelected ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      borderColor: isSelected ? '#00d2ff' : 'rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <Comp size={18} className={isSelected ? 'text-cyan' : 'text-muted'} />
                    <span className="icon-select-label" style={{ fontSize: '0.72rem', marginTop: '0.2rem' }}>
                      {item.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.85rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              marginTop: '0.5rem'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                cursor: 'pointer'
              }}
              className="hover-lift"
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: '0.65rem 1.6rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              className="btn btn-primary hover-lift"
            >
              <Plus size={15} />
              <span>Salvar e Selecionar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

