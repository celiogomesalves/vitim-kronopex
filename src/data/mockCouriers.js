export const INITIAL_COURIERS = [
  {
    id: 'cour-01',
    name: 'Carlos Eduardo (Cadu)',
    phone: '(11) 98765-4321',
    vehicle: 'Honda CG 160 Fan (Placa: BRA2E19)',
    status: 'available', // 'available' | 'delivering' | 'offline'
    deliveriesCompleted: 142,
    rating: 4.95,
    activeOrderCount: 0
  },
  {
    id: 'cour-02',
    name: 'Marcos Vinicius',
    phone: '(11) 97654-3210',
    vehicle: 'Yamaha Fazer 250 (Placa: FOX8K44)',
    status: 'delivering',
    deliveriesCompleted: 218,
    rating: 4.98,
    activeOrderCount: 1
  },
  {
    id: 'cour-03',
    name: 'Rodrigo Santana (Fiorino Rápida)',
    phone: '(11) 96543-2109',
    vehicle: 'Fiat Fiorino 1.4 Peças Pesadas (Placa: KRN4P33)',
    status: 'available',
    deliveriesCompleted: 96,
    rating: 4.90,
    activeOrderCount: 0
  }
];
