export const INITIAL_PAYMENT_METHODS = [
  {
    id: 'pay-pix',
    name: 'PIX Instantâneo',
    type: 'pix',
    discountPercent: 10,
    description: 'Aprovação imediata e 10% de desconto especial em qualquer peça.',
    instructions: 'Apresentação do QR Code e chave PIX para pagamento na hora.',
    active: true,
    requiresChange: false
  },
  {
    id: 'pay-credit',
    name: 'Cartão de Crédito (Na Entrega)',
    type: 'card_delivery',
    discountPercent: 0,
    description: 'Pague na maquininha sem fio com o entregador KronoPex. Até 6x.',
    instructions: 'O motoboy levará a máquina de cartão credenciada.',
    active: true,
    requiresChange: false
  },
  {
    id: 'pay-debit',
    name: 'Cartão de Débito (Na Entrega)',
    type: 'debit_delivery',
    discountPercent: 0,
    description: 'Débito imediato Visa, Mastercard ou Elo no ato do recebimento.',
    instructions: 'O motoboy levará a maquininha sem fio.',
    active: true,
    requiresChange: false
  },
  {
    id: 'pay-cash',
    name: 'Dinheiro em Espécie (Na Entrega)',
    type: 'cash',
    discountPercent: 0,
    description: 'Pagamento em cédulas para o entregador. Informe se precisará de troco.',
    instructions: 'O entregador levará o troco previamente separado.',
    active: true,
    requiresChange: true
  },
  {
    id: 'pay-boleto',
    name: 'Boleto Faturado (Exclusivo Oficinas / CNPJ)',
    type: 'boleto',
    discountPercent: 0,
    description: 'Faturamento a prazo de 14/28 dias mediante cadastro prévio.',
    instructions: 'Boleto emitido após análise cadastral e conferência de CNPJ.',
    active: true,
    requiresChange: false
  }
];
