import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../src/data/mockProducts.js';
import { INITIAL_COURIERS } from '../src/data/mockCouriers.js';
import { INITIAL_ORDERS } from '../src/data/mockOrders.js';
import { INITIAL_STAFF } from '../src/data/mockUsers.js';
import { INITIAL_PARTNERS, INITIAL_PARTNER_REQUESTS } from '../src/data/mockPartners.js';
import { INITIAL_PAYMENT_METHODS } from '../src/data/mockPaymentMethods.js';

const endpoint = 'https://appwrite.agenc-ia.net/v1';
const project = '6acb990e000fac38ac2f';
const key = 'standard_562f9f3a5a3c5e7661b9ae0d2650e9a69c63b06ea64390139407a1ad3f204d51d961cd8f49e62978a494f963aaac8271328596ee5d980668ae204ecb7d31a6a7491fe29ccd6af001fcb23a07685ca94d40443fab248347c809f0a812e8410ad4c2b16f27e78e5d6aa632cd3132ee641264b32405cb95b7caddefe586df0a8288';
const dbId = 'kronopex_main';

async function req(path, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': project,
      'X-Appwrite-Key': key
    }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`${endpoint}${path}`, options);
  const data = await res.json();
  if (!res.ok) {
    console.error(`Error on ${method} ${path}:`, data);
  }
  return data;
}

async function setup() {
  console.log('--- Configurando Bucket de Arquivos ---');
  await req('/storage/buckets', 'POST', {
    bucketId: 'kronopex_storage',
    name: 'KronoPex Storage',
    permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")'],
    fileSecurity: false,
    enabled: true,
    maximumFileSize: 10485760,
    allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif']
  });

  const collections = [
    { id: 'products', name: 'Products' },
    { id: 'categories', name: 'Categories' },
    { id: 'payment_methods', name: 'Payment Methods' },
    { id: 'couriers', name: 'Couriers' },
    { id: 'orders', name: 'Orders' },
    { id: 'staff', name: 'Staff' },
    { id: 'partners', name: 'Partners' },
    { id: 'partner_requests', name: 'Partner Requests' },
    { id: 'store_config', name: 'Store Config' }
  ];

  for (const col of collections) {
    console.log(`Criando collection ${col.id}...`);
    await req(`/databases/${dbId}/collections`, 'POST', {
      collectionId: col.id,
      name: col.name,
      permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")'],
      documentSecurity: false,
      enabled: true
    });

    console.log(`Criando atributo data em ${col.id}...`);
    await req(`/databases/${dbId}/collections/${col.id}/attributes/string`, 'POST', {
      key: 'data',
      size: 1000000,
      required: true
    });
  }

  console.log('Aguardando 3 segundos para atributos ficarem disponíveis...');
  await new Promise(r => setTimeout(r, 3000));

  console.log('--- Populando Dados Iniciais ---');

  // Categories
  for (const cat of INITIAL_CATEGORIES) {
    await req(`/databases/${dbId}/collections/categories/documents`, 'POST', {
      documentId: cat.id.replace(/[^a-zA-Z0-9._-]/g, '_'),
      data: { data: JSON.stringify(cat) },
      permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")']
    });
  }
  console.log('Categorias inseridas.');

  // Products
  for (const prod of INITIAL_PRODUCTS) {
    await req(`/databases/${dbId}/collections/products/documents`, 'POST', {
      documentId: prod.id.replace(/[^a-zA-Z0-9._-]/g, '_'),
      data: { data: JSON.stringify(prod) },
      permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")']
    });
  }
  console.log('Produtos inseridos.');

  // Payment Methods
  for (const pm of INITIAL_PAYMENT_METHODS) {
    await req(`/databases/${dbId}/collections/payment_methods/documents`, 'POST', {
      documentId: pm.id.replace(/[^a-zA-Z0-9._-]/g, '_'),
      data: { data: JSON.stringify(pm) },
      permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")']
    });
  }
  console.log('Formas de pagamento inseridas.');

  // Couriers
  for (const c of INITIAL_COURIERS) {
    await req(`/databases/${dbId}/collections/couriers/documents`, 'POST', {
      documentId: c.id.replace(/[^a-zA-Z0-9._-]/g, '_'),
      data: { data: JSON.stringify(c) },
      permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")']
    });
  }
  console.log('Entregadores inseridos.');

  // Orders
  for (const o of INITIAL_ORDERS) {
    await req(`/databases/${dbId}/collections/orders/documents`, 'POST', {
      documentId: o.id.replace(/[^a-zA-Z0-9._-]/g, '_'),
      data: { data: JSON.stringify(o) },
      permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")']
    });
  }
  console.log('Pedidos inseridos.');

  // Staff
  for (const s of INITIAL_STAFF) {
    await req(`/databases/${dbId}/collections/staff/documents`, 'POST', {
      documentId: s.id.replace(/[^a-zA-Z0-9._-]/g, '_'),
      data: { data: JSON.stringify(s) },
      permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")']
    });
  }
  console.log('Equipe inserida.');

  // Partners
  for (const p of INITIAL_PARTNERS) {
    await req(`/databases/${dbId}/collections/partners/documents`, 'POST', {
      documentId: p.id.replace(/[^a-zA-Z0-9._-]/g, '_'),
      data: { data: JSON.stringify(p) },
      permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")']
    });
  }
  console.log('Parceiros inseridos.');

  // Partner Requests
  for (const pr of INITIAL_PARTNER_REQUESTS) {
    await req(`/databases/${dbId}/collections/partner_requests/documents`, 'POST', {
      documentId: pr.id.replace(/[^a-zA-Z0-9._-]/g, '_'),
      data: { data: JSON.stringify(pr) },
      permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")']
    });
  }
  console.log('Solicitações de parceiros inseridas.');

  console.log('--- Configuração concluída com sucesso! ---');
}

setup();
