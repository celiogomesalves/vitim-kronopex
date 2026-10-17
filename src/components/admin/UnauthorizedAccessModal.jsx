import React from 'react';
import { ShieldAlert, Mail, UserCheck, ArrowLeft, Clock } from 'lucide-react';

export function UnauthorizedAccessModal({ unauthorizedUser, onClose }) {
  if (!unauthorizedUser) return null;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal-dialog glass-panel"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '2.5rem 2rem',
          borderRadius: '24px',
          background: 'linear-gradient(150deg, rgba(16, 22, 36, 0.98) 0%, rgba(9, 13, 22, 0.99) 100%)',
          border: '1px solid rgba(255, 51, 102, 0.35)',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.9), 0 0 40px rgba(255, 51, 102, 0.12)',
          textAlign: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'rgba(255, 51, 102, 0.14)',
            border: '1px solid rgba(255, 51, 102, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: '#ff3366',
            boxShadow: '0 0 24px rgba(255, 51, 102, 0.3)'
          }}
        >
          <ShieldAlert size={34} />
        </div>

        <h3
          style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: '#ffffff',
            marginBottom: '0.65rem',
            letterSpacing: '-0.02em'
          }}
        >
          Acesso Administrativo Não Autorizado
        </h3>

        <p
          style={{
            fontSize: '0.92rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '1.5rem'
          }}
        >
          A conta Google <strong style={{ color: '#ffffff' }}>{unauthorizedUser.email}</strong> foi autenticada com sucesso, porém <span style={{ color: '#ff6685' }}>ainda não possui autorização</span> para acessar o painel KronoPex.
        </p>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.25rem',
            textAlign: 'left',
            marginBottom: '1.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <UserCheck size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              <strong>Administradores com Acesso Direto:</strong>
              <div style={{ color: 'var(--accent-primary)', marginTop: '4px', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                • celiogomesalves@gmail.com (Célio Gomes)<br />
                • victorhugotortuga33@gmail.com (Victor Hugo)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <Clock size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: '#fbbf24' }}>
              Sua tentativa foi registrada. Solicite liberação a um dos administradores acima.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn btn-primary w-full flex-center gap-2"
          style={{
            minHeight: '48px',
            fontSize: '0.95rem',
            fontWeight: 700
          }}
        >
          <ArrowLeft size={18} />
          <span>Voltar para a Vitrine da Loja</span>
        </button>
      </div>
    </div>
  );
}
