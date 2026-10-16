// Serverless Function para Vercel: /api/create-payment.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    transaction_amount,
    description,
    payment_method_id = 'pix',
    payer,
    orderId,
    accessToken
  } = req.body;

  // Usa o token vindo da configuração do painel ou variável de ambiente da Vercel
  const token = accessToken || process.env.MP_ACCESS_TOKEN;

  if (!token) {
    return res.status(400).json({
      error: 'Token do Mercado Pago não configurado. Adicione no painel administrativo do KronoPex ou em MP_ACCESS_TOKEN.'
    });
  }

  try {
    const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Idempotency-Key': `${orderId || Date.now()}-${Date.now()}`
      },
      body: JSON.stringify({
        transaction_amount,
        description: description || `Pedido KronoPex Auto Peças`,
        payment_method_id,
        payer
      })
    });

    const data = await mpRes.json();

    if (!mpRes.ok) {
      return res.status(mpRes.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Erro na função serverless do Mercado Pago:', err);
    return res.status(500).json({ error: err.message || 'Erro interno do servidor' });
  }
}
