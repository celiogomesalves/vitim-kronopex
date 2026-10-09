import { INITIAL_PRODUCTS } from '../data/mockProducts';
import { INITIAL_COURIERS } from '../data/mockCouriers';
import { INITIAL_ORDERS } from '../data/mockOrders';
import { INITIAL_STAFF } from '../data/mockUsers';

const STORAGE_KEYS = {
  PRODUCTS: 'kronopex_products',
  COURIERS: 'kronopex_couriers',
  ORDERS: 'kronopex_orders',
  STAFF: 'kronopex_staff',
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

  // Reset to initial state for demo testing
  resetDemoData: () => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.COURIERS, JSON.stringify(INITIAL_COURIERS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
    localStorage.setItem(STORAGE_KEYS.STORE_CONFIG, JSON.stringify(DEFAULT_CONFIG));
    window.location.reload();
  }
};
