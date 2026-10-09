export const INITIAL_STAFF = [
  {
    id: 'user-01',
    name: 'Célio Gomes Alves',
    email: 'celio.master@kronopex.com.br',
    role: 'admin', // 'admin' | 'manager' | 'operator'
    roleName: 'Administrador Master',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    permissions: ['all']
  },
  {
    id: 'user-02',
    name: 'Amanda Vasconcelos',
    email: 'amanda.gerente@kronopex.com.br',
    role: 'manager',
    roleName: 'Gerente Comercial & Estoque',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    permissions: ['products_read', 'products_write', 'orders_manage', 'couriers_manage', 'reports_view']
  },
  {
    id: 'user-03',
    name: 'Lucas Ferreira',
    email: 'lucas.expedicao@kronopex.com.br',
    role: 'operator',
    roleName: 'Operador de Expedição',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    permissions: ['orders_read', 'orders_status_update', 'couriers_view']
  }
];

export const ROLE_DEFINITIONS = {
  admin: {
    label: 'Administrador Master',
    badgeClass: 'badge-admin',
    description: 'Acesso irrestrito a todas as áreas, finanças, configurações de banco Appwrite, equipe e estoque.'
  },
  manager: {
    label: 'Gerente',
    badgeClass: 'badge-manager',
    description: 'Gestão operacional: alteração de preços, estoque, aprovação de pedidos e gestão de entregadores.'
  },
  operator: {
    label: 'Operador / Expedição',
    badgeClass: 'badge-operator',
    description: 'Acompanhamento de pedidos em tempo real, separação de peças e despacho de entregas.'
  }
};
