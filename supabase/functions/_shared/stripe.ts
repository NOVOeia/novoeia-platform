type CheckoutSessionParams = {
  stripeProductId: string;
  interval: 'month' | 'year';
  unitAmountCents: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
  customerEmail?: string;
};

function stripeSecretKey() {
  const secret = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secret) throw new Error('STRIPE_NOT_CONFIGURED');
  return secret;
}

export async function createStripeCheckoutSession(params: CheckoutSessionParams) {
  const body = new URLSearchParams();
  body.set('mode', 'subscription');
  body.set('line_items[0][quantity]', '1');
  body.set('line_items[0][price_data][currency]', params.currency.toLowerCase());
  body.set('line_items[0][price_data][product]', params.stripeProductId);
  body.set('line_items[0][price_data][unit_amount]', String(params.unitAmountCents));
  body.set('line_items[0][price_data][recurring][interval]', params.interval);
  body.set('success_url', params.successUrl);
  body.set('cancel_url', params.cancelUrl);

  if (params.customerEmail) {
    body.set('customer_email', params.customerEmail);
  }

  for (const [key, value] of Object.entries(params.metadata)) {
    body.set(`metadata[${key}]`, value);
  }

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.error?.message || `STRIPE_${response.status}`;
    throw new Error(`STRIPE_CHECKOUT:${message}`);
  }

  if (!payload?.url) throw new Error('STRIPE_CHECKOUT_URL_MISSING');
  return payload as { id: string; url: string };
}

export async function createStripePaymentLink(params: CheckoutSessionParams) {
  const body = new URLSearchParams();
  body.set('line_items[0][quantity]', '1');
  body.set('line_items[0][price_data][currency]', params.currency.toLowerCase());
  body.set('line_items[0][price_data][product]', params.stripeProductId);
  body.set('line_items[0][price_data][unit_amount]', String(params.unitAmountCents));
  body.set('line_items[0][price_data][recurring][interval]', params.interval);

  for (const [key, value] of Object.entries(params.metadata)) {
    body.set(`metadata[${key}]`, value);
  }

  const response = await fetch('https://api.stripe.com/v1/payment_links', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.error?.message || `STRIPE_${response.status}`;
    throw new Error(`STRIPE_PAYMENT_LINK:${message}`);
  }

  if (!payload?.url) throw new Error('STRIPE_PAYMENT_LINK_URL_MISSING');
  return payload as { id: string; url: string };
}
