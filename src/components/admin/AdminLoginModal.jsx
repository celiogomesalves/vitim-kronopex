import React, { useState } from 'react';
import { X, Shield, Lock, UserCheck, Sparkles, ArrowRight } from 'lucide-react';
import { INITIAL_STAFF } from '../../data/mockUsers';
import { AppwriteService } from '../../services/appwrite';

export function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleQuickSelect = (staffUser) => {
    onLoginSuccess(staffUser);
    onClose();
  };

  const handleCustomLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const found = INITIAL_STAFF.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (found) {
      onLoginSuccess(found);
      onClose();
    } else {
      setErrorMsg('Colaborador não encontrado com este e-mail corporativo.');
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const initiated = await AppwriteService.loginWithGoogle();
      if (!initiated) {
        // Fallback demo mode login as Admin Master
        const adminUser = INITIAL_STAFF[0];
        onLoginSuccess(adminUser);
        onClose();
      }
    } catch {
      setErrorMsg('Erro ao conectar com Google OAuth. Usando perfil demonstrativo.');
      const adminUser = INITIAL_STAFF[0];
      onLoginSuccess(adminUser);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal-dialog login-modal-dialog glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="login-modal-header flex-between">
          <div className="flex-center gap-2">
            <div className="login-badge-icon">
              <Shield size={20} className="text-cyan" />
            </div>
            <div>
              <h3 className="font-bold text-base">Portal Administrativo KronoPex</h3>
              <p className="text-xs text-muted">Acesso restrito à equipe e gerência</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="checkout-alert-error mb-3 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Google OAuth Login Button */}
        <div className="oauth-login-box mb-4">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="btn btn-secondary w-full flex-center gap-2 google-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continuar com Google (Appwrite Auth)</span>
          </button>
          <span className="oauth-divider-text">ou selecione um perfil de demonstração</span>
        </div>

        {/* Quick Demo Access Roles */}
        <div className="demo-roles-picker mb-4">
          <span className="text-xs font-semibold text-muted mb-2 block">
            Acesso Rápido para Demonstração:
          </span>
          <div className="roles-list">
            {INITIAL_STAFF.map((staff) => (
              <button
                key={staff.id}
                type="button"
                onClick={() => handleQuickSelect(staff)}
                className="role-select-card flex-between"
              >
                <div className="flex-center gap-3">
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    className="staff-avatar-sm"
                  />
                  <div className="text-left">
                    <strong className="block text-xs text-main">{staff.name}</strong>
                    <span className="text-xs text-muted">{staff.roleName}</span>
                  </div>
                </div>
                <span className={`badge ${staff.role === 'admin' ? 'badge-admin' : staff.role === 'manager' ? 'badge-manager' : 'badge-operator'}`}>
                  {staff.role.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual corporate login */}
        <form onSubmit={handleCustomLogin} className="manual-login-form border-top pt-3">
          <div className="form-field mb-2">
            <label className="text-xs text-muted">E-mail Corporativo</label>
            <input
              type="email"
              placeholder="ex: celio.master@kronopex.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-field mb-3">
            <label className="text-xs text-muted">Senha de Acesso</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full btn-sm flex-center gap-2">
            <UserCheck size={16} />
            <span>Entrar no Sistema</span>
          </button>
        </form>
      </div>
    </div>
  );
}
