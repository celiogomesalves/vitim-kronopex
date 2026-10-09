export const INITIAL_CATEGORIES = [
  { id: 'all', name: 'Todas as Peças', icon: 'Wrench' },
  { id: 'motor', name: 'Motor & Injeção', icon: 'Flame' },
  { id: 'freios', name: 'Freios & Segurança', icon: 'Disc' },
  { id: 'suspensao', name: 'Suspensão & Direção', icon: 'ShieldAlert' },
  { id: 'eletrica', name: 'Elétrica & Iluminação', icon: 'Zap' },
  { id: 'oleos', name: 'Óleos & Filtros', icon: 'Droplets' },
  { id: 'acessorios', name: 'Acessórios & Estética', icon: 'Sparkles' }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'kp-001',
    name: 'Jogo de Pastilhas de Freio Dianteiro Cerâmica',
    category: 'freios',
    brand: 'Cobreq Ceramic Pro',
    oemCode: 'N-1238C',
    vehicles: ['VW Gol G5/G6', 'Voyage 1.6', 'Saveiro Cross', 'Fox 1.6'],
    price: 169.90,
    pixDiscountPrice: 152.91, // 10% off no pix
    stock: 14,
    minStock: 4,
    isExpressDelivery: true,
    rating: 4.9,
    reviewsCount: 38,
    image: 'https://images.unsplash.com/photo-1600793575654-910699b5e4d4?w=800&auto=format&fit=crop&q=80',
    description: 'Pastilhas de alta durabilidade com composto cerâmico. Redução drástica de ruídos e fuligem nas rodas, com frenagem progressiva e segura em altas temperaturas.',
    specs: {
      'Posição': 'Dianteira',
      'Material': 'Cerâmica Avançada',
      'Com sensor': 'Não',
      'Garantia': '6 meses direto de fábrica'
    }
  },
  {
    id: 'kp-002',
    name: 'Kit 4 Velas de Ignição Iridium G-Power',
    category: 'motor',
    brand: 'NGK Japan',
    oemCode: 'BKR6EIX-11',
    vehicles: ['Honda Civic 1.8/2.0', 'Fit 1.4/1.5', 'City i-VTEC', 'Corolla 1.8'],
    price: 219.90,
    pixDiscountPrice: 197.91,
    stock: 22,
    minStock: 5,
    isExpressDelivery: true,
    rating: 5.0,
    reviewsCount: 64,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80',
    description: 'Ponta de Iridium ultrafina de 0.6mm para queima mais eficiente, economia comprovada de combustível e resposta imediata na aceleração.',
    specs: {
      'Material do eletrodo': 'Iridium puro',
      'Abertura de eletrodo': '1.1 mm',
      'Rosca': '14 mm',
      'Garantia': '12 meses'
    }
  },
  {
    id: 'kp-003',
    name: 'Óleo Motor 100% Sintético 5W30 Dexos1 Gen3 (1 Litro)',
    category: 'oleos',
    brand: 'Motul 8100 Eco-lite',
    oemCode: 'MOT-5W30-1L',
    vehicles: ['Chevrolet Onix/Tracker', 'Hyundai HB20', 'Ford Ka 1.0 3Cil', 'Jeep Renegade'],
    price: 68.50,
    pixDiscountPrice: 61.65,
    stock: 45,
    minStock: 10,
    isExpressDelivery: true,
    rating: 4.9,
    reviewsCount: 112,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
    description: 'Lubrificante 100% sintético homologado API SP e ILSAC GF-6A. Protege contra pré-ignição em baixas velocidades (LSPI) em motores turbo modernos.',
    specs: {
      'Viscosidade': 'SAE 5W-30',
      'Norma': 'API SP / ILSAC GF-6A / Dexos1 Gen3',
      'Volume': '1 Litro',
      'Garantia': 'Validade 5 anos lacrado'
    }
  },
  {
    id: 'kp-004',
    name: 'Par de Amortecedores Dianteiros Turbogás pressurizados',
    category: 'suspensao',
    brand: 'Cofap Autopeças',
    oemCode: 'GP32488',
    vehicles: ['Fiat Palio/Siena 1.0/1.4', 'Strada Working', 'Uno Vivace', 'Mobi'],
    price: 549.00,
    pixDiscountPrice: 494.10,
    stock: 6,
    minStock: 2,
    isExpressDelivery: true,
    rating: 4.8,
    reviewsCount: 29,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
    description: 'Amortecedores pressurizados a gás de alta performance. Proporcionam estabilidade superior em curvas e curvas fechadas com absorção máxima de impactos urbanos.',
    specs: {
      'Tecnologia': 'Pressurizado Turbogás',
      'Lado': 'Par (Direito + Esquerdo)',
      'Fixação': 'Padrão original OEM',
      'Garantia': '2 anos Cofap'
    }
  },
  {
    id: 'kp-005',
    name: 'Kit Lâmpadas Super LED H7 Ultra Vision 6500K 12000LM',
    category: 'eletrica',
    brand: 'Philips Ultinon Pro',
    oemCode: 'PH-H7-6500K',
    vehicles: ['Universal H7 (Farol Baixo/Alto)', 'Civic', 'Golf', 'Cruze', 'Hilux', 'Corolla'],
    price: 199.90,
    pixDiscountPrice: 179.91,
    stock: 18,
    minStock: 5,
    isExpressDelivery: true,
    rating: 4.7,
    reviewsCount: 52,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
    description: 'Iluminação branca cristalina com corte de foco perfeito sem ofuscar outros motoristas. Dissipador de calor em alumínio de aviação com cooler silencioso.',
    specs: {
      'Encaixe': 'H7',
      'Temperatura de Cor': '6500K Branco Frio',
      'Luminosidade': '12.000 Lumens o par',
      'Voltagem': '12V / 24V Bivolt'
    }
  },
  {
    id: 'kp-006',
    name: 'Bomba de Combustível Refil Flex 3.0 Bar',
    category: 'motor',
    brand: 'Bosch Automotive',
    oemCode: 'F000TE159A',
    vehicles: ['GM Celta/Prisma 1.0/1.4', 'Corsa Flex', 'Montana', 'Astra 2.0 Flex'],
    price: 145.00,
    pixDiscountPrice: 130.50,
    stock: 11,
    minStock: 3,
    isExpressDelivery: true,
    rating: 4.9,
    reviewsCount: 41,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80',
    description: 'Refil de bomba Bosch 100% original compatível com etanol e gasolina. Pressão contínua estabilizada em 3.0 bar com vazão de 95 litros/hora.',
    specs: {
      'Pressão de trabalho': '3.0 Bar',
      'Combustível': 'Flex (Gasolina / Etanol)',
      'Vazão': '95 L/h',
      'Garantia': '12 meses Bosch'
    }
  },
  {
    id: 'kp-007',
    name: 'Disco de Freio Ventilado Dianteiro (Par)',
    category: 'freios',
    brand: 'Fremax Carbon+',
    oemCode: 'BD5298',
    vehicles: ['Renault Sandero/Logan 1.0/1.6', 'Duster 1.6', 'Oroch 1.6/2.0'],
    price: 279.90,
    pixDiscountPrice: 251.91,
    stock: 8,
    minStock: 3,
    isExpressDelivery: true,
    rating: 4.8,
    reviewsCount: 23,
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80',
    description: 'Discos com liga de alto teor de carbono (Hi-Carbon) para dissipação térmica superior e pintura protetora preta contra oxidação.',
    specs: {
      'Tipo': 'Ventilado',
      'Diâmetro Externo': '259 mm',
      'Furação': '4 Furos',
      'Garantia': '12 meses'
    }
  },
  {
    id: 'kp-008',
    name: 'Kit Filtros Revisão Completa (Óleo + Ar + Combustível + Cabine)',
    category: 'oleos',
    brand: 'Mann-Filter Original',
    oemCode: 'KIT-MANN-VW01',
    vehicles: ['VW Polo 1.0 TSI', 'Virtus TSI', 'T-Cross 1.0 200 TSI', 'Nivus 1.0 TSI'],
    price: 189.00,
    pixDiscountPrice: 170.10,
    stock: 19,
    minStock: 6,
    isExpressDelivery: true,
    rating: 5.0,
    reviewsCount: 77,
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&auto=format&fit=crop&q=80',
    description: 'Kit de revisão de 10.000km com 4 filtros alemães de qualidade original montadora. Retenção de 99.8% das impurezas do ar e combustível.',
    specs: {
      'Conteúdo': 'Filtro Óleo + Ar Motor + Combustível + Filtro Ar-Condicionado',
      'Montadora': 'Volkswagen MQB A0',
      'Norma': 'OEM Spec ISO 9001',
      'Garantia': '3 meses'
    }
  },
  {
    id: 'kp-009',
    name: 'Kit Terminal de Direção e Pivô de Suspensão',
    category: 'suspensao',
    brand: 'Nakata Peças',
    oemCode: 'N-99120',
    vehicles: ['Ford Ka 2014 a 2021', 'New Fiesta 1.5/1.6', 'EcoSport 1.6/2.0'],
    price: 159.00,
    pixDiscountPrice: 143.10,
    stock: 9,
    minStock: 2,
    isExpressDelivery: true,
    rating: 4.8,
    reviewsCount: 19,
    image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80',
    description: 'Articulações forjadas com vedação reforçada contra lama e água. Elimina folgas na direção e estalos ao manobrar.',
    specs: {
      'Composição': '2 Terminais + 2 Pivôs reforçados',
      'Fixação': 'Padrão original hidráulica/elétrica',
      'Garantia': '12 meses Nakata'
    }
  },
  {
    id: 'kp-010',
    name: 'Cera Líquida Automotiva Sintética Blend Ceramic & Carnaúba (500ml)',
    category: 'acessorios',
    brand: 'Vonixx Detailer',
    oemCode: 'VNX-BLEND-500',
    vehicles: ['Universal para todas as cores e tipos de pintura'],
    price: 89.90,
    pixDiscountPrice: 80.91,
    stock: 31,
    minStock: 8,
    isExpressDelivery: true,
    rating: 4.9,
    reviewsCount: 88,
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&auto=format&fit=crop&q=80',
    description: 'Combinação perfeita entre o brilho quente da carnaúba pura e a resistência da cerâmica SiO2. Hidrorrepelência de até 4 meses.',
    specs: {
      'Volume': '500 ml',
      'Proteção': 'Até 4 meses contra UV e chuva ácida',
      'Acompanha': '1 Aplicador de espuma especial',
      'Origem': 'Nacional'
    }
  }
];
