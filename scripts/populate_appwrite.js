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
    console.error(`Error on ${method} ${path}:`, data.message || data);
  }
  return data;
}

const docPermissions = ['read("any")', 'update("any")', 'delete("any")'];

async function populate() {
  console.log('--- Populando Dados Iniciais no Appwrite com permissões corretas ---');

  // Categories
  for (const cat of INITIAL_CATEGORIES) {
    const id = cat.id.replace(/[^a-zA-Z0-9._-]/g, '_');
    await req(`/databases/${dbId}/collections/categories/documents`, 'POST', {
      documentId: id,
      data: { data: JSON.stringify(cat) },
      permissions: docPermissions
    });
  }
  console.log('✓ Categorias inseridas');

  // Products
  for (const prod of INITIAL_PRODUCTS) {
    const id = prod.id.replace(/[^a-zA-Z0-9._-]/g, '_');
    await req(`/databases/${dbId}/collections/products/documents`, 'POST', {
      documentId: id,
      data: { data: JSON.stringify(prod) },
      permissions: docPermissions
    });
  }
  console.log('✓ Produtos inseridos');

  // Payment Methods
  for (const pm of INITIAL_PAYMENT_METHODS) {
    const id = pm.id.replace(/[^a-zA-Z0-9._-]/g, '_');
    await req(`/databases/${dbId}/collections/payment_methods/documents`, 'POST', {
      documentId: id,
      data: { data: JSON.stringify(pm) },
      permissions: docPermissions
    });
  }
  console.log('✓ Formas de pagamento inseridas');

  // Couriers
  for (const c of INITIAL_COURIERS) {
    const id = c.id.replace(/[^a-zA-Z0-9._-]/g, '_');
    await req(`/databases/${dbId}/collections/couriers/documents`, 'POST', {
      documentId: id,
      data: { data: JSON.stringify(c) },
      permissions: docPermissions
    });
  }
  console.log('✓ Entregadores inseridos');

  // Orders
  for (const o of INITIAL_ORDERS) {
    const id = o.id.replace(/[^a-zA-Z0-9._-]/g, '_');
    await req(`/databases/${dbId}/collections/orders/documents`, 'POST', {
      documentId: id,
      data: { data: JSON.stringify(o) },
      permissions: docPermissions
    });
  }
  console.log('✓ Pedidos inseridos');

  // Staff
  for (const s of INITIAL_STAFF) {
    const id = s.id.replace(/[^a-zA-Z0-9._-]/g, '_');
    await req(`/databases/${dbId}/collections/staff/documents`, 'POST', {
      documentId: id,
      data: { data: JSON.stringify(s) },
      permissions: docPermissions
    });
  }
  console.log('✓ Equipe inserida');

  // Partners
  for (const p of INITIAL_PARTNERS) {
    const id = p.id.replace(/[^a-zA-Z0-9._-]/g, '_');
    await req(`/databases/${dbId}/collections/partners/documents`, 'POST', {
      documentId: id,
      data: { data: JSON.stringify(p) },
      permissions: docPermissions
    });
  }
  console.log('✓ Parceiros inseridos');

  // Partner Requests
  for (const pr of INITIAL_PARTNER_REQUESTS) {
    const id = pr.id.replace(/[^a-zA-Z0-9._-]/g, '_');
    await req(`/databases/${dbId}/collections/partner_requests/documents`, 'POST', {
      documentId: id,
      data: { data: JSON.stringify(pr) },
      permissions: docPermissions
    });
  }
  console.log('✓ Solicitações de parceiros inseridas');

  console.log('--- Concluído com sucesso absoluto! ---');
}

populate();
