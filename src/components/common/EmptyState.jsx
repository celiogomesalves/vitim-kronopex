import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export function EmptyState({
  icon: Icon,
  badgeText = '',
  title,
  description,
  perks = [],
  actionText = '',
  onAction,
  secondaryActionText = '',
  onSecondaryAction,
  className = ''
}) {
  return (
    <div
      className={`glass-panel text-center animate-fade-in ${className}`}
      style={{
        padding: '3.5rem 2rem',
        borderRadius: '24px',
        border: '1px solid rgba(0, 245, 160, 0.2)',
        background: 'linear-gradient(150deg, rgba(16, 24, 40, 0.85) 0%, rgba(9, 13, 22, 0.95) 100%)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        margin: '1.5rem 0'
      }}
    >
      {/* Soft Ambient Radial Light */}
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '320px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(0, 245, 160, 0.12) 0%, rgba(0, 210, 255, 0.04) 60%, transparent 80%)',
          pointerEvents: 'none'
        }}
      />

      {/* Badge Top */}
      {badgeText && (
        <div style={{ marginBottom: '1.25rem' }}>
          <span
            className="badge badge-express"
            style={{
              padding: '0.4rem 1rem',
              fontSize: '0.76rem',
              fontWeight: 700,
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={13} />
            <span>{badgeText}</span>
          </span>
        </div>
      )}

      {/* Icon Halo */}
      {Icon && (
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 245, 160, 0.16) 0%, rgba(18, 26, 42, 0.85) 75%)',
            border: '1px solid rgba(0, 245, 160, 0.35)',
            boxShadow: '0 0 28px rgba(0, 245, 160, 0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'var(--accent-primary)',
            position: 'relative'
          }}
        >
          <Icon size={38} strokeWidth={1.75} />
        </div>
      )}

      {/* Title */}
      <h3
        style={{
          fontSize: '1.45rem',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '0.65rem',
          letterSpacing: '-0.02em',
          lineHeight: 1.3
        }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          style={{
            fontSize: '0.92rem',
            color: 'var(--text-muted)',
            lineHeight: 1.65,
            maxWidth: '540px',
            margin: '0 auto 1.75rem'
          }}
        >
          {description}
        </p>
      )}

      {/* Perks / Status Indicators */}
      {perks.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.75rem',
            maxWidth: '620px',
            margin: '0 auto 2rem'
          }}
        >
          {perks.map((perk, idx) => (
            <div
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1rem',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '0.78rem',
                color: 'var(--text-main)'
              }}
            >
              {perk.icon && <perk.icon size={14} style={{ color: 'var(--accent-primary)' }} />}
              <span>{perk.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {(actionText || secondaryActionText) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          {actionText && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="btn btn-primary flex-center gap-2"
              style={{ minHeight: '46px', padding: '0.75rem 1.6rem', fontSize: '0.92rem', fontWeight: 700 }}
            >
              <span>{actionText}</span>
              <ArrowRight size={16} />
            </button>
          )}

          {secondaryActionText && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="btn btn-secondary flex-center gap-2"
              style={{ minHeight: '46px', padding: '0.75rem 1.4rem', fontSize: '0.92rem' }}
            >
              <span>{secondaryActionText}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
