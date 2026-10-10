import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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

      {/* Modal Adicionar / Editar Membro da Equipe via Portal */}
      {isStaffModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="modal-backdrop-portal"
          onClick={() => setIsStaffModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            backgroundColor: 'rgba(3, 7, 18, 0.85)',
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
            className="admin-user-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '620px',
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: 'rgba(0, 210, 255, 0.12)',
                    border: '1px solid rgba(0, 210, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00d2ff'
                  }}
                >
                  <Shield size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    {editingStaff ? 'Editar Membro da Equipe' : 'Cadastrar Novo Colaborador'}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                    Defina o perfil de acesso e atribuições operacionais
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStaffSubmit} className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              <div className="form-field full-width" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.45rem' }}>
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo Silva"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '14px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div className="form-field">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.45rem' }}>
                  E-mail Corporativo *
                </label>
                <input
                  type="email"
                  required
                  placeholder="exemplo@kronopex.com.br"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '14px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div className="form-field">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.45rem' }}>
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: formatPhone(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '14px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div className="form-field full-width" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.45rem' }}>
                  Função Base (Cargo)
                </label>
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
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '14px',
                    background: '#0b1322',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="admin">Administrador Master (Acesso Total)</option>
                  <option value="manager">Gerente de Loja & Catálogo</option>
                  <option value="operator">Operador de Logística & Expedição</option>
                </select>
              </div>

              {staffForm.role !== 'admin' && (
                <div className="form-field full-width" style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.65rem' }}>
                    Permissões Granulares Específicas
                  </label>
                  <div className="permissions-checklist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '0.75rem' }}>
                    {PERMISSION_OPTIONS.map((perm) => {
                      const isChecked = staffForm.permissions.includes(perm.id);
                      const Icon = perm.icon;
                      return (
                        <div
                          key={perm.id}
                          className={`perm-checkbox-card ${isChecked ? 'active' : ''}`}
                          onClick={() => handleTogglePermission(perm.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.85rem',
                            padding: '0.85rem 1.15rem',
                            borderRadius: '14px',
                            background: isChecked ? 'rgba(0, 210, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                            border: isChecked ? '1px solid rgba(0, 210, 255, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            style={{ width: '18px', height: '18px', accentColor: '#00d2ff', flexShrink: 0 }}
                          />
                          <div className="perm-info">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ffffff', fontSize: '0.9rem' }}>
                              <Icon size={16} className="text-cyan" />
                              <strong>{perm.label}</strong>
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginTop: '0.15rem' }}>{perm.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Botões Pill hu169yr */}
              <div
                className="full-width"
                style={{
                  gridColumn: 'span 2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '1rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  style={{
                    padding: '0.75rem 1.75rem',
                    borderRadius: '9999px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    color: '#e2e8f0',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, #00d2ff 0%, #0077ff 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0, 210, 255, 0.35)',
                    transition: 'all 0.2s'
                  }}
                >
                  {editingStaff ? 'Salvar Alterações' : 'Cadastrar Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Permissões do Fornecedor via Portal */}
      {isPartnerPermModalOpen && editingPartner && typeof document !== 'undefined' && createPortal(
        <div
          className="modal-backdrop-portal"
          onClick={() => setIsPartnerPermModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            backgroundColor: 'rgba(3, 7, 18, 0.85)',
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
            className="admin-user-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: 'rgba(0, 210, 255, 0.12)',
                    border: '1px solid rgba(0, 210, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00d2ff'
                  }}
                >
                  <Building2 size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    Regras de Acesso: {editingPartner.tradeName}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                    Parâmetros de comissão e autonomia no catálogo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPartnerPermModalOpen(false)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePartnerPermSubmit} className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              <div className="form-field full-width" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>Empresa / CNPJ</label>
                <div style={{ padding: '0.85rem 1.15rem', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <strong style={{ display: 'block', color: '#ffffff', fontSize: '0.95rem' }}>{editingPartner.companyName}</strong>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#94a3b8' }}>{formatCNPJ(editingPartner.cnpj)}</span>
                </div>
              </div>

              <div className="form-field">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.45rem' }}>
                  Taxa de Comissão KronoPex (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={partnerPermForm.commissionRate}
                  onChange={(e) => setPartnerPermForm({ ...partnerPermForm, commissionRate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '14px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div className="form-field">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.45rem' }}>
                  Status de Homologação
                </label>
                <select
                  value={partnerPermForm.status}
                  onChange={(e) => setPartnerPermForm({ ...partnerPermForm, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '14px',
                    background: '#0b1322',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="active">Ativo (Permite operar)</option>
                  <option value="suspended">Suspenso (Bloqueado)</option>
                </select>
              </div>

              <div className="form-field full-width" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem 1.15rem', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={partnerPermForm.canUploadProducts}
                    onChange={(e) => setPartnerPermForm({ ...partnerPermForm, canUploadProducts: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#00d2ff', flexShrink: 0 }}
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: '#ffffff' }}>Permitir Cadastro de Peças no Portal</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>O parceiro pode submeter produtos pelo seu painel exclusivo</span>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem 1.15rem', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={partnerPermForm.requiresApproval}
                    onChange={(e) => setPartnerPermForm({ ...partnerPermForm, requiresApproval: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#00d2ff', flexShrink: 0 }}
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: '#f59e0b' }}>Exigir Aprovação Prévia do Administrador</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Cada produto cadastrado só vai para a vitrine após o admin aprovar</span>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem 1.15rem', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={partnerPermForm.canViewReports}
                    onChange={(e) => setPartnerPermForm({ ...partnerPermForm, canViewReports: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#00d2ff', flexShrink: 0 }}
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: '#ffffff' }}>Acesso a Extrato & Repasses Financeiros</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Exibe métricas de vendas e valores a liquidar via PIX</span>
                  </div>
                </label>
              </div>

              {/* Botões Pill hu169yr */}
              <div
                className="full-width"
                style={{
                  gridColumn: 'span 2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '1rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsPartnerPermModalOpen(false)}
                  style={{
                    padding: '0.75rem 1.75rem',
                    borderRadius: '9999px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    color: '#e2e8f0',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, #00d2ff 0%, #0077ff 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0, 210, 255, 0.35)',
                    transition: 'all 0.2s'
                  }}
                >
                  Salvar Regras do Parceiro
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
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
