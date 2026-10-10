import React from 'react';
import { AlertTriangle, HelpCircle, CheckCircle, Trash2, Edit3, X } from 'lucide-react';

/**
 * Modal universal de confirmação para ações de exclusão, edição ou alteração de estado.
 */
export function ConfirmationModal({
  isOpen,
  title = 'Confirmar Ação',
  message = 'Tem certeza que deseja prosseguir com esta ação?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  icon = null,
  onConfirm,
  onClose,
  isLoading = false
}) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconColor: 'text-danger',
          btnClass: 'btn-danger',
          defaultIcon: <Trash2 size={24} className="text-danger" />
        };
      case 'warning':
        return {
          iconColor: 'text-warning',
          btnClass: 'btn-warning',
          defaultIcon: <AlertTriangle size={24} className="text-warning" />
        };
      case 'primary':
      default:
        return {
          iconColor: 'text-cyan',
          btnClass: 'btn-primary',
          defaultIcon: <Edit3 size={24} className="text-cyan" />
        };
    }
  };

  const currentStyles = getVariantStyles();

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-dialog confirmation-dialog glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', width: '92%' }}
      >
        <div className="flex-between mb-3">
          <div className="flex-center gap-2">
            {icon || currentStyles.defaultIcon}
            <h3 className="font-bold text-base text-main">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            disabled={isLoading}
          >
            <X size={18} />
          </button>
        </div>

        <div className="confirmation-body my-4 text-sm text-muted leading-relaxed">
          {message}
        </div>

        <div className="flex-center gap-3 justify-end pt-3 border-top">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-secondary btn-sm"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            disabled={isLoading}
            className={`btn ${currentStyles.btnClass} btn-sm flex-center gap-2`}
          >
            {isLoading ? 'Processando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
