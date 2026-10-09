import React, { useState } from 'react';
import {
  Settings,
  Database,
  Bell,
  CheckCircle,
  Save,
  RotateCcw,
  Globe,
  GitBranch,
  Key
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { FcmService } from '../../services/fcm';

export function AdminSettings({ config, onSaveConfig }) {
  const [formData, setFormData] = useState({ ...config });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testPushStatus, setTestPushStatus] = useState('');

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

  const handleResetDemo = () => {
    if (window.confirm('Deseja recarregar todos os dados de demonstração iniciais da KronoPex?')) {
      StorageService.resetDemoData();
    }
  };

  return (
    <div className="admin-page-content animate-fade-in">
      <div className="admin-page-header flex-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Configurações & Integrações do Sistema</h2>
          <p className="text-xs text-muted">
            Gerencie conexões do banco Appwrite, notificações FCM, chaves PIX e WhatsApp
          </p>
        </div>
        <button onClick={handleResetDemo} className="btn btn-secondary btn-sm flex-center gap-1">
          <RotateCcw size={14} />
          <span>Restaurar Demonstração</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="checkout-alert-success flex-center gap-2 mb-4 animate-slide-down">
          <CheckCircle size={16} />
          <span>Configurações salvas com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-settings-grid">
        {/* Appwrite Database & Auth */}
        <div className="admin-settings-card glass-panel">
          <div className="settings-card-head flex-center gap-2 mb-3">
            <Database size={18} className="text-cyan" />
            <h3 className="font-bold text-sm">Integração Appwrite (Banco & Google Auth)</h3>
          </div>
          <p className="text-xs text-muted mb-3">
            Conecte sua instância da nuvem ou servidor local do Appwrite.
          </p>

          <div className="form-field mb-3">
            <label>Endpoint da API do Appwrite</label>
            <input
              type="text"
              placeholder="https://cloud.appwrite.io/v1"
              value={formData.appwriteEndpoint || ''}
              onChange={(e) => setFormData({ ...formData, appwriteEndpoint: e.target.value })}
            />
          </div>

          <div className="form-field mb-3">
            <label>Project ID (ID do Projeto)</label>
            <input
              type="text"
              placeholder="ex: 6706e..."
              value={formData.appwriteProjectId || ''}
              onChange={(e) => setFormData({ ...formData, appwriteProjectId: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label>Database ID (Banco de Autopeças)</label>
            <input
              type="text"
              placeholder="ex: kronopex_main_db"
              value={formData.appwriteDatabaseId || ''}
              onChange={(e) => setFormData({ ...formData, appwriteDatabaseId: e.target.value })}
            />
          </div>
        </div>

        {/* Push Notifications (FCM / Web Push) */}
        <div className="admin-settings-card glass-panel">
          <div className="settings-card-head flex-center gap-2 mb-3">
            <Bell size={18} className="text-cyan" />
            <h3 className="font-bold text-sm">Notificações Push (FCM / Web Push)</h3>
          </div>
          <p className="text-xs text-muted mb-3">
            Alertas em tempo real quando clientes finalizarem compras e novos despachos forem criados.
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

        {/* Store Commercial Configs */}
        <div className="admin-settings-card glass-panel">
          <div className="settings-card-head flex-center gap-2 mb-3">
            <Key size={18} className="text-cyan" />
            <h3 className="font-bold text-sm">Dados Comerciais & Cobrança KronoPex</h3>
          </div>

          <div className="form-field mb-3">
            <label>Chave PIX Oficial (Recebimentos)</label>
            <input
              type="text"
              placeholder="pix@kronopex.com.br"
              value={formData.pixKey || ''}
              onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
            />
          </div>

          <div className="form-field mb-3">
            <label>WhatsApp Comercial KronoPex (Com DDD)</label>
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
                value={formData.freeDeliveryThreshold || ''}
                onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-field flex-1">
              <label>Taxa Padrão de Entrega (R$)</label>
              <input
                type="number"
                value={formData.defaultDeliveryFee || ''}
                onChange={(e) => setFormData({ ...formData, defaultDeliveryFee: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        {/* Deploy & Git Ready Checklist */}
        <div className="admin-settings-card glass-panel">
          <div className="settings-card-head flex-center gap-2 mb-3">
            <GitBranch size={18} className="text-cyan" />
            <h3 className="font-bold text-sm">Deploy Vercel & GitHub (celigomesalves)</h3>
          </div>
          <p className="text-xs text-muted mb-2">
            O projeto está estruturado para publicação imediata no Vercel com CI/CD via GitHub.
          </p>

          <ul className="text-xs text-muted list-disc pl-4 space-y-1">
            <li>GitHub Usuário: <strong className="text-main">celigomesalves</strong></li>
            <li>Repositório: <strong className="text-cyan">vitim-kronopex</strong></li>
            <li>Plataforma de Deploy: <strong className="text-main">Vercel (Framework Vite)</strong></li>
            <li>Build Command: <code className="font-mono text-cyan">npm run build</code></li>
            <li>Output Directory: <code className="font-mono text-cyan">dist</code></li>
          </ul>
        </div>

        {/* Save Bar */}
        <div className="full-width flex-center justify-end mt-4">
          <button type="submit" className="btn btn-primary btn-lg flex-center gap-2">
            <Save size={18} />
            <span>Salvar Todas as Configurações</span>
          </button>
        </div>
      </form>
    </div>
  );
}
