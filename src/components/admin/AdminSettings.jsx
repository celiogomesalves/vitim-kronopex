import React, { useState } from 'react';
import {
  Settings,
  Database,
  Bell,
  CheckCircle,
  Save,
  CreditCard,
  Key,
  Globe,
  GitBranch,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { FcmService } from '../../services/fcm';

export function AdminSettings({ config, onSaveConfig }) {
  const [formData, setFormData] = useState({ ...config });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testPushStatus, setTestPushStatus] = useState('');
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/mercadopago-webhook`
    : 'https://seu-dominio.vercel.app/api/mercadopago-webhook';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestPush = async () => {
    setTestPushStatus('Solicitando permissão...');
    const granted = await FcmService.requestPermission();
    if (granted) {
      FcmService.sendLocalNotification('🔔 Notificação KronoPex Ativa!', {
        body: 'O sistema de notificações push está configurado e pronto para alertar novos pedidos!',
        tag: 'test-push'
      });
      setTestPushStatus('Notificação de teste disparada com sucesso!');
    } else {
      setTestPushStatus('Permissão de notificações negada no navegador.');
    }
    setTimeout(() => setTestPushStatus(''), 4000);
  };

  const handleCopyWebhook = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(webhookUrl);
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2500);
    }
  };

  return (
    <div className="admin-page-content animate-fade-in">
      <div className="admin-page-header flex-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Configurações & Integrações da Loja</h2>
          <p className="text-xs text-muted">
            Configure credenciais do Mercado Pago, banco Appwrite, notificações e canais oficiais
          </p>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="btn btn-primary btn-sm flex-center gap-1"
        >
          <Save size={14} />
          <span>Salvar Todas as Configurações</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="checkout-alert-success flex-center gap-2 mb-4 animate-slide-down">
          <CheckCircle size={16} />
          <span>Configurações salvas e aplicadas com sucesso em produção!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-settings-grid">
        {/* CARD 1: MERCADO PAGO GATEWAY OFICIAL */}
        <div className="admin-settings-card glass-panel" style={{ border: '1px solid rgba(0, 210, 255, 0.3)' }}>
          <div className="settings-card-head flex-between mb-3">
            <div className="flex-center gap-2">
              <CreditCard size={20} className="text-cyan" />
              <h3 className="font-bold text-sm">Mercado Pago (PIX Dinâmico & Cartão)</h3>
            </div>
            <a
              href="https://www.mercadopago.com.br/developers/panel"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan flex-center gap-1 hover:underline"
            >
              <span>Painel Devs MP</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div className="mb-3 p-2.5 rounded-lg text-xs leading-relaxed" style={{ background: 'rgba(0, 210, 255, 0.08)', border: '1px solid rgba(0, 210, 255, 0.15)' }}>
            <div className="flex items-start gap-2">
              <ShieldCheck size={16} className="text-cyan flex-shrink-0 mt-0.5" />
              <div>
                <strong>Troca de Conta Sem Mexer no Código:</strong> Para receber na sua conta física agora
                e depois trocar para sua conta jurídica (CNPJ) ou outra conta, basta colar aqui o novo{' '}
                <em>Access Token</em> e a nova <em>Public Key</em>.
              </div>
            </div>
          </div>

          {/* Seletor Sandbox vs Produção */}
          <div className="form-field mb-3">
            <label className="flex-between">
              <span>Ambiente de Operação</span>
              <span className={`badge ${formData.mpSandbox ? 'badge-warning' : 'badge-admin'}`}>
                {formData.mpSandbox ? 'Modo Testes (Sandbox)' : 'Produção Real (Vendas Ativas)'}
              </span>
            </label>
            <select
              value={formData.mpSandbox ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, mpSandbox: e.target.value === 'true' })}
              className="w-full"
            >
              <option value="false">🚀 Modo Produção (Recebimentos Reais com PIX e Cartão)</option>
              <option value="true">🧪 Modo Sandbox (Testes e Simulações de Compra)</option>
            </select>
          </div>

          {/* Public Key */}
          <div className="form-field mb-3">
            <label>Chave Pública (Public Key)</label>
            <input
              type="text"
              placeholder="Ex: APP_USR-xxxxxx ou TEST-xxxxxx"
              value={formData.mpPublicKey || ''}
              onChange={(e) => setFormData({ ...formData, mpPublicKey: e.target.value })}
            />
          </div>

          {/* Access Token */}
          <div className="form-field mb-3">
            <label className="flex-between">
              <span>Token de Acesso Privado (Access Token)</span>
              <button
                type="button"
                onClick={() => setShowAccessToken(!showAccessToken)}
                className="text-xs text-muted flex-center gap-1 hover:text-white bg-transparent border-0 cursor-pointer p-0"
              >
                {showAccessToken ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{showAccessToken ? 'Ocultar' : 'Exibir'}</span>
              </button>
            </label>
            <input
              type={showAccessToken ? 'text' : 'password'}
              placeholder="Ex: APP_USR-xxxx-xxxx-xxxx"
              value={formData.mpAccessToken || ''}
              onChange={(e) => setFormData({ ...formData, mpAccessToken: e.target.value })}
            />
          </div>

          {/* Webhook URL Pronta */}
          <div className="form-field">
            <label>URL de Notificação Webhook (Copie para o painel do Mercado Pago)</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="font-mono text-xs text-cyan flex-1"
              />
              <button
                type="button"
                onClick={handleCopyWebhook}
                className="btn btn-secondary btn-sm flex-center gap-1"
              >
                {copiedWebhook ? <CheckCircle size={14} className="text-green" /> : <Copy size={14} />}
                <span>{copiedWebhook ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: APPWRITE DATABASE & AUTH */}
        <div className="admin-settings-card glass-panel">
          <div className="settings-card-head flex-center gap-2 mb-3">
            <Database size={18} className="text-cyan" />
            <h3 className="font-bold text-sm">Integração Appwrite (Banco & Recuperação)</h3>
          </div>
          <p className="text-xs text-muted mb-3">
            Serviço de autenticação de administradores, recuperação de senha com templates e sincronização.
          </p>

          <div className="form-field mb-3">
            <label>Endpoint da API do Appwrite</label>
            <input
              type="text"
              placeholder="https://appwrite.agenc-ia.net/v1"
              value={formData.appwriteEndpoint || ''}
              onChange={(e) => setFormData({ ...formData, appwriteEndpoint: e.target.value })}
            />
          </div>

          <div className="form-field mb-3">
            <label>Project ID (ID do Projeto)</label>
            <input
              type="text"
              placeholder="ex: 6acb990e000fac38ac2f"
              value={formData.appwriteProjectId || ''}
              onChange={(e) => setFormData({ ...formData, appwriteProjectId: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label>Database ID (Banco de Autopeças)</label>
            <input
              type="text"
              placeholder="ex: kronopex_main"
              value={formData.appwriteDatabaseId || ''}
              onChange={(e) => setFormData({ ...formData, appwriteDatabaseId: e.target.value })}
            />
          </div>
        </div>

        {/* CARD 3: DADOS COMERCIAIS & COBRANÇA */}
        <div className="admin-settings-card glass-panel">
          <div className="settings-card-head flex-center gap-2 mb-3">
            <Key size={18} className="text-cyan" />
            <h3 className="font-bold text-sm">Dados Comerciais & WhatsApp Oficial</h3>
          </div>

          <div className="form-field mb-3">
            <label>Chave PIX Alternativa / Manual (Backup)</label>
            <input
              type="text"
              placeholder="pix@kronopex.com.br"
              value={formData.pixKey || ''}
              onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
            />
          </div>

          <div className="form-field mb-3">
            <label>WhatsApp Comercial KronoPex (Com DDD para envio de comprovantes)</label>
            <input
              type="text"
              placeholder="5511999998888"
              value={formData.whatsapp || ''}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            />
          </div>

          <div className="input-row">
            <div className="form-field flex-1">
              <label>Meta para Frete Grátis (R$)</label>
              <input
                type="number"
                value={formData.freeDeliveryThreshold ?? 200}
                onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-field flex-1">
              <label>Taxa Padrão de Entrega (R$)</label>
              <input
                type="number"
                value={formData.defaultDeliveryFee ?? 15}
                onChange={(e) => setFormData({ ...formData, defaultDeliveryFee: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        {/* CARD 4: NOTIFICAÇÕES PUSH (FCM) */}
        <div className="admin-settings-card glass-panel">
          <div className="settings-card-head flex-center gap-2 mb-3">
            <Bell size={18} className="text-cyan" />
            <h3 className="font-bold text-sm">Notificações Push (Novos Pedidos em Tempo Real)</h3>
          </div>
          <p className="text-xs text-muted mb-3">
            Alertas sonoros e visuais quando clientes finalizarem compras e pedidos precisarem de despacho.
          </p>

          <div className="form-field mb-3">
            <label>Firebase VAPID Key (FCM Web Key)</label>
            <input
              type="text"
              placeholder="BOn... (Chave pública do Firebase Cloud Messaging)"
              value={formData.fcmVapidKey || ''}
              onChange={(e) => setFormData({ ...formData, fcmVapidKey: e.target.value })}
            />
          </div>

          <div className="mt-3">
            <button
              type="button"
              onClick={handleTestPush}
              className="btn btn-secondary btn-sm flex-center gap-2"
            >
              <Bell size={14} className="text-cyan" />
              <span>Disparar Notificação de Teste</span>
            </button>
            {testPushStatus && (
              <span className="text-xs text-cyan block mt-1">{testPushStatus}</span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
