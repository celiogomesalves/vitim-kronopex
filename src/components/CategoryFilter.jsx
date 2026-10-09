import React from 'react';
import {
  Wrench,
  Flame,
  Disc,
  ShieldAlert,
  Zap,
  Droplets,
  Sparkles,
  Layers
} from 'lucide-react';
import { INITIAL_CATEGORIES } from '../data/mockProducts';

const ICON_MAP = {
  Wrench,
  Flame,
  Disc,
  ShieldAlert,
  Zap,
  Droplets,
  Sparkles
};

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  productCounts = {}
}) {
  return (
    <div className="category-filter-wrapper">
      <div className="container">
        <div className="shelf-header-row flex-between">
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
          {INITIAL_CATEGORIES.map((cat) => {
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
