import React, { useState, useEffect, useMemo } from 'react';
import { StorageService } from './services/storage';
import { FcmService } from './services/fcm';
import { Navbar } from './components/Navbar';
import { HeroShowcase } from './components/HeroShowcase';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductZoomModal } from './components/ProductZoomModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { Footer } from './components/Footer';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { PartnerApplicationModal } from './components/PartnerApplicationModal';
import { PartnerPortal } from './components/partner/PartnerPortal';
import './App.css';

export function App() {
  // Master Datasets
  const [products, setProducts] = useState(() => StorageService.getProducts());
  const [orders, setOrders] = useState(() => StorageService.getOrders());
  const [couriers, setCouriers] = useState(() => StorageService.getCouriers());
  const [staff, setStaff] = useState(() => StorageService.getStaff());
  const [partners, setPartners] = useState(() => StorageService.getPartners());
  const [partnerRequests, setPartnerRequests] = useState(() => StorageService.getPartnerRequests());
  const [config, setConfig] = useState(() => StorageService.getConfig());

  // Current session & view
  const [currentUser, setCurrentUser] = useState(() => StorageService.getCurrentUser());
  const [viewMode, setViewMode] = useState('store'); // 'store' | 'admin'

  // Storefront UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [zoomedProduct, setZoomedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  // Listen to Storage update events across components
  useEffect(() => {
    const handleProductsUpdated = () => {
      setProducts(StorageService.getProducts());
    };
    const handleOrdersUpdated = () => {
      setOrders(StorageService.getOrders());
    };
    const handleCouriersUpdated = () => {
      setCouriers(StorageService.getCouriers());
    };
    const handlePartnersUpdated = () => {
      setPartners(StorageService.getPartners());
    };
    const handlePartnerRequestsUpdated = () => {
      setPartnerRequests(StorageService.getPartnerRequests());
    };

    window.addEventListener('kronopex_products_updated', handleProductsUpdated);
    window.addEventListener('kronopex_orders_updated', handleOrdersUpdated);
    window.addEventListener('kronopex_couriers_updated', handleCouriersUpdated);
    window.addEventListener('kronopex_partners_updated', handlePartnersUpdated);
    window.addEventListener('kronopex_partner_requests_updated', handlePartnerRequestsUpdated);

    return () => {
      window.removeEventListener('kronopex_products_updated', handleProductsUpdated);
      window.removeEventListener('kronopex_orders_updated', handleOrdersUpdated);
      window.removeEventListener('kronopex_couriers_updated', handleCouriersUpdated);
      window.removeEventListener('kronopex_partners_updated', handlePartnersUpdated);
      window.removeEventListener('kronopex_partner_requests_updated', handlePartnerRequestsUpdated);
    };
  }, []);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const q = searchTerm.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesName = item.name.toLowerCase().includes(q);
      const matchesBrand = item.brand.toLowerCase().includes(q);
      const matchesOem = item.oemCode.toLowerCase().includes(q);
      const matchesVehicles = item.vehicles?.some((v) =>
        v.toLowerCase().includes(q)
      );

      return matchesCategory && (matchesName || matchesBrand || matchesOem || matchesVehicles);
    });
  }, [products, selectedCategory, searchTerm]);

  // Product counts per category
  const productCounts = useMemo(() => {
    const map = { all: products.length };
    products.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return map;
  }, [products]);

  // Cart operations
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          pixDiscountPrice: product.pixDiscountPrice,
          image: product.image,
          quantity: 1
        }
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, quantity } : i))
    );
  };

  const handleRemoveCartItem = (productId) => {
    setCart((prev) => prev.filter((i) => i.id !== productId));
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = (newOrder) => {
    StorageService.createOrder(newOrder);
    setOrders(StorageService.getOrders());
    setProducts(StorageService.getProducts());
    setCart([]);
    setIsCheckoutOpen(false);
    setCompletedOrder(newOrder);

    // Notify administrators of new incoming order
    FcmService.notifyNewOrder(newOrder);
  };

  // Admin access handler
  const handleOpenAdminPortal = () => {
    if (currentUser) {
      setViewMode('admin');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleLoginSuccess = (user) => {
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
    setViewMode('admin');
  };

  const handleLogoutAdmin = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    setViewMode('store');
  };

  const handleSaveProducts = (updated) => {
    StorageService.saveProducts(updated);
    setProducts(updated);
  };

  const handleSaveOrders = (updated) => {
    StorageService.saveOrders(updated);
    setOrders(updated);
  };

  const handleSaveCouriers = (updated) => {
    StorageService.saveCouriers(updated);
    setCouriers(updated);
  };

  const handleSaveStaff = (updated) => {
    StorageService.saveStaff(updated);
    setStaff(updated);
  };

  const handleSavePartners = (updated) => {
    StorageService.savePartners(updated);
    setPartners(updated);
  };

  const handleSubmitPartnerApplication = (requestData) => {
    StorageService.submitPartnerRequest(requestData);
    setPartnerRequests(StorageService.getPartnerRequests());
    FcmService.sendLocalNotification('🏢 Nova Solicitação de Parceria!', {
      body: `${requestData.companyName} enviou uma proposta para vender na loja!`,
      tag: 'new-partner-req'
    });
  };

  const handleApprovePartner = (requestId, commissionRate) => {
    StorageService.approvePartner(requestId, commissionRate);
    setPartners(StorageService.getPartners());
    setPartnerRequests(StorageService.getPartnerRequests());
    FcmService.sendLocalNotification('✅ Fornecedor Aprovado!', {
      body: `Novo parceiro homologado com ${commissionRate}% de comissão!`,
      tag: 'approved-partner'
    });
  };

  const handleRejectPartner = (requestId) => {
    StorageService.rejectPartner(requestId);
    setPartnerRequests(StorageService.getPartnerRequests());
  };

  const handleSaveConfig = (updated) => {
    StorageService.saveConfig(updated);
    setConfig(updated);
  };

  const handleOpenWhatsAppStore = () => {
    const phone = config?.whatsapp?.replace(/\D/g, '') || '5511999998888';
    window.open(
      `https://wa.me/${phone}?text=Olá KronoPex! Gostaria de consultar a disponibilidade de peças para o meu carro.`,
      '_blank'
    );
  };

  // View: Partner Portal (Dedicated supplier view)
  if (viewMode === 'admin' && currentUser?.role === 'partner') {
    return (
      <PartnerPortal
        partner={currentUser}
        onLogout={handleLogoutAdmin}
        onBackToStore={() => setViewMode('store')}
        products={products}
        onSaveProducts={handleSaveProducts}
      />
    );
  }

  // View: Admin Panel
  if (viewMode === 'admin' && currentUser) {
    return (
      <AdminLayout
        currentUser={currentUser}
        onLogout={handleLogoutAdmin}
        onBackToStore={() => setViewMode('store')}
        products={products}
        onSaveProducts={handleSaveProducts}
        orders={orders}
        onSaveOrders={handleSaveOrders}
        couriers={couriers}
        onSaveCouriers={handleSaveCouriers}
        staff={staff}
        onSaveStaff={handleSaveStaff}
        partners={partners}
        onSavePartners={handleSavePartners}
        partnerRequests={partnerRequests}
        onApprovePartner={handleApprovePartner}
        onRejectPartner={handleRejectPartner}
        config={config}
        onSaveConfig={handleSaveConfig}
      />
    );
  }

  // View: Customer Storefront Vitrine
  const totalCartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="store-app-wrapper">
      {/* Store Navigation Bar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={handleOpenAdminPortal}
        onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
        currentUser={currentUser}
      />

      {/* Hero Storefront Showcase */}
      <HeroShowcase
        onSelectCategory={(catId) => setSelectedCategory(catId)}
        onWhatsAppClick={handleOpenWhatsAppStore}
      />

      {/* Category Aisles & Shelves Filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        productCounts={productCounts}
      />

      {/* Main Products Vitrine Section */}
      <main className="products-section container">
        <div className="vitrine-header-row flex-between">
          <div>
            <h2 className="text-xl font-bold text-main">
              {selectedCategory === 'all'
                ? 'Todas as Peças da Vitrine'
                : `Peças em ${selectedCategory.toUpperCase()}`}
            </h2>
            <span className="text-xs text-muted">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'peça encontrada' : 'peças encontradas'}
            </span>
          </div>

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-cyan hover-underline"
            >
              Limpar busca "{searchTerm}"
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="glass-panel text-center py-12 my-6">
            <h3 className="font-bold text-base mb-1">Nenhuma peça encontrada</h3>
            <p className="text-xs text-muted mb-4">
              Tente buscar por outro modelo de veículo, código OEM ou selecione outra prateleira.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="btn btn-secondary text-xs"
            >
              Exibir Todas as Peças
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const inCart = cart.find((i) => i.id === product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenZoom={(p) => setZoomedProduct(p)}
                  onAddToCart={handleAddToCart}
                  cartQuantity={inCart ? inCart.quantity : 0}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Interactive Product Zoom Modal */}
      {zoomedProduct && (
        <ProductZoomModal
          product={zoomedProduct}
          onClose={() => setZoomedProduct(null)}
          onAddToCart={handleAddToCart}
          cartQuantity={
            cart.find((i) => i.id === zoomedProduct.id)?.quantity || 0
          }
        />
      )}

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
        freeDeliveryThreshold={config.freeDeliveryThreshold}
      />

      {/* Direct Frictionless Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onOrderCompleted={handleOrderCompleted}
        config={config}
      />

      {/* Order Confirmed & WhatsApp Dispatch Modal */}
      {completedOrder && (
        <OrderSuccessModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
          config={config}
        />
      )}

      {/* Admin Login & Profile Switcher Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Partner Application Modal (Marketplace Onboarding) */}
      <PartnerApplicationModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        onSubmitApplication={handleSubmitPartnerApplication}
      />

      {/* Footer */}
      <Footer
        onOpenAdmin={handleOpenAdminPortal}
        onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
        currentUser={currentUser}
      />
    </div>
  );
}

export default App;
