import React, { useState } from 'react';
import { Shield, Plus, UserPlus, Trash2, CheckCircle2, Lock, UserCheck } from 'lucide-react';
import { ROLE_DEFINITIONS } from '../../data/mockUsers';

export function AdminUsers({ staff, onSaveStaff, currentAdmin }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'operator'
  });

  const isMasterAdmin = currentAdmin?.role === 'admin';

  const handleAddUser = (e) => {
    e.preventDefault();
    const newUser = {
      id: `user-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      roleName: ROLE_DEFINITIONS[formData.role].label,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      permissions: formData.role === 'admin'
        ? ['all']
        : formData.role === 'manager'
        ? ['products_read', 'products_write', 'orders_manage', 'couriers_manage', 'reports_view']
        : ['orders_read', 'orders_status_update', 'couriers_view']
    };
    onSaveStaff([...staff, newUser]);
    setIsModalOpen(false);
    setFormData({ name: '', email: '', role: 'operator' });
  };

  const handleDeleteUser = (id) => {
    if (staff.length <= 1) {
      alert('Não é possível remover o único administrador do sistema.');
      return;
    }
    if (window.confirm('Deseja revogar o acesso deste colaborador?')) {
      onSaveStaff(staff.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="admin-page-content animate-fade-in">
      <div className="admin-page-header flex-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Equipe & Controle de Permissões (RBAC)</h2>
          <p className="text-xs text-muted">
            Defina níveis de acesso para Administradores, Gerentes de Loja e Operadores de Entrega
          </p>
        </div>
        {isMasterAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary btn-sm flex-center gap-2"
          >
            <UserPlus size={16} />
            <span>Adicionar Colaborador</span>
          </button>
        )}
      </div>

      {/* Permissions Guide Matrix */}
      <div className="role-permissions-guide-grid mb-4">
        {Object.entries(ROLE_DEFINITIONS).map(([roleKey, roleMeta]) => (
          <div key={roleKey} className="role-guide-card glass-panel">
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

      {/* Staff Members Table */}
      <div className="admin-table-wrapper glass-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>E-mail Corporativo</th>
              <th>Nível de Permissão</th>
              <th>Status</th>
              {isMasterAdmin && <th className="text-right">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {staff.map((user) => (
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
                  <span className="text-xs font-mono text-muted">{user.email}</span>
                </td>
                <td>
                  <span className={`badge ${user.role === 'admin' ? 'badge-admin' : user.role === 'manager' ? 'badge-manager' : 'badge-operator'}`}>
                    {user.roleName || user.role.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className="badge badge-stock">Ativo</span>
                </td>
                {isMasterAdmin && (
                  <td className="text-right">
                    {user.id !== currentAdmin?.id && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="table-action-btn text-danger"
                        title="Remover acesso"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-dialog admin-user-dialog glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header flex-between mb-3">
              <h3 className="font-bold text-base flex-center gap-2">
                <UserCheck size={18} className="text-cyan" />
                <span>Cadastrar Novo Colaborador</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="admin-form-grid">
              <div className="form-field full-width">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amanda Vasconcelos"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-field full-width">
                <label>E-mail Corporativo ou Gmail (para Google Auth) *</label>
                <input
                  type="email"
                  required
                  placeholder="amanda@kronopex.com.br"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-field full-width">
                <label>Nível de Acesso (Cargo) *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="operator">Operador / Expedição (Visualiza pedidos e despacha)</option>
                  <option value="manager">Gerente Comercial (Edita estoque, preços e pedidos)</option>
                  <option value="admin">Administrador Master (Acesso Total)</option>
                </select>
              </div>

              <div className="full-width flex-center gap-2 justify-end mt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Liberar Acesso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
