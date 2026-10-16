import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StorageService } from './services/storage';
import { AppwriteService } from './services/appwrite';
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
import { InitialAdminSetup } from './components/admin/InitialAdminSetup';
import { PartnerApplicationModal } from './components/PartnerApplicationModal';
import { PartnerPortal } from './components/partner/PartnerPortal';
import { PwaInstallBanner } from './components/mobile/PwaInstallBanner';
import { MobileBottomBar } from './components/mobile/MobileBottomBar';
import './App.css';

export function App() {
  // Master Datasets
  const [products, setProducts] = useState(() => StorageService.getProducts());
  const [categories, setCategories] = useState(() => StorageService.getCategories());
  const [paymentMethods, setPaymentMethods] = useState(() => StorageService.getPaymentMethods());
  const [orders, setOrders] = useState(() => StorageService.getOrders());
  const [couriers, setCouriers] = useState(() => StorageService.getCouriers());
  const [staff, setStaff] = useState(() => StorageService.getStaff());
  const [partners, setPartners] = useState(() => StorageService.getPartners());
  const [partnerRequests, setPartnerRequests] = useState(() => StorageService.getPartnerRequests());
  const [config, setConfig] = useState(() => StorageService.getConfig());

  // Current session & view
  const [currentUser, setCurrentUser] = useState(() => StorageService.getCurrentUser());
  const [viewMode, setViewMode] = useState('store'); // 'store' | 'admin'
  const [recoveryParams, setRecoveryParams] = useState(null);

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if any modal or drawer is active
  const isAnyModalOpen = Boolean(
    isCartOpen ||
    isCheckoutOpen ||
    zoomedProduct ||
    completedOrder ||
    isAdminLoginOpen ||
    isPartnerModalOpen ||
    isMobileMenuOpen
  );

  // Close all open modals & drawers
  const closeAllModals = (popHistory = true) => {
    const wasOpen = isAnyModalOpen;
    setIsMobileMenuOpen(false);
    setZoomedProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    setCompletedOrder(null);
    setIsAdminLoginOpen(false);
    setIsPartnerModalOpen(false);

    if (wasOpen && popHistory && window.history.state?.kronopexModal) {
      window.history.back();
    }
  };

  // Push state to browser history whenever any modal opens
  const prevModalStateRef = useRef(false);
  useEffect(() => {
    if (isAnyModalOpen && !prevModalStateRef.current) {
      window.history.pushState({ kronopexModal: true }, '');
    }
    prevModalStateRef.current = isAnyModalOpen;
  }, [isAnyModalOpen]);

  // Listen to popstate (Device Back button or Browser Back button)
  useEffect(() => {
    const handlePopState = () => {
      if (isAnyModalOpen) {
        closeAllModals(false);
      } else if (viewMode === 'admin') {
        setViewMode('store');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAnyModalOpen, viewMode]);

  // Lock body scroll whenever ANY modal or mobile menu drawer is open
  useEffect(() => {
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      return () => {
        document.body.style.overflow = originalOverflow || '';
        document.body.style.touchAction = originalTouchAction || '';
      };
    }
  }, [isAnyModalOpen]);

  // Listen to Storage update events across components
  useEffect(() => {
    const handleProductsUpdated = () => {
      setProducts(StorageService.getProducts());
    };
    const handleCategoriesUpdated = () => {
      setCategories(StorageService.getCategories());
    };
    const handlePaymentsUpdated = () => {
      setPaymentMethods(StorageService.getPaymentMethods());
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
    window.addEventListener('kronopex_categories_updated', handleCategoriesUpdated);
    window.addEventListener('kronopex_payments_updated', handlePaymentsUpdated);
    window.addEventListener('kronopex_orders_updated', handleOrdersUpdated);
    window.addEventListener('kronopex_couriers_updated', handleCouriersUpdated);
    window.addEventListener('kronopex_partners_updated', handlePartnersUpdated);
    window.addEventListener('kronopex_partner_requests_updated', handlePartnerRequestsUpdated);

    // Checagem de link de recuperação de senha enviado pelo Appwrite
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const secret = urlParams.get('secret');
    if (userId && secret) {
      setRecoveryParams({ userId, secret });
      setIsAdminLoginOpen(true);
    }

    // Checagem de retorno do Google OAuth para Setup Inicial do Administrador Master
    AppwriteService.getCurrentUser().then((authUser) => {
      if (authUser && localStorage.getItem('kronopex_pending_master_setup') === 'true') {
        localStorage.removeItem('kronopex_pending_master_setup');
        const masterAdmin = {
          id: authUser.$id,
          name: authUser.name || authUser.email.split('@')[0],
          email: authUser.email.toLowerCase(),
          role: 'admin',
          roleName: 'Administrador Master',
          status: 'active',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.name || authUser.email)}&background=00d2ff&color=050d1a&bold=true`,
          permissions: ['all'],
          createdAt: new Date().toISOString()
        };
        StorageService.saveStaff([masterAdmin]);
        StorageService.setCurrentUser(masterAdmin);
        setStaff([masterAdmin]);
        setCurrentUser(masterAdmin);
        setViewMode('admin');
      }
    }).catch(() => {});

    // Sincronização automática em tempo real com Appwrite Cloud / Self-hosted
    const syncFromAppwrite = async () => {
      try {
        const [remoteProducts, remoteCategories, remotePayments, remoteCouriers, remoteOrders, remoteStaff, remotePartners, remoteRequests] = await Promise.all([
          AppwriteService.listDocuments('products'),
          AppwriteService.listDocuments('categories'),
          AppwriteService.listDocuments('payment_methods'),
          AppwriteService.listDocuments('couriers'),
          AppwriteService.listDocuments('orders'),
          AppwriteService.listDocuments('staff'),
          AppwriteService.listDocuments('partners'),
          AppwriteService.listDocuments('partner_requests')
        ]);

        if (remoteProducts && remoteProducts.length > 0) {
          StorageService.saveProducts(remoteProducts);
          setProducts(remoteProducts);
        }
        if (remoteCategories && remoteCategories.length > 0) {
          StorageService.saveCategories(remoteCategories);
          setCategories(remoteCategories);
        }
        if (remotePayments && remotePayments.length > 0) {
          StorageService.savePaymentMethods(remotePayments);
          setPaymentMethods(remotePayments);
        }
        if (remoteCouriers && remoteCouriers.length > 0) {
          StorageService.saveCouriers(remoteCouriers);
          setCouriers(remoteCouriers);
        }
        if (remoteOrders && remoteOrders.length > 0) {
          StorageService.saveOrders(remoteOrders);
          setOrders(remoteOrders);
        }
        if (remoteStaff && remoteStaff.length > 0) {
          StorageService.saveStaff(remoteStaff);
          setStaff(remoteStaff);
        }
        if (remotePartners && remotePartners.length > 0) {
          StorageService.savePartners(remotePartners);
          setPartners(remotePartners);
        }
        if (remoteRequests && remoteRequests.length > 0) {
          StorageService.savePartnerRequests(remoteRequests);
          setPartnerRequests(remoteRequests);
        }
      } catch (err) {
        console.warn('Sincronização em segundo plano Appwrite:', err);
      }
    };

    syncFromAppwrite();

    return () => {
      window.removeEventListener('kronopex_products_updated', handleProductsUpdated);
      window.removeEventListener('kronopex_categories_updated', handleCategoriesUpdated);
      window.removeEventListener('kronopex_payments_updated', handlePaymentsUpdated);
      window.removeEventListener('kronopex_orders_updated', handleOrdersUpdated);
      window.removeEventListener('kronopex_couriers_updated', handleCouriersUpdated);
      window.removeEventListener('kronopex_partners_updated', handlePartnersUpdated);
      window.removeEventListener('kronopex_partner_requests_updated', handlePartnerRequestsUpdated);
    };
  }, []);

  // Produtos aprovados para a vitrine pública (loja própria ou homologados e aprovados pelo admin)
  const approvedProducts = useMemo(() => {
    return products.filter((item) => !item.partnerId || item.approvalStatus === 'approved');
  }, [products]);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return approvedProducts.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const q = searchTerm.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesName = item.name.toLowerCase().includes(q);
      const matchesBrand = item.brand.toLowerCase().includes(q);
      const matchesOem = item.oemCode?.toLowerCase().includes(q);
      const matchesVehicles = item.vehicles?.some((v) =>
        v.toLowerCase().includes(q)
      );

      return matchesCategory && (matchesName || matchesBrand || matchesOem || matchesVehicles);
    });
  }, [approvedProducts, selectedCategory, searchTerm]);

  // Product counts per category
  const productCounts = useMemo(() => {
    const map = { all: approvedProducts.length };
    approvedProducts.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return map;
  }, [approvedProducts]);

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

  const handleLogoutAdmin = async () => {
    try {
      await AppwriteService.logout();
    } catch {
      // Ignora erro se não houver sessão ativa
    }
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    setViewMode('store');
  };

  const handleSaveProducts = (updated) => {
    StorageService.saveProducts(updated);
    setProducts(updated);
  };

  const handleSaveCategories = (updated) => {
    StorageService.saveCategories(updated);
    setCategories(updated);
  };

  const handleSavePaymentMethods = (updated) => {
    StorageService.savePaymentMethods(updated);
    setPaymentMethods(updated);
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

  const handleFocusSearch = () => {
    const input = document.getElementById('main-mobile-search-input') || document.querySelector('.search-input');
    if (input) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        input.focus();
      }, 200);
    }
  };

  const handleScrollToCategories = () => {
    const el = document.querySelector('.category-filter-wrapper');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Regra de Bloqueio do Sistema: Se não houver administrador cadastrado, a vitrine fica indisponível para usuários comuns
  if (staff.length === 0) {
    return (
      <InitialAdminSetup
        onSetupComplete={(masterAdmin) => {
          setStaff([masterAdmin]);
          setCurrentUser(masterAdmin);
          setViewMode('admin');
        }}
      />
    );
  }

  // View: Partner Portal (Dedicated supplier view)
  if (viewMode === 'admin' && currentUser?.role === 'partner') {
    return (
      <PartnerPortal
        partner={currentUser}
        onLogout={handleLogoutAdmin}
        onBackToStore={() => setViewMode('store')}
        products={products}
        onSaveProducts={handleSaveProducts}
        categories={categories}
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
        categories={categories}
        onSaveCategories={handleSaveCategories}
        paymentMethods={paymentMethods}
        onSavePaymentMethods={handleSavePaymentMethods}
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
      {/* Ambient Cyber Light System */}
      <div className="bg-ambient-lights" aria-hidden="true">
        <div className="grid-bg-overlay"></div>
        <div className="ambient-orb-top"></div>
        <div className="ambient-orb-bottom"></div>
      </div>

      {/* PWA Install Mobile Prompt */}
      <PwaInstallBanner />

      {/* Store Navigation Bar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={handleOpenAdminPortal}
        onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
        currentUser={currentUser}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
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
        categories={categories}
      />

      {/* Main Products Vitrine Section */}
      <main className="products-section container">
        <div className="vitrine-header-row flex-between mb-4">
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
        paymentMethods={paymentMethods}
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
        onClose={() => {
          setIsAdminLoginOpen(false);
          setRecoveryParams(null);
        }}
        onLoginSuccess={handleLoginSuccess}
        recoveryParams={recoveryParams}
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

      {/* Sticky Bottom Navigation for Mobile Devices */}
      <MobileBottomBar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onFocusSearch={handleFocusSearch}
        onScrollToCategories={handleScrollToCategories}
        onOpenWhatsApp={handleOpenWhatsAppStore}
        onCloseAllModals={closeAllModals}
      />
    </div>
  );
}

export default App;
