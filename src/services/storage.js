import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../data/mockProducts';
import { INITIAL_COURIERS } from '../data/mockCouriers';
import { INITIAL_ORDERS } from '../data/mockOrders';
import { INITIAL_STAFF } from '../data/mockUsers';
import { INITIAL_PARTNERS, INITIAL_PARTNER_REQUESTS } from '../data/mockPartners';
import { INITIAL_PAYMENT_METHODS } from '../data/mockPaymentMethods';
import { AppwriteService } from './appwrite';

const STORAGE_KEYS = {
  PRODUCTS: 'kronopex_products',
  CATEGORIES: 'kronopex_categories',
  PAYMENT_METHODS: 'kronopex_payment_methods',
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
  appwriteEndpoint: 'https://appwrite.agenc-ia.net/v1',
  appwriteProjectId: '6acb990e000fac38ac2f',
  appwriteDatabaseId: 'kronopex_main',
  appwriteBucketId: 'kronopex_storage',
  fcmVapidKey: '',
  googleAuthEnabled: true
};

export const StorageService = {
  getProducts: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const list = data ? JSON.parse(data) : INITIAL_PRODUCTS;
      // Normaliza approvalStatus para produtos existentes da loja
      return list.map((p) => ({
        ...p,
        approvalStatus: p.approvalStatus || 'approved'
      }));
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts: (products) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    window.dispatchEvent(new Event('kronopex_products_updated'));
    // Persistência assíncrona no Appwrite
    products.forEach((p) => {
      AppwriteService.saveDocument('products', p.id, p).catch(() => {});
    });
  },

  approveProduct: (productId) => {
    const products = StorageService.getProducts();
    const updated = products.map((p) =>
      p.id === productId ? { ...p, approvalStatus: 'approved' } : p
    );
    StorageService.saveProducts(updated);
    return updated;
  },

  rejectProduct: (productId) => {
    const products = StorageService.getProducts();
    const updated = products.map((p) =>
      p.id === productId ? { ...p, approvalStatus: 'rejected' } : p
    );
    StorageService.saveProducts(updated);
    return updated;
  },

  getCategories: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  },

  saveCategories: (categories) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    window.dispatchEvent(new Event('kronopex_categories_updated'));
    categories.forEach((c) => {
      AppwriteService.saveDocument('categories', c.id, c).catch(() => {});
    });
  },

  getPaymentMethods: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
      return data ? JSON.parse(data) : INITIAL_PAYMENT_METHODS;
    } catch {
      return INITIAL_PAYMENT_METHODS;
    }
  },

  savePaymentMethods: (methods) => {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(methods));
    window.dispatchEvent(new Event('kronopex_payments_updated'));
    methods.forEach((pm) => {
      AppwriteService.saveDocument('payment_methods', pm.id, pm).catch(() => {});
    });
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
    couriers.forEach((c) => {
      AppwriteService.saveDocument('couriers', c.id, c).catch(() => {});
    });
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
    orders.forEach((o) => {
      AppwriteService.saveDocument('orders', o.id, o).catch(() => {});
    });
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
    window.dispatchEvent(new Event('kronopex_staff_updated'));
    staff.forEach((s) => {
      AppwriteService.saveDocument('staff', s.id, s).catch(() => {});
    });
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
    window.dispatchEvent(new Event('kronopex_config_updated'));
    AppwriteService.saveDocument('store_config', 'main_config', config).catch(() => {});
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
    partners.forEach((p) => {
      AppwriteService.saveDocument('partners', p.id, p).catch(() => {});
    });
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
    requests.forEach((r) => {
      AppwriteService.saveDocument('partner_requests', r.id, r).catch(() => {});
    });
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
      canUploadProducts: true,
      requiresApproval: true, // Fornecedores autorizados precisam de aprovação antes de expor na vitrine
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
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(INITIAL_PAYMENT_METHODS));
    localStorage.setItem(STORAGE_KEYS.COURIERS, JSON.stringify(INITIAL_COURIERS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
    localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(INITIAL_PARTNERS));
    localStorage.setItem(STORAGE_KEYS.PARTNER_REQUESTS, JSON.stringify(INITIAL_PARTNER_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.STORE_CONFIG, JSON.stringify(DEFAULT_CONFIG));
    window.location.reload();
  }
};
