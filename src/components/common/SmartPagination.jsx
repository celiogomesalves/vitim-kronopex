import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Componente SmartPagination inspirado no Torque Auto Peças
 * Gerencia navegação entre páginas com números, anterior/próximo e reticências.
 */
export function SmartPagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 5,
  totalItems = 0,
  itemsPerPage = 10,
  className = ''
}) {
  if (totalPages <= 1) return null;

  function getPageRange(current, total, maxButtons) {
    if (total <= maxButtons) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages = [];
    const half = Math.floor((maxButtons - 2) / 2);
    let start = Math.max(2, current - half);
    let end = Math.min(total - 1, current + half);

    if (current - 1 <= half) {
      end = maxButtons - 1;
    }
    if (total - current <= half) {
      start = total - (maxButtons - 2);
    }

    pages.push(1);
    if (start > 2) pages.push('ellipsis');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push('ellipsis');
    pages.push(total);
    return pages;
  }

  const pages = getPageRange(currentPage, totalPages, siblingCount);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`smart-pagination-container flex-between ${className}`}>
      {totalItems > 0 && (
        <span className="text-xs text-muted">
          Mostrando <strong className="text-main">{startItem}</strong> a <strong className="text-main">{endItem}</strong> de <strong className="text-main">{totalItems}</strong> registros
        </span>
      )}

      <div className="smart-pagination-controls flex-center gap-1">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="pagination-btn pagination-nav-btn"
          title="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <span key={`ell-${idx}`} className="pagination-ellipsis text-muted px-2">
              ...
            </span>
          ) : (
            <button
              type="button"
              key={p}
              onClick={() => onPageChange(p)}
              className={`pagination-btn ${currentPage === p ? 'active' : ''}`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="pagination-btn pagination-nav-btn"
          title="Próxima página"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
