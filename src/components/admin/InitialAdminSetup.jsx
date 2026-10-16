import React, { useState } from 'react';
import {
  ShieldAlert,
  UserCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { AppwriteService } from '../../services/appwrite';
import { StorageService } from '../../services/storage';

export function InitialAdminSetup({ onSetupComplete }) {
  const [authMode, setAuthMode] = useState('email'); // 'email' | 'google'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setErrorMsg('Preencha todos os campos obrigatórios.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMsg('A senha do Administrador Master deve conter no mínimo 8 caracteres.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('A confirmação de senha não coincide com a senha digitada.');
      return;
    }

    setLoading(true);

    try {
      // 1. Tenta criar a conta no Appwrite
      let appwriteUser = null;
      try {
        const res = await AppwriteService.createAccount(
          formData.email,
          formData.password,
          formData.name
        );
        appwriteUser = res.user;
      } catch (appwriteErr) {
        console.warn('Erro ao criar no Appwrite direto, registrando localmente com sincronização:', appwriteErr);
      }

      // 2. Cria o objeto do primeiro Administrador Master
      const masterAdmin = {
        id: appwriteUser?.$id || `admin-${Date.now().toString().slice(-4)}`,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: 'admin',
        roleName: 'Administrador Master',
        status: 'active',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=00d2ff&color=050d1a&bold=true`,
        permissions: [
          'manage_products',
          'approve_partner_products',
          'manage_orders',
          'manage_couriers',
          'view_financial',
          'manage_settings',
          'all'
        ],
        createdAt: new Date().toISOString()
      };

      // 3. Salva no Storage e no Appwrite
      StorageService.saveStaff([masterAdmin]);
      StorageService.setCurrentUser(masterAdmin);

      setSuccessMsg('Administrador Master configurado com sucesso! Inicializando KronoPex...');
      setTimeout(() => {
        onSetupComplete(masterAdmin);
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao registrar Administrador Master.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSetup = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      // Salva flag temporária para quando retornar do Google OAuth reconhecer como Admin Master
      localStorage.setItem('kronopex_pending_master_setup', 'true');
      await AppwriteService.loginWithGoogle();
    } catch (err) {
      setErrorMsg('Erro ao iniciar conexão com Google OAuth no Appwrite.');
      setLoading(false);
    }
  };

  return (
    <div className="initial-setup-backdrop">
      <div className="initial-setup-card glass-panel animate-scale-up">
        {/* Header Visual */}
        <div className="setup-badge-row flex-center gap-2 mb-3">
          <div className="badge-shield-pulse">
            <ShieldAlert size={28} className="text-cyan" />
          </div>
        </div>

        <h2 className="setup-title text-center text-2xl font-bold mb-1">
          KronoPex Auto Peças & Delivery
        </h2>
        <p className="setup-subtitle text-center text-sm text-cyan font-medium mb-3">
          Configuração Inicial de Produção
        </p>

        <div className="setup-alert-box mb-4">
          <div className="flex gap-2">
            <AlertCircle size={18} className="text-warning flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted leading-relaxed">
              <strong>Acesso Público Bloqueado:</strong> A vitrine da loja e os pedidos de clientes
              ficarão indisponíveis até a definição do <strong>Primeiro Administrador Master</strong>,
              responsável por configurar as formas de pagamento, peças e chaves do sistema.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="checkout-alert-error mb-4 text-xs flex-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="checkout-alert-success mb-4 text-xs flex-center gap-2">
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Botão Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleSetup}
          disabled={loading}
          className="btn btn-secondary w-full flex-center gap-2 google-btn mb-4"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Cadastrar Master com Google (Appwrite)</span>
        </button>

        <div className="login-divider mb-4">
          <span>ou crie via E-mail e Senha Corporativa</span>
        </div>

        {/* Formulário E-mail e Senha */}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <div className="form-field">
            <label className="text-xs font-semibold">Nome Completo do Administrador</label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input
                type="text"
                placeholder="Ex: Célio Gomes"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label className="text-xs font-semibold">E-mail Corporativo</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                placeholder="admin@kronopex.com.br"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label className="text-xs font-semibold">Senha Master (mínimo 8 dígitos)</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label className="text-xs font-semibold">Confirmar Senha</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full flex-center gap-2 mt-4 btn-lg"
          >
            {loading ? (
              <span>Gravando Administrador Master...</span>
            ) : (
              <>
                <UserCheck size={18} />
                <span>Ativar Sistema & Criar Administrador Master</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
