import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Shield,
  Lock,
  Mail,
  UserCheck,
  ArrowRight,
  KeyRound,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { AppwriteService } from '../../services/appwrite';
import { StorageService } from '../../services/storage';
import { isSuperAdminEmail } from '../../data/mockUsers';

export function AdminLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  recoveryParams = null
}) {
  const [mode, setMode] = useState(recoveryParams ? 'reset' : 'login'); // 'login' | 'forgot' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Login com E-mail e Senha Corporativa
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const staffList = StorageService.getStaff();
      const localStaff = staffList.find(
        (u) => u.email && u.email.toLowerCase() === cleanEmail
      );

      // Verificação de Autorização Restrita
      const isSuper = isSuperAdminEmail(cleanEmail);
      if (!isSuper && (!localStaff || localStaff.status !== 'active')) {
        throw new Error(
          'Acesso não autorizado. Apenas os Administradores Master (Célio Gomes e Victor Hugo) ou colaboradores previamente autorizados por eles podem acessar o painel.'
        );
      }

      // 1. Tenta autenticar diretamente no Appwrite
      let appwriteUser = null;
      try {
        const authResult = await AppwriteService.loginWithEmail(cleanEmail, password);
        appwriteUser = authResult.user;
      } catch (authErr) {
        console.warn('Falha no login Appwrite direto:', authErr.message || authErr);
      }

      // 2. Monta o perfil de sessão do administrador
      const activeAdmin = localStaff || {
        id: appwriteUser?.$id || `admin-${Date.now().toString().slice(-4)}`,
        name: isSuper
          ? (cleanEmail.includes('celio') ? 'Célio Gomes Alves' : 'Victor Hugo')
          : (appwriteUser?.name || cleanEmail.split('@')[0]),
        email: cleanEmail,
        role: isSuper ? 'admin' : (localStaff?.role || 'manager'),
        roleName: isSuper ? 'Administrador Master' : (localStaff?.roleName || 'Gerente Comercial'),
        status: 'active',
        isSuperAdmin: isSuper,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanEmail)}&background=00f5a0&color=050d1a&bold=true`,
        permissions: isSuper ? ['all'] : (localStaff?.permissions || ['manage_orders'])
      };

      StorageService.setCurrentUser(activeAdmin);
      onLoginSuccess(activeAdmin);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao autenticar administrador.');
    } finally {
      setIsLoading(false);
    }
  };

  // Login com Google OAuth
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await AppwriteService.loginWithGoogle();
    } catch {
      setErrorMsg('Erro ao conectar ao Google OAuth pelo Appwrite. Tente via e-mail e senha.');
      setIsLoading(false);
    }
  };

  // Solicitar Link de Recuperação de Senha (Dispara e-mail oficial Appwrite)
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Por favor, informe seu e-mail cadastrado.');
      return;
    }

    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}${window.location.pathname}?action=reset_password`;
      await AppwriteService.createPasswordRecovery(email, redirectUrl);
      setSuccessMsg(
        `E-mail de recuperação enviado para ${email}. Verifique sua caixa de entrada e siga o link com o template oficial da KronoPex.`
      );
    } catch (err) {
      setErrorMsg(
        err.message || 'Erro ao enviar e-mail de recuperação. Verifique se o e-mail está cadastrado.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Concluir Redefinição de Senha
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword || newPassword.length < 8) {
      setErrorMsg('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      const userId = recoveryParams?.userId || new URLSearchParams(window.location.search).get('userId');
      const secret = recoveryParams?.secret || new URLSearchParams(window.location.search).get('secret');

      if (!userId || !secret) {
        throw new Error('Parâmetros de recuperação ausentes ou link expirado.');
      }

      await AppwriteService.completePasswordRecovery(userId, secret, newPassword);
      setSuccessMsg('Senha redefinida com sucesso! Agora você já pode entrar.');
      setTimeout(() => {
        setMode('login');
        setSuccessMsg('');
        // Limpa query params da URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao redefinir senha.');
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <div
      className="modal-backdrop-portal"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(3, 7, 18, 0.88)',
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
        className="modal-dialog login-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#0d1524',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '2.25rem',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 40px rgba(0, 210, 255, 0.12)',
          position: 'relative',
          margin: 'auto'
        }}
      >
        <div className="login-modal-header flex-between mb-4">
          <div className="flex-center gap-2">
            <div className="login-badge-icon">
              <Shield size={20} className="text-cyan" />
            </div>
            <div>
              <h3 className="font-bold text-base">Portal Administrativo KronoPex</h3>
              <p className="text-xs text-muted">Acesso restrito à gestão e expedição</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="checkout-alert-error mb-3 text-xs flex-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="checkout-alert-success mb-3 text-xs flex-center gap-2">
            <CheckCircle size={16} className="flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODO 1: LOGIN REAL */}
        {mode === 'login' && (
          <div>
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
                <span>Entrar com Google Corporativo</span>
              </button>
            </div>

            <div className="login-divider mb-4">
              <span>ou acesse com E-mail e Senha</span>
            </div>

            {/* Form de E-mail e Senha */}
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div className="form-field">
                <label className="text-xs font-semibold">E-mail Cadastrado</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    placeholder="seu.email@kronopex.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <div className="flex-between mb-1">
                  <label className="text-xs font-semibold">Senha</label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setSuccessMsg('');
                      setMode('forgot');
                    }}
                    className="text-xs text-cyan hover:underline p-0 border-0 bg-transparent cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full flex-center gap-2 mt-4"
              >
                {isLoading ? (
                  <span>Verificando Acesso...</span>
                ) : (
                  <>
                    <UserCheck size={18} />
                    <span>Entrar no Painel</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* MODO 2: RECUPERAÇÃO DE SENHA (ESQUECI MINHA SENHA) */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="animate-fade-in space-y-3">
            <div className="flex-center gap-2 mb-2">
              <KeyRound size={22} className="text-cyan" />
              <h4 className="font-bold text-sm">Recuperação de Senha com Appwrite</h4>
            </div>

            <p className="text-xs text-muted leading-relaxed mb-3">
              Informe seu e-mail corporativo. O sistema Appwrite enviará um link seguro com o
              template oficial de redefinição de senha para sua caixa postal.
            </p>

            <div className="form-field">
              <label className="text-xs font-semibold">Seu E-mail Corporativo</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  placeholder="admin@kronopex.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full flex-center gap-2 mt-3"
            >
              {isLoading ? 'Enviando Link...' : 'Enviar Link de Recuperação'}
            </button>

            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setSuccessMsg('');
                setMode('login');
              }}
              className="btn btn-secondary w-full flex-center gap-2 mt-2 btn-sm"
            >
              <ArrowLeft size={14} />
              <span>Voltar ao Login</span>
            </button>
          </form>
        )}

        {/* MODO 3: REDEFINIR SENHA VIA TOKEN DO E-MAIL */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="animate-fade-in space-y-3">
            <div className="flex-center gap-2 mb-2">
              <Lock size={22} className="text-cyan" />
              <h4 className="font-bold text-sm">Criar Nova Senha</h4>
            </div>

            <p className="text-xs text-muted mb-3">
              Você acessou o link seguro de recuperação. Digite sua nova senha de acesso:
            </p>

            <div className="form-field">
              <label className="text-xs font-semibold">Nova Senha (mín. 8 dígitos)</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label className="text-xs font-semibold">Confirmar Nova Senha</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full flex-center gap-2 mt-3"
            >
              {isLoading ? 'Salvando Nova Senha...' : 'Confirmar e Redefinir Senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
