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
import { ConfirmationModal } from '../common/ConfirmationModal';
import { formatCurrency, formatPhone, formatCNPJ, formatDate } from '../../utils/formatters';

export function AdminPartners({
  partners,
  partnerRequests,
  onApprovePartner,
  onRejectPartner,
  onSavePartners,
  orders = []
}) {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'active' | 'financial'
  const [approvingReq, setApprovingReq] = useState(null);
  const [commissionInput, setCommissionInput] = useState('12');
  const [editingCommissionId, setEditingCommissionId] = useState(null);
  const [tempCommission, setTempCommission] = useState('');

  // Confirmações
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionType: '',
    payload: null,
    variant: 'danger'
  });

  const pendingRequests = partnerRequests.filter((r) => r.status === 'pending');

  // Cálculos financeiros do marketplace
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

    setConfirmModal({
      isOpen: true,
      title: 'Aprovar Parceria Homologada',
      message: `Deseja aprovar "${approvingReq.companyName}" com comissão de ${commissionInput}% retida pela KronoPex? O fornecedor receberá acesso ao portal para anunciar suas peças.`,
      actionType: 'approve_req',
      payload: { id: approvingReq.id, rate: parseFloat(commissionInput) || 12 },
      variant: 'primary'
    });
  };

  const handlePromptReject = (req) => {
    setConfirmModal({
      isOpen: true,
      title: 'Recusar Proposta de Fornecedor',
      message: `Tem certeza que deseja recusar a solicitação de parceria de "${req.companyName}"?`,
      actionType: 'reject_req',
      payload: req.id,
      variant: 'danger'
    });
  };

  const handlePromptTogglePartner = (partner) => {
    setConfirmModal({
      isOpen: true,
      title: partner.status === 'active' ? 'Suspender Fornecedor' : 'Reativar Fornecedor',
      message: `Deseja ${partner.status === 'active' ? 'suspender temporariamente' : 'reativar'} o parceiro "${partner.tradeName}"?`,
      actionType: 'toggle_partner',
      payload: partner.id,
      variant: partner.status === 'active' ? 'warning' : 'primary'
    });
  };

  const handleSaveCommission = (partnerId) => {
    const rate = parseFloat(tempCommission);
    if (!isNaN(rate) && rate >= 0 && rate <= 100) {
      setConfirmModal({
        isOpen: true,
        title: 'Alterar Taxa de Comissão',
        message: `Deseja alterar a comissão retida para ${rate}%?`,
        actionType: 'save_commission',
        payload: { id: partnerId, rate },
        variant: 'primary'
      });
    }
  };

  const handleExecuteConfirmedAction = () => {
    if (confirmModal.actionType === 'approve_req') {
      onApprovePartner(confirmModal.payload.id, confirmModal.payload.rate);
      setApprovingReq(null);
    } else if (confirmModal.actionType === 'reject_req') {
      onRejectPartner(confirmModal.payload);
    } else if (confirmModal.actionType === 'toggle_partner') {
      const updated = partners.map((p) => {
        if (p.id === confirmModal.payload) {
          return { ...p, status: p.status === 'active' ? 'suspended' : 'active' };
        }
        return p;
      });
      onSavePartners(updated);
    } else if (confirmModal.actionType === 'save_commission') {
      const updated = partners.map((p) => {
        if (p.id === confirmModal.payload.id) {
          return { ...p, commissionRate: confirmModal.payload.rate };
        }
        return p;
      });
      onSavePartners(updated);
      setEditingCommissionId(null);
    }

    setConfirmModal({ isOpen: false, title: '', message: '', actionType: '', payload: null, variant: 'danger' });
  };

  const openWhatsAppApproval = (req, commissionRate) => {
    const cleanPhone = req.phone.replace(/\D/g, '');
    const tempPassword = `KP@${Math.floor(1000 + Math.random() * 9000)}`;
    const msg = encodeURIComponent(
      `🚗 Olá ${req.contactName}, da ${req.companyName}!\n\n` +
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
      <div className="admin-page-header flex-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Parcerias com Distribuidores & Marketplace</h2>
          <p className="text-xs text-muted">
            Gestão de fornecedores parceiros, comissões retidas e relatórios de repasse financeiro
          </p>
        </div>

        {pendingRequests.length > 0 && (
          <span className="badge badge-warning flex-center gap-1 font-bold p-2">
            <AlertCircle size={14} /> {pendingRequests.length} solicitações pendentes
          </span>
        )}
      </div>

      {/* KPI Cards Formatados com Padrão Brasileiro Real */}
      <div className="kpi-cards-grid mb-6">
        <div className="kpi-card glass-panel" onClick={() => setActiveTab('financial')}>
          <div className="kpi-icon-wrap bg-primary-glow">
            <TrendingUp size={22} className="text-primary" />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Vendas Totais Parceiros (GMV)</span>
            <span className="kpi-value">{formatCurrency(totalPartnerGmv)}</span>
            <span className="kpi-trend text-muted text-xs">Transacionado na loja</span>
          </div>
        </div>

        <div className="kpi-card glass-panel" onClick={() => setActiveTab('financial')}>
          <div className="kpi-icon-wrap bg-cyan-glow">
            <Percent size={22} className="text-cyan" />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Comissão KronoPex (Lucro Líquido)</span>
            <span className="kpi-value text-cyan">{formatCurrency(totalCommissionEarned)}</span>
            <span className="kpi-trend text-green text-xs">Retido pela plataforma</span>
          </div>
        </div>

        <div className="kpi-card glass-panel" onClick={() => setActiveTab('financial')}>
          <div className="kpi-icon-wrap bg-warning-glow">
            <DollarSign size={22} className="text-warning" />
          </div>
          <div className="kpi-data">
            <span className="kpi-label">Saldo a Repassar aos Fornecedores</span>
            <span className="kpi-value">{formatCurrency(totalPayoutDue)}</span>
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

      {/* Abas de Navegação */}
      <div className="orders-filter-tabs glass-panel mb-6 flex-center gap-2">
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

      {/* TAB 1: Solicitações de Parceria (Espaçamento Aprimorado) */}
      {activeTab === 'requests' && (
        <div className="partner-requests-grid">
          {pendingRequests.length === 0 ? (
            <div className="glass-panel text-center py-12 text-muted text-xs">
              <CheckCircle2 size={36} className="mx-auto mb-2 text-cyan opacity-40" />
              Não há novas solicitações de parceria pendentes no momento.
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div key={req.id} className="partner-request-card glass-panel p-5">
                <div className="flex-between mb-4 pb-3 border-bottom">
                  <div className="flex-center gap-3">
                    <div className="p-2 rounded bg-surface text-cyan">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <strong className="text-sm block text-main">{req.companyName}</strong>
                      <span className="text-xs text-muted font-mono">CNPJ: {formatCNPJ(req.cnpj)}</span>
                    </div>
                  </div>
                  <span className="badge badge-low-stock">Aguardando Avaliação</span>
                </div>

                <div className="request-info-body text-xs text-muted my-4 space-y-2 leading-relaxed">
                  <div className="flex-between py-1 border-bottom">
                    <span className="text-dim">Responsável:</span>
                    <strong className="text-main">{req.contactName} ({req.city})</strong>
                  </div>
                  <div className="flex-between py-1 border-bottom">
                    <span className="text-dim">Telefone / WhatsApp:</span>
                    <strong className="text-main">{formatPhone(req.phone)}</strong>
                  </div>
                  <div className="flex-between py-1 border-bottom">
                    <span className="text-dim">E-mail Comercial:</span>
                    <strong className="text-main">{req.email}</strong>
                  </div>
                  <div className="flex-between py-1 border-bottom">
                    <span className="text-dim">Chave PIX Repasses:</span>
                    <span className="font-mono text-cyan">{req.pixKey}</span>
                  </div>
                  <div className="flex-between py-1 border-bottom">
                    <span className="text-dim">Volume Estimado:</span>
                    <strong className="text-main">{req.estimatedSkus}</strong>
                  </div>

                  {req.message && (
                    <div className="mt-3 p-3 rounded bg-surface text-main text-xs italic">
                      "{req.message}"
                    </div>
                  )}
                </div>

                <div className="flex-center gap-3 justify-end pt-4 border-top">
                  <button
                    type="button"
                    onClick={() => handlePromptReject(req)}
                    className="btn btn-secondary btn-xs text-danger"
                  >
                    Recusar
                  </button>
                  <button
                    type="button"
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

      {/* TAB 2: Fornecedores Ativos */}
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
                      <span className="text-xs text-muted">{partner.contactName} ({formatPhone(partner.phone)})</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-muted block">{formatCNPJ(partner.cnpj)}</span>
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
                          type="button"
                          onClick={() => handleSaveCommission(partner.id)}
                          className="btn btn-primary btn-xs"
                        >
                          Salvar
                        </button>
                      </div>
                    ) : (
                      <div className="flex-center gap-2">
                        <strong className="text-cyan text-xs">{partner.commissionRate}%</strong>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCommissionId(partner.id);
                            setTempCommission(String(partner.commissionRate));
                          }}
                          className="text-xs text-muted hover-underline"
                        >
                          Alterar
                        </button>
                      </div>
                    )}
                  </td>
                  <td>
                    <strong className="text-xs text-main">
                      {formatCurrency(partner.metrics?.totalSold || 0)}
                    </strong>
                  </td>
                  <td>
                    <strong className="text-xs text-warning">
                      {formatCurrency(partner.metrics?.payoutDue || 0)}
                    </strong>
                  </td>
                  <td>
                    <span className={`badge ${partner.status === 'active' ? 'badge-stock' : 'badge-low-stock'}`}>
                      {partner.status === 'active' ? 'Ativo' : 'Suspenso'}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => handlePromptTogglePartner(partner)}
                      className={`btn btn-secondary btn-xs ${partner.status === 'active' ? 'text-warning' : 'text-green'}`}
                    >
                      {partner.status === 'active' ? 'Suspender' : 'Reativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Extrato Financeiro & Split */}
      {activeTab === 'financial' && (
        <div className="admin-table-wrapper glass-panel p-5">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-main">Extrato de Vendas & Comissões de Fornecedores</h3>
            <p className="text-xs text-muted">
              Divisão automática de valores transacionados na loja e montantes a liquidar via PIX
            </p>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Fornecedor</th>
                <th>Chave PIX de Repasse</th>
                <th>Vendas Brutas (GMV)</th>
                <th>Taxa KronoPex</th>
                <th>Lucro KronoPex Retido</th>
                <th>Valor Líquido a Repassar</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => {
                const sold = partner.metrics?.totalSold || 0;
                const retained = partner.metrics?.commissionRetained || (sold * (partner.commissionRate / 100));
                const payout = partner.metrics?.payoutDue || (sold - retained);

                return (
                  <tr key={partner.id}>
                    <td>
                      <strong className="text-xs text-main block">{partner.tradeName}</strong>
                      <span className="text-xs text-muted">{partner.companyName}</span>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-cyan">{partner.pixKey}</span>
                    </td>
                    <td>
                      <strong className="text-xs text-main">{formatCurrency(sold)}</strong>
                    </td>
                    <td>
                      <span className="badge badge-express">{partner.commissionRate}%</span>
                    </td>
                    <td>
                      <strong className="text-xs text-green">{formatCurrency(retained)}</strong>
                    </td>
                    <td>
                      <strong className="text-xs text-warning">{formatCurrency(payout)}</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Aprovação de Solicitação */}
      {approvingReq && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setApprovingReq(null)}>
          <div
            className="modal-dialog admin-approve-dialog glass-panel p-6"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', width: '92%' }}
          >
            <div className="modal-header flex-between mb-4">
              <h3 className="font-bold text-base flex-center gap-2">
                <CheckCircle2 size={20} className="text-cyan" />
                <span>Aprovar Credenciamento de Parceiro</span>
              </h3>
              <button onClick={() => setApprovingReq(null)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmApprove}>
              <div className="p-4 rounded bg-surface mb-4 space-y-2 text-xs">
                <div><span className="text-dim">Empresa:</span> <strong className="text-main">{approvingReq.companyName}</strong></div>
                <div><span className="text-dim">CNPJ:</span> <span className="font-mono text-muted">{formatCNPJ(approvingReq.cnpj)}</span></div>
                <div><span className="text-dim">Contato:</span> <strong className="text-main">{approvingReq.contactName} ({formatPhone(approvingReq.phone)})</strong></div>
              </div>

              <div className="form-field mb-4">
                <label className="text-xs font-semibold text-main block mb-1">
                  Taxa de Comissão KronoPex (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  required
                  value={commissionInput}
                  onChange={(e) => setCommissionInput(e.target.value)}
                  className="admin-input-lg w-full"
                />
                <span className="text-xs text-muted block mt-1">
                  Percentual retido pela KronoPex sobre o valor de cada peça vendida na loja.
                </span>
              </div>

              <div className="whatsapp-approval-banner p-3 rounded mb-4 flex-center gap-3">
                <MessageCircle size={22} className="text-green flex-shrink-0" />
                <div className="text-xs">
                  <strong className="text-main block">Notificação via WhatsApp</strong>
                  <span className="text-muted">
                    Ao aprovar, você poderá enviar uma mensagem automática no WhatsApp com os dados de acesso e comissão acordada.
                  </span>
                </div>
              </div>

              <div className="flex-center gap-3 justify-end pt-3 border-top">
                <button
                  type="button"
                  onClick={() => setApprovingReq(null)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary flex-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Aprovar & Homologar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmação Universal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={handleExecuteConfirmedAction}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
}
