import { INITIAL_PRODUCTS } from '../data/mockProducts';
import { INITIAL_COURIERS } from '../data/mockCouriers';
import { INITIAL_ORDERS } from '../data/mockOrders';
import { INITIAL_STAFF } from '../data/mockUsers';
import { INITIAL_PARTNERS, INITIAL_PARTNER_REQUESTS } from '../data/mockPartners';

const STORAGE_KEYS = {
  PRODUCTS: 'kronopex_products',
  COURIERS: 'kronopex_couriers',
  ORDERS: 'kronopex_orders',
  STAFF: 'kronopex_staff',
  PARTNERS: 'kronopex_partners',
  PARTNER_REQUESTS: 'kronopex_partner_requests',
  CART: 'kronopex_cart',
  CURRENT_USER: 'kronopex_current_user',
  STORE_CONFIG: 'kronopex_store_config'
};

const DEFAULT_CONFIG = {
  storeName: 'KronoPex Auto Peças',
  slogan: 'A Peça Certa, no Tempo Certo.',
  whatsapp: '5511999998888',
  pixKey: 'pix@kronopex.com.br',
  pixName: 'KronoPex Auto Peças LTDA',
  freeDeliveryThreshold: 200.00,
  defaultDeliveryFee: 15.00,
  appwriteEndpoint: 'https://cloud.appwrite.io/v1',
  appwriteProjectId: '',
  appwriteDatabaseId: '',
  fcmVapidKey: '',
  googleAuthEnabled: true
};

export const StorageService = {
  getProducts: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts: (products) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    window.dispatchEvent(new Event('kronopex_products_updated'));
  },

  getCouriers: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COURIERS);
      return data ? JSON.parse(data) : INITIAL_COURIERS;
    } catch {
      return INITIAL_COURIERS;
    }
  },

  saveCouriers: (couriers) => {
    localStorage.setItem(STORAGE_KEYS.COURIERS, JSON.stringify(couriers));
    window.dispatchEvent(new Event('kronopex_couriers_updated'));
  },

  getOrders: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  },

  saveOrders: (orders) => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new Event('kronopex_orders_updated'));
  },

  createOrder: (newOrder) => {
    const orders = StorageService.getOrders();
    const updated = [newOrder, ...orders];
    StorageService.saveOrders(updated);

    // Automatically decrement product stock
    const products = StorageService.getProducts();
    const updatedProducts = products.map((prod) => {
      const item = newOrder.items.find((i) => i.id === prod.id);
      if (item) {
        return { ...prod, stock: Math.max(0, prod.stock - item.quantity) };
      }
      return prod;
    });
    StorageService.saveProducts(updatedProducts);

    return newOrder;
  },

  getStaff: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STAFF);
      return data ? JSON.parse(data) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  },

  saveStaff: (staff) => {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  },

  getCurrentUser: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getConfig: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STORE_CONFIG);
      return data ? { ...DEFAULT_CONFIG, ...JSON.parse(data) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  },

  saveConfig: (config) => {
    localStorage.setItem(STORAGE_KEYS.STORE_CONFIG, JSON.stringify(config));
  },

  getPartners: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PARTNERS);
      return data ? JSON.parse(data) : INITIAL_PARTNERS;
    } catch {
      return INITIAL_PARTNERS;
    }
  },

  savePartners: (partners) => {
    localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(partners));
    window.dispatchEvent(new Event('kronopex_partners_updated'));
  },

  getPartnerRequests: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PARTNER_REQUESTS);
      return data ? JSON.parse(data) : INITIAL_PARTNER_REQUESTS;
    } catch {
      return INITIAL_PARTNER_REQUESTS;
    }
  },

  savePartnerRequests: (requests) => {
    localStorage.setItem(STORAGE_KEYS.PARTNER_REQUESTS, JSON.stringify(requests));
    window.dispatchEvent(new Event('kronopex_partner_requests_updated'));
  },

  submitPartnerRequest: (requestData) => {
    const requests = StorageService.getPartnerRequests();
    const newRequest = {
      ...requestData,
      id: `req-${Date.now().toString().slice(-4)}`,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    StorageService.savePartnerRequests([newRequest, ...requests]);
    return newRequest;
  },

  approvePartner: (requestId, commissionRate = 12) => {
    const requests = StorageService.getPartnerRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return null;

    // Create active partner
    const partners = StorageService.getPartners();
    const newPartner = {
      id: `partner-${Date.now().toString().slice(-4)}`,
      companyName: req.companyName,
      tradeName: req.tradeName || req.companyName,
      cnpj: req.cnpj,
      contactName: req.contactName,
      email: req.email,
      phone: req.phone,
      city: req.city,
      commissionRate: Number(commissionRate) || 12,
      status: 'active',
      pixKey: req.pixKey || req.email,
      categories: req.categories || ['motor', 'freios'],
      approvedAt: new Date().toISOString(),
      metrics: {
        totalSold: 0,
        commissionRetained: 0,
        payoutDue: 0,
        activeProductsCount: 0
      }
    };

    StorageService.savePartners([newPartner, ...partners]);

    // Update request status
    const updatedRequests = requests.map((r) =>
      r.id === requestId ? { ...r, status: 'approved' } : r
    );
    StorageService.savePartnerRequests(updatedRequests);

    return newPartner;
  },

  rejectPartner: (requestId) => {
    const requests = StorageService.getPartnerRequests();
    const updated = requests.map((r) =>
      r.id === requestId ? { ...r, status: 'rejected' } : r
    );
    StorageService.savePartnerRequests(updated);
  },

  // Reset to initial state for demo testing
  resetDemoData: () => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.COURIERS, JSON.stringify(INITIAL_COURIERS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
    localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(INITIAL_PARTNERS));
    localStorage.setItem(STORAGE_KEYS.PARTNER_REQUESTS, JSON.stringify(INITIAL_PARTNER_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.STORE_CONFIG, JSON.stringify(DEFAULT_CONFIG));
    window.location.reload();
  }
};
