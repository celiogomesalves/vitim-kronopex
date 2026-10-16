// Início real de produção: lista de equipe zerada.
// O sistema exige o cadastro do primeiro Administrador Master para liberação da loja.
export const INITIAL_STAFF = [];

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
