// Serverless Webhook Handler: /api/mercadopago-webhook.js
export default async function handler(req, res) {
  // O Mercado Pago envia notificações via query string ou body
  const query = req.query || {};
  const topic = query.topic || query.type;
  const paymentId = query.id || query['data.id'] || req.body?.data?.id;

  console.log(`[MercadoPago Webhook] Notificação recebida: Topic=${topic}, PaymentId=${paymentId}`);

  // Responde status 200 imediatamente para o Mercado Pago confirmar entrega do webhook
  return res.status(200).json({ received: true, paymentId });
}
