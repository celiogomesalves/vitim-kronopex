export const INITIAL_ORDERS = [
  {
    id: 'KP-9421',
    createdAt: '2026-10-09T16:30:00.000Z',
    customer: {
      name: 'Roberto Alencar',
      phone: '(11) 99123-4567',
      cep: '04571-000',
      address: 'Av. Eng. Luís Carlos Berrini, 1200',
      neighborhood: 'Brooklin',
      city: 'São Paulo',
      reference: 'Oficina Mecânica Berrini Motors'
    },
    items: [
      {
        id: 'kp-001',
        name: 'Jogo de Pastilhas de Freio Dianteiro Cerâmica',
        quantity: 1,
        price: 152.91
      },
      {
        id: 'kp-003',
        name: 'Óleo Motor 100% Sintético 5W30 Dexos1 Gen3',
        quantity: 4,
        price: 61.65
      }
    ],
    total: 399.51,
    paymentMethod: 'pix',
    paymentStatus: 'paid',
    status: 'delivering', // 'pending' | 'preparing' | 'delivering' | 'delivered' | 'cancelled'
    courierId: 'cour-02',
    notes: 'Entregar urgente para o mecânico chefe Juliano'
  },
  {
    id: 'KP-9420',
    createdAt: '2026-10-09T17:15:00.000Z',
    customer: {
      name: 'Fernanda Martins',
      phone: '(11) 98345-6789',
      cep: '01310-100',
      address: 'Avenida Paulista, 1842',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      reference: 'Apto 42 - Portaria 24h'
    },
    items: [
      {
        id: 'kp-005',
        name: 'Kit Lâmpadas Super LED H7 Ultra Vision 6500K',
        quantity: 1,
        price: 199.90
      }
    ],
    total: 199.90,
    paymentMethod: 'card_delivery',
    paymentStatus: 'pending_on_delivery',
    status: 'preparing',
    courierId: null,
    notes: 'Levar maquininha de cartão de crédito parcelado'
  },
  {
    id: 'KP-9419',
    createdAt: '2026-10-09T15:00:00.000Z',
    customer: {
      name: 'Diego Silveira',
      phone: '(11) 97456-1122',
      cep: '03102-000',
      address: 'Rua da Mooca, 350',
      neighborhood: 'Mooca',
      city: 'São Paulo',
      reference: 'Próximo ao posto Shell'
    },
    items: [
      {
        id: 'kp-002',
        name: 'Kit 4 Velas de Ignição Iridium G-Power',
        quantity: 1,
        price: 197.91
      }
    ],
    total: 197.91,
    paymentMethod: 'pix',
    paymentStatus: 'paid',
    status: 'delivered',
    courierId: 'cour-01',
    notes: 'Recebido na portaria com sucesso'
  }
];
