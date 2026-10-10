import React, { useState } from 'react';
import {
  Users,
  Shield,
  Building2,
  UserPlus,
  Trash2,
  Edit2,
  Lock,
  Sliders,
  DollarSign,
  Package,
  ShoppingBag,
  Truck,
  Settings
} from 'lucide-react';
import { ROLE_DEFINITIONS } from '../../data/mockUsers';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { formatPhone, formatCNPJ } from '../../utils/formatters';

const PERMISSION_OPTIONS = [
  { id: 'manage_products', label: 'Gerenciar Catálogo & Estoque', icon: Package, desc: 'Criar, alterar preços e quantidade de peças' },
  { id: 'approve_partner_products', label: 'Moderação de Produtos de Fornecedores', icon: Shield, desc: 'Aprovar ou rejeitar peças enviadas para a vitrine' },
  { id: 'manage_orders', label: 'Expedição & Gestão de Pedidos', icon: ShoppingBag, desc: 'Alterar status de pedidos e despachar' },
  { id: 'manage_couriers', label: 'Frotas & Entregadores', icon: Truck, desc: 'Cadastrar e alocar motoboys' },
  { id: 'view_financial', label: 'Relatórios Financeiros & Comissões', icon: DollarSign, desc: 'Acessar extrato de GMV e repasses' },
  { id: 'manage_settings', label: 'Configurações do Sistema', icon: Settings, desc: 'Alterar integrações e formas de pagamento' }
];

export function AdminUsers({
  staff,
  onSaveStaff,
  partners = [],
  onSavePartners,
  currentAdmin
}) {
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'partners'
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'operator',
    permissions: ['manage_orders']
  });

  // Modal de edição de permissões do fornecedor
  const [isPartnerPermModalOpen, setIsPartnerPermModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [partnerPermForm, setPartnerPermForm] = useState({
    canUploadProducts: true,
    requiresApproval: true,
    canViewReports: true,
    commissionRate: 12,
    status: 'active'
  });

  // Confirmações
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionType: '',
    payload: null,
    variant: 'danger'
  });

  const isMasterAdmin = currentAdmin?.role === 'admin';

  // --- Handlers de Equipe (Staff) ---
  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStaffForm({
      name: '',
      email: '',
      phone: '',
      role: 'operator',
      permissions: ['manage_orders']
    });
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (user) => {
    setEditingStaff(user);
    setStaffForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'operator',
      permissions: user.permissions || (user.role === 'admin' ? PERMISSION_OPTIONS.map((p) => p.id) : ['manage_orders'])
    });
    setIsStaffModalOpen(true);
  };

  const handleTogglePermission = (permId) => {
    setStaffForm((prev) => {
      const exists = prev.permissions.includes(permId);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== permId)
          : [...prev.permissions, permId]
      };
    });
  };

  const handleStaffSubmit = (e) => {
    e.preventDefault();
    if (editingStaff) {
      setConfirmModal({
        isOpen: true,
        title: 'Confirmar Alterações no Colaborador',
        message: `Deseja salvar as permissões e dados de "${staffForm.name}"?`,
        actionType: 'save_staff',
        payload: { ...staffForm },
        variant: 'primary'
      });
    } else {
      const newUser = {
        id: `user-${Date.now().toString().slice(-4)}`,
        name: staffForm.name.trim(),
        email: staffForm.email.trim(),
        phone: staffForm.phone.trim(),
        role: staffForm.role,
        roleName: ROLE_DEFINITIONS[staffForm.role]?.label || 'Operador',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        permissions: staffForm.role === 'admin' ? PERMISSION_OPTIONS.map((p) => p.id) : staffForm.permissions
      };
      onSaveStaff([...staff, newUser]);
      setIsStaffModalOpen(false);
    }
  };

  const handlePromptDeleteStaff = (user) => {
    if (staff.length <= 1) {
      alert('Não é possível remover o único administrador do sistema.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Revogar Acesso do Colaborador',
      message: `Tem certeza que deseja revogar o acesso de "${user.name}" (${user.email})?`,
      actionType: 'delete_staff',
      payload: user.id,
      variant: 'danger'
    });
  };

  // --- Handlers de Fornecedores ---
  const handleOpenEditPartnerPerms = (partner) => {
    setEditingPartner(partner);
    setPartnerPermForm({
      canUploadProducts: partner.canUploadProducts !== false,
      requiresApproval: partner.requiresApproval !== false,
      canViewReports: partner.canViewReports !== false,
      commissionRate: partner.commissionRate || 12,
      status: partner.status || 'active'
    });
    setIsPartnerPermModalOpen(true);
  };

  const handlePartnerPermSubmit = (e) => {
    e.preventDefault();
    setConfirmModal({
      isOpen: true,
      title: 'Atualizar Permissões do Fornecedor',
      message: `Deseja atualizar as regras de publicação e comissão para "${editingPartner.companyName}"?`,
      actionType: 'save_partner_perms',
      payload: { ...partnerPermForm },
      variant: 'primary'
    });
  };

  // --- Confirmação Centralizada ---
  const handleExecuteConfirmedAction = () => {
    if (confirmModal.actionType === 'delete_staff') {
      const updated = staff.filter((u) => u.id !== confirmModal.payload);
      onSaveStaff(updated);
    } else if (confirmModal.actionType === 'save_staff') {
      const updated = staff.map((u) => {
        if (u.id === editingStaff.id) {
          return {
            ...u,
            name: confirmModal.payload.name,
            email: confirmModal.payload.email,
            phone: confirmModal.payload.phone,
            role: confirmModal.payload.role,
            roleName: ROLE_DEFINITIONS[confirmModal.payload.role]?.label || u.roleName,
            permissions: confirmModal.payload.permissions
          };
        }
        return u;
      });
      onSaveStaff(updated);
      setIsStaffModalOpen(false);
    } else if (confirmModal.actionType === 'save_partner_perms') {
      const updated = partners.map((p) => {
        if (p.id === editingPartner.id) {
          return {
            ...p,
            canUploadProducts: confirmModal.payload.canUploadProducts,
            requiresApproval: confirmModal.payload.requiresApproval,
            canViewReports: confirmModal.payload.canViewReports,
            commissionRate: Number(confirmModal.payload.commissionRate),
            status: confirmModal.payload.status
          };
        }
        return p;
      });
      onSavePartners(updated);
      setIsPartnerPermModalOpen(false);
    }

    setConfirmModal({ isOpen: false, title: '', message: '', actionType: '', payload: null, variant: 'danger' });
  };

  return (
    <div className="admin-page-content animate-fade-in">
      <div className="admin-page-header flex-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Gestão de Equipe & Permissões de Acesso</h2>
          <p className="text-xs text-muted">
            Controle os privilégios dos membros internos da sua equipe e as regras de publicação dos fornecedores homologados
          </p>
        </div>
        {activeTab === 'staff' && isMasterAdmin && (
          <button
            onClick={handleOpenAddStaff}
            className="btn btn-primary btn-sm flex-center gap-2"
          >
            <UserPlus size={16} />
            <span>Adicionar Colaborador</span>
          </button>
        )}
      </div>

      {/* Tabs de Seleção */}
      <div className="orders-filter-tabs glass-panel mb-6 flex-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('staff')}
          className={`order-tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
        >
          <Users size={16} />
          <span>Equipe Interna & RBAC</span>
          <span className="order-tab-counter">{staff.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('partners')}
          className={`order-tab-btn ${activeTab === 'partners' ? 'active' : ''}`}
        >
          <Building2 size={16} />
          <span>Permissões de Fornecedores</span>
          <span className="order-tab-counter">{partners.length}</span>
        </button>
      </div>

      {/* ABA 1: Equipe Interna */}
      {activeTab === 'staff' && (
        <>
          {/* Guia Visual de Cargos */}
          <div className="role-permissions-guide-grid mb-6">
            {Object.entries(ROLE_DEFINITIONS).map(([roleKey, roleMeta]) => (
              <div key={roleKey} className="role-guide-card glass-panel p-4">
                <div className="flex-between mb-2">
                  <span className={`badge ${roleMeta.badgeClass}`}>
                    {roleMeta.label}
                  </span>
                  <Lock size={14} className="text-muted" />
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {roleMeta.description}
                </p>
              </div>
            ))}
          </div>

          {/* Tabela de Membros da Equipe */}
          <div className="admin-table-wrapper glass-panel">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Colaborador</th>
                  <th>Contato</th>
                  <th>Cargo / Função</th>
                  <th>Permissões Ativas</th>
                  <th>Status</th>
                  {isMasterAdmin && <th className="text-right">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {staff.map((user) => {
                  const userPerms = user.permissions || [];
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="flex-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="staff-avatar-sm"
                          />
                          <div>
                            <strong className="text-xs text-main block">{user.name}</strong>
                            <span className="text-xs text-dim">ID: {user.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-xs font-mono text-muted block">{user.email}</span>
                        {user.phone && <span className="text-xs text-dim">{formatPhone(user.phone)}</span>}
                      </td>
                      <td>
                        <span className={`badge ${user.role === 'admin' ? 'badge-admin' : user.role === 'manager' ? 'badge-manager' : 'badge-operator'}`}>
                          {user.roleName || user.role.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="flex-center gap-1 flex-wrap" style={{ maxWidth: '280px' }}>
                          {user.role === 'admin' ? (
                            <span className="badge badge-express">Acesso Total (Master)</span>
                          ) : userPerms.length > 0 ? (
                            userPerms.map((pId) => {
                              const found = PERMISSION_OPTIONS.find((opt) => opt.id === pId);
                              return (
                                <span key={pId} className="badge badge-stock text-xs" title={found?.desc}>
                                  {found?.label.split(' ')[0] || pId}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-xs text-dim italic">Sem permissões extras</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-stock">Ativo</span>
                      </td>
                      {isMasterAdmin && (
                        <td className="text-right">
                          <div className="flex-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => handleOpenEditStaff(user)}
                              className="table-action-btn"
                              title="Editar permissões"
                            >
                              <Edit2 size={15} />
                            </button>
                            {user.id !== currentAdmin?.id && (
                              <button
                                type="button"
                                onClick={() => handlePromptDeleteStaff(user)}
                                className="table-action-btn text-danger"
                                title="Revogar acesso"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ABA 2: Permissões de Fornecedores */}
      {activeTab === 'partners' && (
        <div className="admin-table-wrapper glass-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fornecedor / Razão Social</th>
                <th>CNPJ & Contato</th>
                <th>Upload de Peças</th>
                <th>Regra de Vitrine</th>
                <th>Comissão KronoPex</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {partners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted text-xs">
                    Nenhum parceiro homologado no momento.
                  </td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr key={partner.id}>
                    <td>
                      <div>
                        <strong className="text-xs text-main block">{partner.companyName}</strong>
                        <span className="text-xs text-muted">{partner.tradeName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-muted block">{formatCNPJ(partner.cnpj)}</span>
                      <span className="text-xs text-dim">{partner.contactName} ({formatPhone(partner.phone)})</span>
                    </td>
                    <td>
                      <span className={`badge ${partner.canUploadProducts !== false ? 'badge-stock' : 'badge-low-stock'}`}>
                        {partner.canUploadProducts !== false ? 'Autorizado' : 'Bloqueado'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${partner.requiresApproval !== false ? 'badge-warning' : 'badge-express'}`}>
                        {partner.requiresApproval !== false ? 'Exige Aprovação Prévia' : 'Publicação Direta'}
                      </span>
                    </td>
                    <td>
                      <strong className="text-xs text-cyan">{partner.commissionRate || 12}%</strong>
                    </td>
                    <td>
                      <span className={`badge ${partner.status === 'active' ? 'badge-stock' : 'badge-low-stock'}`}>
                        {partner.status === 'active' ? 'Ativo' : 'Suspenso'}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEditPartnerPerms(partner)}
                        className="btn btn-secondary btn-xs flex-center gap-1 justify-end"
                        title="Configurar permissões do parceiro"
                      >
                        <Sliders size={13} />
                        <span>Regras & Acesso</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Adicionar / Editar Membro da Equipe */}
      {isStaffModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsStaffModalOpen(false)}>
          <div
            className="modal-dialog admin-user-dialog glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '580px', width: '92%' }}
          >
            <div className="modal-header flex-between mb-4">
              <h3 className="font-bold text-base flex-center gap-2">
                <Shield size={18} className="text-cyan" />
                <span>{editingStaff ? 'Editar Membro da Equipe' : 'Cadastrar Novo Colaborador'}</span>
              </h3>
              <button onClick={() => setIsStaffModalOpen(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleStaffSubmit} className="admin-form-grid">
              <div className="form-field full-width mb-3">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo Silva"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                />
              </div>

              <div className="form-field mb-3">
                <label>E-mail Corporativo *</label>
                <input
                  type="email"
                  required
                  placeholder="exemplo@kronopex.com.br"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                />
              </div>

              <div className="form-field mb-3">
                <label>Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: formatPhone(e.target.value) })}
                />
              </div>

              <div className="form-field full-width mb-4">
                <label>Função Base (Cargo)</label>
                <select
                  value={staffForm.role}
                  onChange={(e) => {
                    const r = e.target.value;
                    setStaffForm({
                      ...staffForm,
                      role: r,
                      permissions: r === 'admin'
                        ? PERMISSION_OPTIONS.map((p) => p.id)
                        : r === 'manager'
                        ? ['manage_products', 'approve_partner_products', 'manage_orders', 'manage_couriers']
                        : ['manage_orders']
                    });
                  }}
                >
                  <option value="admin">Administrador Master (Acesso Total)</option>
                  <option value="manager">Gerente de Loja & Catálogo</option>
                  <option value="operator">Operador de Logística & Expedição</option>
                </select>
              </div>

              {staffForm.role !== 'admin' && (
                <div className="form-field full-width mb-4">
                  <label className="block mb-2 font-semibold">Permissões Granulares Específicas</label>
                  <div className="permissions-checklist-grid">
                    {PERMISSION_OPTIONS.map((perm) => {
                      const isChecked = staffForm.permissions.includes(perm.id);
                      const Icon = perm.icon;
                      return (
                        <div
                          key={perm.id}
                          className={`perm-checkbox-card ${isChecked ? 'active' : ''}`}
                          onClick={() => handleTogglePermission(perm.id)}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="perm-checkbox"
                          />
                          <div className="perm-info">
                            <span className="perm-label flex-center gap-1">
                              <Icon size={14} className="text-cyan" />
                              <strong>{perm.label}</strong>
                            </span>
                            <span className="perm-desc text-xs text-muted block">{perm.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="full-width flex-center gap-3 justify-end pt-3 border-top">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStaff ? 'Salvar Alterações' : 'Cadastrar Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Permissões do Fornecedor */}
      {isPartnerPermModalOpen && editingPartner && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsPartnerPermModalOpen(false)}>
          <div
            className="modal-dialog admin-user-dialog glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', width: '92%' }}
          >
            <div className="modal-header flex-between mb-4">
              <h3 className="font-bold text-base flex-center gap-2">
                <Building2 size={18} className="text-cyan" />
                <span>Regras de Acesso: {editingPartner.tradeName}</span>
              </h3>
              <button onClick={() => setIsPartnerPermModalOpen(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handlePartnerPermSubmit} className="admin-form-grid">
              <div className="form-field full-width mb-3">
                <label className="text-xs text-muted block mb-1">Empresa / CNPJ</label>
                <div className="p-3 rounded bg-surface">
                  <strong className="block text-main">{editingPartner.companyName}</strong>
                  <span className="text-xs font-mono text-muted">{formatCNPJ(editingPartner.cnpj)}</span>
                </div>
              </div>

              <div className="form-field mb-3">
                <label>Taxa de Comissão KronoPex (%)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={partnerPermForm.commissionRate}
                  onChange={(e) => setPartnerPermForm({ ...partnerPermForm, commissionRate: e.target.value })}
                />
              </div>

              <div className="form-field mb-3">
                <label>Status de Homologação</label>
                <select
                  value={partnerPermForm.status}
                  onChange={(e) => setPartnerPermForm({ ...partnerPermForm, status: e.target.value })}
                >
                  <option value="active">Ativo (Permite operar)</option>
                  <option value="suspended">Suspenso (Bloqueado)</option>
                </select>
              </div>

              <div className="form-field full-width mb-3 space-y-3">
                <label className="flex-center gap-3 p-3 rounded bg-surface cursor-pointer">
                  <input
                    type="checkbox"
                    checked={partnerPermForm.canUploadProducts}
                    onChange={(e) => setPartnerPermForm({ ...partnerPermForm, canUploadProducts: e.target.checked })}
                  />
                  <div>
                    <strong className="block text-xs text-main">Permitir Cadastro de Peças no Portal</strong>
                    <span className="text-xs text-muted">O parceiro pode submeter produtos pelo seu painel exclusivo</span>
                  </div>
                </label>

                <label className="flex-center gap-3 p-3 rounded bg-surface cursor-pointer">
                  <input
                    type="checkbox"
                    checked={partnerPermForm.requiresApproval}
                    onChange={(e) => setPartnerPermForm({ ...partnerPermForm, requiresApproval: e.target.checked })}
                  />
                  <div>
                    <strong className="block text-xs text-warning">Exigir Aprovação Prévia do Administrador</strong>
                    <span className="text-xs text-muted">Cada produto cadastrado só vai para a vitrine após o admin aprovar</span>
                  </div>
                </label>

                <label className="flex-center gap-3 p-3 rounded bg-surface cursor-pointer">
                  <input
                    type="checkbox"
                    checked={partnerPermForm.canViewReports}
                    onChange={(e) => setPartnerPermForm({ ...partnerPermForm, canViewReports: e.target.checked })}
                  />
                  <div>
                    <strong className="block text-xs text-main">Acesso a Extrato & Repasses Financeiros</strong>
                    <span className="text-xs text-muted">Exibe métricas de vendas e valores a liquidar via PIX</span>
                  </div>
                </label>
              </div>

              <div className="full-width flex-center gap-3 justify-end pt-3 border-top">
                <button
                  type="button"
                  onClick={() => setIsPartnerPermModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Regras do Parceiro
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
