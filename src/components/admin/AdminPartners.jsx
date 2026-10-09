import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Percent,
  DollarSign,
  Building2,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  TrendingUp,
  AlertCircle,
  Shield,
  Key,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export function AdminPartners({
  partners,
  partnerRequests,
  onApprovePartner,
  onRejectPartner,
  onSavePartners,
  orders
}) {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'active' | 'financial'
  const [approvingReq, setApprovingReq] = useState(null);
  const [commissionInput, setCommissionInput] = useState('12');
  const [editingCommissionId, setEditingCommissionId] = useState(null);
  const [tempCommission, setTempCommission] = useState('');

  const pendingRequests = partnerRequests.filter((r) => r.status === 'pending');

  // Marketplace financial calculations
  const totalPartnerGmv = partners.reduce((acc, p) => acc + (p.metrics?.totalSold || 0), 0);
  const totalCommissionEarned = partners.reduce((acc, p) => acc + (p.metrics?.commissionRetained || 0), 0);
  const totalPayoutDue = partners.reduce((acc, p) => acc + (p.metrics?.payoutDue || 0), 0);

  const handleOpenApproveModal = (req) => {
    setApprovingReq(req);
    setCommissionInput('12');
  };

  const handleConfirmApprove = (e) => {
    e.preventDefault();
    if (!approvingReq) return;

    const rate = parseFloat(commissionInput) || 12;
    onApprovePartner(approvingReq.id, rate);
    setApprovingReq(null);
  };

  const handleUpdateCommission = (partnerId) => {
    const rate = parseFloat(tempCommission);
    if (!isNaN(rate) && rate >= 0 && rate <= 100) {
      const updated = partners.map((p) => {
        if (p.id === partnerId) {
          return { ...p, commissionRate: rate };
        }
        return p;
      });
      onSavePartners(updated);
    }
    setEditingCommissionId(null);
  };

  const handleTogglePartnerStatus = (partnerId) => {
    const updated = partners.map((p) => {
      if (p.id === partnerId) {
        return { ...p, status: p.status === 'active' ? 'suspended' : 'active' };
      }
      return p;
    });
    onSavePartners(updated);
  };

  const openWhatsAppApproval = (req, commissionRate) => {
    const cleanPhone = req.phone.replace(/\D/g, '');
    const tempPassword = `KP@${Math.floor(1000 + Math.random() * 9000)}`;
    const msg = encodeURIComponent(
      ` Olá ${req.contactName}, da ${req.companyName}!\n\n` +
      `Temos o prazer de informar que sua solicitação de parceria com a *KronoPex Auto Peças* foi *APROVADA*!\n\n` +
      `*Condições acordadas:*\n` +
      `▪ Comissão retida pela KronoPex: *${commissionRate}%* por peça vendida\n` +
      `▪ Acesso ao Portal do Parceiro:\n` +
      `  - Login: *${req.email}*\n` +
      `  - Senha provisória: *${tempPassword}*\n\n` +
      `Você já pode autenticar no sistema para cadastrar seu catálogo de peças e iniciar as vendas com a nossa frota de delivery express!`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="admin-page-content animate-fade-in">
      <div className="admin-page-header flex-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Parcerias com Distribuidores & Marketplace</h2>
          <p className="text-xs text-muted">
            Gestão de fornecedores parceiros, comissões retidas e relatórios de repasse financeiro
          </p>
        </div>

        {/* Quick Pending Counter Badge */}
        {pendingRequests.length > 0 && (
          <span className="badge badge-warning flex-center gap-1 font-bold">
            <AlertCircle size={13} /> {pendingRequests.length} solicitações pendentes
          </span>
        )}
      </div>

      {/* KPI Cards: Marketplace Financials */}
      <div className="kpi-cards-grid mb-4">
        <div className="kpi-card glass-panel" onClick={() => setActiveTab('financial')}>
          <div className="kpi-icon-wrap bg-primary-glow">
            <TrendingUp size={22} className="text-primary" />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Vendas Totais Parceiros (GMV)</span>
            <span className="kpi-value">R$ {totalPartnerGmv.toFixed(2)}</span>
            <span className="kpi-trend text-muted text-xs">Transacionado na loja</span>
          </div>
        </div>

        <div className="kpi-card glass-panel" onClick={() => setActiveTab('financial')}>
          <div className="kpi-icon-wrap bg-cyan-glow">
            <Percent size={22} className="text-cyan" />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Comissão KronoPex (Lucro Líquido)</span>
            <span className="kpi-value text-cyan">R$ {totalCommissionEarned.toFixed(2)}</span>
            <span className="kpi-trend text-green text-xs">Retido pela plataforma</span>
          </div>
        </div>

        <div className="kpi-card glass-panel" onClick={() => setActiveTab('financial')}>
          <div className="kpi-icon-wrap bg-warning-glow">
            <DollarSign size={22} className="text-warning" />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Saldo a Repassar aos Fornecedores</span>
            <span className="kpi-value">R$ {totalPayoutDue.toFixed(2)}</span>
            <span className="kpi-trend text-xs text-muted">A liquidar via PIX</span>
          </div>
        </div>

        <div className="kpi-card glass-panel" onClick={() => setActiveTab('active')}>
          <div className="kpi-icon-wrap bg-green-glow">
            <Building2 size={22} className="text-green" />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Fornecedores Ativos</span>
            <span className="kpi-value">{partners.filter((p) => p.status === 'active').length}</span>
            <span className="kpi-trend text-xs text-muted">Distribuidores homologados</span>
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="orders-filter-tabs glass-panel mb-4 flex-center gap-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`order-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
        >
          <Briefcase size={15} />
          <span>Solicitações de Parceria</span>
          <span className="order-tab-counter">{pendingRequests.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`order-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
        >
          <Building2 size={15} />
          <span>Distribuidores Ativos</span>
          <span className="order-tab-counter">{partners.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('financial')}
          className={`order-tab-btn ${activeTab === 'financial' ? 'active' : ''}`}
        >
          <DollarSign size={15} />
          <span>Extrato Financeiro & Split de Comissões</span>
        </button>
      </div>

      {/* TAB 1: Pending Requests */}
      {activeTab === 'requests' && (
        <div className="partner-requests-grid">
          {pendingRequests.length === 0 ? (
            <div className="glass-panel text-center py-10 text-muted text-xs">
              <CheckCircle2 size={36} className="mx-auto mb-2 text-cyan opacity-40" />
              Não há novas solicitações de parceria pendentes no momento.
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div key={req.id} className="partner-request-card glass-panel">
                <div className="flex-between mb-2">
                  <div className="flex-center gap-2">
                    <Building2 size={18} className="text-cyan" />
                    <div>
                      <strong className="text-sm block text-main">{req.companyName}</strong>
                      <span className="text-xs text-muted font-mono">CNPJ: {req.cnpj}</span>
                    </div>
                  </div>
                  <span className="badge badge-low-stock">Aguardando Avaliação</span>
                </div>

                <div className="request-info-body text-xs text-muted my-3 space-y-1">
                  <div><strong>Responsável:</strong> {req.contactName} ({req.city})</div>
                  <div><strong>Contato:</strong> {req.phone} • {req.email}</div>
                  <div><strong>Chave PIX Repasses:</strong> {req.pixKey}</div>
                  <div><strong>Volume Estimado:</strong> {req.estimatedSkus}</div>
                  <div className="mt-2 p-2 rounded bg-surface text-main">
                    <em>"{req.message}"</em>
                  </div>
                </div>

                <div className="flex-center gap-2 justify-end pt-2 border-top">
                  <button
                    onClick={() => onRejectPartner(req.id)}
                    className="btn btn-secondary btn-xs text-danger"
                  >
                    Recusar
                  </button>
                  <button
                    onClick={() => handleOpenApproveModal(req)}
                    className="btn btn-primary btn-xs flex-center gap-1"
                  >
                    <CheckCircle2 size={14} />
                    <span>Aprovar Parceria & Definir Comissão</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Active Partners */}
      {activeTab === 'active' && (
        <div className="admin-table-wrapper glass-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Distribuidor / Parceiro</th>
                <th>CNPJ & Cidade</th>
                <th>Comissão KronoPex (%)</th>
                <th>Total Vendido</th>
                <th>Saldo a Repassar</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr key={partner.id}>
                  <td>
                    <div>
                      <strong className="text-xs text-main block">{partner.tradeName}</strong>
                      <span className="text-xs text-muted">{partner.contactName} ({partner.phone})</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-muted block">{partner.cnpj}</span>
                    <span className="text-xs text-dim">{partner.city}</span>
                  </td>
                  <td>
                    {editingCommissionId === partner.id ? (
                      <div className="flex-center gap-1">
                        <input
                          type="number"
                          className="admin-input-xs"
                          style={{ width: '60px' }}
                          value={tempCommission}
                          onChange={(e) => setTempCommission(e.target.value)}
                        />
                        <button
                          onClick={() => handleUpdateCommission(partner.id)}
                          className="btn btn-primary btn-xs"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingCommissionId(partner.id);
                          setTempCommission(partner.commissionRate.toString());
                        }}
                        className="badge badge-express font-bold cursor-pointer hover:opacity-80"
                        title="Clique para editar comissão"
                      >
                        {partner.commissionRate}% Retido
                      </button>
                    )}
                  </td>
                  <td>
                    <strong className="text-xs text-main">
                      R$ {(partner.metrics?.totalSold || 0).toFixed(2)}
                    </strong>
                  </td>
                  <td>
                    <span className="font-bold text-xs text-warning">
                      R$ {(partner.metrics?.payoutDue || 0).toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${partner.status === 'active' ? 'badge-stock' : 'badge-danger'}`}>
                      {partner.status === 'active' ? 'Ativo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => handleTogglePartnerStatus(partner.id)}
                      className="btn btn-secondary btn-xs"
                    >
                      {partner.status === 'active' ? 'Bloquear' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Financial Settlement & Split */}
      {activeTab === 'financial' && (
        <div className="financial-split-sheet glass-panel p-4">
          <div className="flex-between mb-3">
            <div>
              <h3 className="font-bold text-base text-main">Divisão de Receitas (Split Automático)</h3>
              <p className="text-xs text-muted">
                Demonstrativo de cada peça vendida de parceiro, valor bruto, taxa da KronoPex e líquido a transferir
              </p>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Distribuidor Parceiro</th>
                  <th>Chave PIX Cadastrada</th>
                  <th>Vendas Brutas (R$)</th>
                  <th>Taxa (%)</th>
                  <th>Receita KronoPex (R$)</th>
                  <th>Líquido do Parceiro (R$)</th>
                  <th className="text-right">Status do Repasse</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => {
                  const gross = p.metrics?.totalSold || 0;
                  const kronopexShare = p.metrics?.commissionRetained || 0;
                  const partnerNet = p.metrics?.payoutDue || 0;

                  return (
                    <tr key={p.id}>
                      <td>
                        <strong className="text-xs text-main block">{p.companyName}</strong>
                        <span className="text-xs text-muted">{p.contactName}</span>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-cyan">{p.pixKey}</span>
                      </td>
                      <td>R$ {gross.toFixed(2)}</td>
                      <td>
                        <span className="badge badge-express font-bold">{p.commissionRate}%</span>
                      </td>
                      <td>
                        <strong className="text-xs text-cyan">R$ {kronopexShare.toFixed(2)}</strong>
                      </td>
                      <td>
                        <strong className="text-xs text-warning">R$ {partnerNet.toFixed(2)}</strong>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => alert(`Repasse de R$ ${partnerNet.toFixed(2)} para a chave PIX ${p.pixKey} registrado com sucesso!`)}
                          className="btn btn-primary btn-xs"
                        >
                          Pagar via PIX
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Approve Partner & Configure Commission */}
      {approvingReq && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setApprovingReq(null)}>
          <div
            className="modal-dialog admin-approve-dialog glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header flex-between mb-3">
              <h3 className="font-bold text-base flex-center gap-2">
                <Shield size={18} className="text-cyan" />
                <span>Aprovar Parceria com {approvingReq.companyName}</span>
              </h3>
              <button onClick={() => setApprovingReq(null)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmApprove}>
              <div className="partner-approval-summary p-3 rounded bg-surface text-xs mb-3 space-y-1">
                <div><strong>CNPJ:</strong> {approvingReq.cnpj}</div>
                <div><strong>Responsável:</strong> {approvingReq.contactName} ({approvingReq.phone})</div>
                <div><strong>E-mail:</strong> {approvingReq.email}</div>
                <div><strong>Chave PIX:</strong> {approvingReq.pixKey}</div>
              </div>

              <div className="form-field mb-4">
                <label className="font-bold text-main">
                  Percentual de Comissão Retido pela KronoPex (%):
                </label>
                <p className="text-xs text-muted mb-2">
                  Esta porcentagem será descontada automaticamente de cada peça vendida deste distribuidor parceiro.
                </p>
                <div className="flex-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    required
                    value={commissionInput}
                    onChange={(e) => setCommissionInput(e.target.value)}
                    className="admin-input-lg"
                    style={{ maxWidth: '140px' }}
                  />
                  <span className="font-bold text-lg text-cyan">%</span>
                </div>
              </div>

              <div className="whatsapp-approval-banner p-3 rounded mb-4 flex-between text-xs glass-panel">
                <span className="text-muted">
                  Ao aprovar, envie as credenciais de acesso direto no WhatsApp do parceiro:
                </span>
                <button
                  type="button"
                  onClick={() => openWhatsAppApproval(approvingReq, commissionInput)}
                  className="btn btn-secondary btn-xs flex-center gap-1"
                  style={{ color: '#25D366' }}
                >
                  <MessageCircle size={14} />
                  <span>Enviar Acesso no WhatsApp</span>
                </button>
              </div>

              <div className="flex-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setApprovingReq(null)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirmar e Liberar Acesso do Parceiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
