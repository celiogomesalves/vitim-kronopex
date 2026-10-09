export const INITIAL_PARTNERS = [
  {
    id: 'partner-01',
    companyName: 'Distribuidora Paulista de Autopeças (DPA)',
    tradeName: 'DPA Distribuidora',
    cnpj: '12.345.678/0001-90',
    contactName: 'Marcelo Penteado',
    email: 'marcelo@distribuidorapaulista.com.br',
    phone: '(11) 98111-2233',
    city: 'São Paulo - SP',
    commissionRate: 12, // 12% retido pela KronoPex
    status: 'active', // 'active' | 'suspended' | 'pending'
    pixKey: 'financeiro@distribuidorapaulista.com.br',
    categories: ['freios', 'suspensao'],
    approvedAt: '2026-09-15T10:00:00.000Z',
    metrics: {
      totalSold: 4250.00,
      commissionRetained: 510.00,
      payoutDue: 3740.00,
      activeProductsCount: 8
    }
  },
  {
    id: 'partner-02',
    companyName: 'Brasil Motores & Injeção Eletrônica Imp.',
    tradeName: 'Brasil Motores',
    cnpj: '98.765.432/0001-11',
    contactName: 'Juliana Silveira',
    email: 'juliana@brasilmotores.com.br',
    phone: '(11) 97222-3344',
    city: 'Campinas - SP',
    commissionRate: 10, // 10% retido pela KronoPex
    status: 'active',
    pixKey: '98.765.432/0001-11',
    categories: ['motor', 'eletrica'],
    approvedAt: '2026-09-20T14:30:00.000Z',
    metrics: {
      totalSold: 2890.00,
      commissionRetained: 289.00,
      payoutDue: 2601.00,
      activeProductsCount: 5
    }
  }
];

export const INITIAL_PARTNER_REQUESTS = [
  {
    id: 'req-01',
    companyName: 'MegaFiltros & Lubrificantes Ltda',
    tradeName: 'MegaFiltros SP',
    cnpj: '34.567.890/0001-22',
    contactName: 'Fernando Rocha',
    email: 'fernando.rocha@megafiltros.com.br',
    phone: '(11) 98765-1122',
    city: 'São Bernardo do Campo - SP',
    categories: ['oleos', 'motor'],
    estimatedSkus: 'Mais de 150 itens (filtros e lubrificantes)',
    pixKey: 'pix@megafiltros.com.br',
    message: 'Temos estoque próprio a pronta entrega e podemos abastecer a frota KronoPex com desconto em lote.',
    status: 'pending', // 'pending' | 'approved' | 'rejected'
    requestedAt: '2026-10-08T11:20:00.000Z'
  },
  {
    id: 'req-02',
    companyName: 'AutoLight Lâmpadas & Acessórios Automotivos',
    tradeName: 'AutoLight Brasil',
    cnpj: '45.678.901/0001-33',
    contactName: 'Camila Duarte',
    email: 'contato@autolightbrasil.com.br',
    phone: '(11) 99333-8877',
    city: 'Guarulhos - SP',
    categories: ['eletrica', 'acessorios'],
    estimatedSkus: '80 itens de iluminação LED e estética automotiva',
    pixKey: '45.678.901/0001-33',
    message: 'Distribuidores oficiais Philips e Osram. Interessados em parceria para entrega rápida em SP.',
    status: 'pending',
    requestedAt: '2026-10-09T09:45:00.000Z'
  }
];
