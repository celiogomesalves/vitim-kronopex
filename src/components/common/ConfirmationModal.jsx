import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, HelpCircle, CheckCircle, Trash2, Edit3, X } from 'lucide-react';

/**
 * Modal universal de confirmação para ações de exclusão, edição ou alteração de estado.
 * Renderizado diretamente no document.body via Portal para nunca ser cortado ou contido.
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
          iconBg: 'bg-red-500/15 border-red-500/30 text-danger',
          btnClass: 'btn-danger',
          defaultIcon: <Trash2 size={24} />
        };
      case 'warning':
        return {
          iconColor: 'text-warning',
          iconBg: 'bg-amber-500/15 border-amber-500/30 text-warning',
          btnClass: 'btn-warning',
          defaultIcon: <AlertTriangle size={24} />
        };
      case 'primary':
      default:
        return {
          iconColor: 'text-cyan',
          iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan',
          btnClass: 'btn-primary',
          defaultIcon: <Edit3 size={24} />
        };
    }
  };

  const currentStyles = getVariantStyles();

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
        animation: 'fadeIn 0.25s ease-out forwards'
      }}
    >
      <div
        className="confirmation-dialog-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#0d1524',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '2rem 2.25rem',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 210, 255, 0.1)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid'
              }}
              className={currentStyles.iconBg}
            >
              {icon || currentStyles.defaultIcon}
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                {title}
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                KronoPex Confirmação Segura
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="drawer-close-btn"
            title="Fechar"
            style={{ flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: '1.6', margin: '0.5rem 0' }}>
          {message}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.85rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: '0.65rem 1.4rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            className="hover-lift"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => onConfirm()}
            disabled={isLoading}
            style={{
              padding: '0.65rem 1.6rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            className={`${currentStyles.btnClass} hover-lift`}
          >
            {isLoading ? 'Processando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

