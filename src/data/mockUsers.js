// Administradores Master Nativos com Acesso Direto Permanente
export const MASTER_ADMINS = [
  {
    id: 'master-celio',
    name: 'Célio Gomes Alves',
    email: 'celiogomesalves@gmail.com',
    role: 'admin',
    roleName: 'Administrador Master',
    status: 'active',
    isSuperAdmin: true,
    avatar: 'https://ui-avatars.com/api/?name=Celio+Gomes&background=00f5a0&color=050d1a&bold=true',
    permissions: [
      'manage_products',
      'approve_partner_products',
      'manage_orders',
      'manage_couriers',
      'view_financial',
      'manage_settings',
      'all'
    ],
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'master-victor',
    name: 'Victor Hugo',
    email: 'victorhugotortuga33@gmail.com',
    role: 'admin',
    roleName: 'Administrador Master',
    status: 'active',
    isSuperAdmin: true,
    avatar: 'https://ui-avatars.com/api/?name=Victor+Hugo&background=00d2ff&color=050d1a&bold=true',
    permissions: [
      'manage_products',
      'approve_partner_products',
      'manage_orders',
      'manage_couriers',
      'view_financial',
      'manage_settings',
      'all'
    ],
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const MASTER_ADMIN_EMAILS = MASTER_ADMINS.map((a) => a.email.toLowerCase());

export const isSuperAdminEmail = (email) => {
  if (!email) return false;
  return MASTER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
};

export const INITIAL_STAFF = [...MASTER_ADMINS];

export const ROLE_DEFINITIONS = {
  admin: {
    label: 'Administrador Master',
    badgeClass: 'badge-admin',
    description: 'Acesso irrestrito a todas as áreas, finanças, configurações de banco Appwrite, equipe e estoque.'
  },
  manager: {
    label: 'Gerente Comercial',
    badgeClass: 'badge-manager',
    description: 'Gestão operacional: alteração de preços, estoque, aprovação de pedidos e gestão de entregadores.'
  },
  operator: {
    label: 'Operador / Expedição',
    badgeClass: 'badge-operator',
    description: 'Acompanhamento de pedidos em tempo real, separação de peças e despacho de entregas.'
  }
};

