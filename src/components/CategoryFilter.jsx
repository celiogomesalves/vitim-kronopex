import React from 'react';
import {
  Wrench,
  Flame,
  Disc,
  ShieldAlert,
  Zap,
  Droplets,
  Sparkles,
  Package,
  Layers
} from 'lucide-react';
import { StorageService } from '../services/storage';

const ICON_MAP = {
  Wrench,
  Flame,
  Disc,
  ShieldAlert,
  Zap,
  Droplets,
  Sparkles,
  Package,
  Layers
};

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  productCounts = {},
  categories = []
}) {
  const activeCategories = categories.length > 0 ? categories : StorageService.getCategories();

  return (
    <div className="category-filter-wrapper">
      <div className="container">
        <div className="shelf-header-row flex-between mb-4">
          <div className="flex-center gap-2">
            <Layers size={20} className="text-cyan" />
            <h2 className="shelf-title text-lg font-bold">
              Prateleiras & Categorias da Loja
            </h2>
          </div>
          <span className="text-xs text-muted">
            Clique na prateleira para filtrar
          </span>
        </div>

        <div className="categories-scroll-row">
          {activeCategories.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Wrench;
            const isSelected = selectedCategory === cat.id;
            const count = productCounts[cat.id] ?? 0;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`category-pill-btn ${isSelected ? 'active' : ''}`}
              >
                <div className="category-icon-wrap">
                  <IconComponent size={18} />
                </div>
                <span className="category-name">{cat.name}</span>
                {count > 0 && (
                  <span className="category-badge-count">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
