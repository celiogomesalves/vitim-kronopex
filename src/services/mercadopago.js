import { StorageService } from './storage';

export const MercadoPagoService = {
  /**
   * Cria uma intenção de pagamento PIX dinâmico com QR Code oficial e Copia e Cola
   */
  createPixPayment: async ({ orderId, amount, customer }) => {
    const config = StorageService.getConfig();
    const token = config.mpAccessToken?.trim();

    // Se o lojista ainda não configurou o token do Mercado Pago, retorna fallback com chave manual
    if (!token) {
      return {
        isLiveGateway: false,
        qrCode: null,
        qrCodeBase64: null,
        pixKey: config.pixKey || 'pix@kronopex.com.br',
        instructions: 'Chave PIX manual para transferência e conferência pelo WhatsApp.'
      };
    }

    // Payload oficial Mercado Pago Payments API
    const payload = {
      transaction_amount: Number(amount.toFixed(2)),
      description: `Pedido ${orderId} - KronoPex Auto Peças`,
      payment_method_id: 'pix',
      payer: {
        email: customer.email || 'cliente@kronopex.com.br',
        first_name: customer.name ? customer.name.split(' ')[0] : 'Cliente',
        last_name: customer.name && customer.name.split(' ').length > 1
          ? customer.name.split(' ').slice(1).join(' ')
          : 'KronoPex',
        identification: {
          type: customer.cpf ? 'CPF' : 'CNPJ',
          number: (customer.cpf || customer.cnpj || '00000000000').replace(/\D/g, '')
        }
      },
      notification_url: typeof window !== 'undefined'
        ? `${window.location.origin}/api/mercadopago-webhook`
        : undefined
    };

    // 1. Tenta via endpoint serverless (/api/create-payment)
    try {
      const serverlessRes = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, orderId, accessToken: token })
      });

      if (serverlessRes.ok) {
        const data = await serverlessRes.json();
        return {
          isLiveGateway: true,
          paymentId: data.id,
          status: data.status,
          qrCode: data.point_of_interaction?.transaction_data?.qr_code,
          qrCodeBase64: data.point_of_interaction?.transaction_data?.qr_code_base64,
          ticketUrl: data.point_of_interaction?.transaction_data?.ticket_url
        };
      }
    } catch {
      // Continua para fallback da API REST direta
    }

    // 2. Chamada direta à API REST do Mercado Pago (com Idempotency Key)
    try {
      const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Idempotency-Key': `${orderId}-${Date.now()}`
        },
        body: JSON.stringify(payload)
      });

      if (!mpResponse.ok) {
        const errorData = await mpResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro Mercado Pago: ${mpResponse.status}`);
      }

      const paymentData = await mpResponse.json();
      return {
        isLiveGateway: true,
        paymentId: paymentData.id,
        status: paymentData.status, // 'pending' | 'approved'
        qrCode: paymentData.point_of_interaction?.transaction_data?.qr_code,
        qrCodeBase64: paymentData.point_of_interaction?.transaction_data?.qr_code_base64,
        ticketUrl: paymentData.point_of_interaction?.transaction_data?.ticket_url
      };
    } catch (err) {
      console.warn('[MercadoPago] Falha ao gerar PIX dinâmico:', err.message);
      // Fallback gracioso para não travar o cliente se houver erro de token/conexão
      return {
        isLiveGateway: false,
        qrCode: null,
        qrCodeBase64: null,
        pixKey: config.pixKey || 'pix@kronopex.com.br',
        error: err.message
      };
    }
  },

  /**
   * Consulta o status atual de uma transação
   */
  checkPaymentStatus: async (paymentId) => {
    const config = StorageService.getConfig();
    const token = config.mpAccessToken?.trim();
    if (!token || !paymentId) return null;

    try {
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        return {
          id: data.id,
          status: data.status, // 'approved', 'pending', 'rejected'
          statusDetail: data.status_detail
        };
      }
      return null;
    } catch {
      return null;
    }
  }
};
