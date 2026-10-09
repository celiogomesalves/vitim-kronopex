// Firebase Cloud Messaging (FCM) & Web Push Notification Service
export const FcmService = {
  requestPermission: async () => {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações de desktop.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      console.error('Erro ao solicitar permissão de notificação:', err);
      return false;
    }
  },

  sendLocalNotification: (title, options = {}) => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/logo.png',
          badge: '/logo.png',
          vibrate: [200, 100, 200],
          ...options
        });
      } catch (e) {
        console.warn('Erro ao disparar notificação local:', e);
      }
    }
  },

  notifyNewOrder: (order) => {
    FcmService.sendLocalNotification(`🚨 Novo Pedido KronoPex! #${order.id}`, {
      body: `Cliente: ${order.customer.name} - Total: R$ ${order.total.toFixed(2)} (${order.paymentMethod.toUpperCase()})`,
      tag: `order-${order.id}`
    });
  },

  notifyStatusUpdate: (order) => {
    const statusText = {
      preparing: 'Pedido em Separação no Estoque 📦',
      delivering: 'Saiu para Entrega Expressa! 🛵',
      delivered: 'Entregue com Sucesso! ✅'
    }[order.status] || 'Status atualizado';

    FcmService.sendLocalNotification(`KronoPex Delivery #${order.id}`, {
      body: statusText,
      tag: `status-${order.id}`
    });
  }
};
