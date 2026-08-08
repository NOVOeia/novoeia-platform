type CheckoutSessionParams = {
  stripeProductId: string;
  interval: 'month' | 'year';
  unitAmountCents: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
  customerEmail?: string;
  embedded?: boolean;
  returnUrl?: string;
  additionalLineItems?: Array<{
    name: string;
    unitAmountCents: number;
    currency: string;
    billingType?: 'one_time' | 'month' | 'year';
    stripePriceId?: string;
    bundledAsOneTime?: boolean;
  }>;
  /** @deprecated use additionalLineItems */
  oneTimeLineItems?: Array<{
    name: string;
    unitAmountCents: number;
    currency: string;
  }>;
};

function stripeSecretKey() {
  const secret = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secret) throw new Error('STRIPE_NOT_CONFIGURED');
  return secret;
}

async function stripeRequest(path: string, method: string, body?: URLSearchParams) {
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${stripeSecretKey()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.error?.message || `STRIPE_${response.status}`;
    throw new Error(`STRIPE_${message}`);
  }

  return payload;
}

export async function createStripeProduct(params: {
  name: string;
  description?: string;
  metadata?: Record<string, string>;
}) {
  const body = new URLSearchParams();
  body.set('name', params.name);
  if (params.description) body.set('description', params.description);
  for (const [key, value] of Object.entries(params.metadata || {})) {
    body.set(`metadata[${key}]`, value);
  }
  return stripeRequest('/products', 'POST', body) as Promise<{ id: string }>;
}

export async function updateStripeProduct(
  productId: string,
  params: { name?: string; description?: string },
) {
  const body = new URLSearchParams();
  if (params.name) body.set('name', params.name);
  if (params.description !== undefined) body.set('description', params.description);
  return stripeRequest(`/products/${productId}`, 'POST', body) as Promise<{ id: string }>;
}

export async function createStripePrice(params: {
  productId: string;
  unitAmountCents: number;
  currency: string;
  billingType?: 'one_time' | 'month' | 'year';
}) {
  const body = new URLSearchParams();
  body.set('product', params.productId);
  body.set('unit_amount', String(params.unitAmountCents));
  body.set('currency', params.currency.toLowerCase());
  if (params.billingType && params.billingType !== 'one_time') {
    body.set('recurring[interval]', params.billingType);
  }
  return stripeRequest('/prices', 'POST', body) as Promise<{ id: string }>;
}

export async function createStripeCheckoutSession(params: CheckoutSessionParams) {
  const body = new URLSearchParams();
  body.set('mode', 'subscription');
  body.set('line_items[0][quantity]', '1');
  body.set('line_items[0][price_data][currency]', params.currency.toLowerCase());
  body.set('line_items[0][price_data][product]', params.stripeProductId);
  body.set('line_items[0][price_data][unit_amount]', String(params.unitAmountCents));
  body.set('line_items[0][price_data][recurring][interval]', params.interval);

  if (params.embedded) {
    body.set('ui_mode', 'embedded');
    body.set('return_url', params.returnUrl || params.successUrl);
  } else {
    body.set('success_url', params.successUrl);
    body.set('cancel_url', params.cancelUrl);
  }

  if (params.customerEmail) {
    body.set('customer_email', params.customerEmail);
  }

  for (const [key, value] of Object.entries(params.metadata)) {
    body.set(`metadata[${key}]`, value);
    body.set(`subscription_data[metadata][${key}]`, value);
  }

  const extraLineItems = params.additionalLineItems?.length
    ? params.additionalLineItems
    : (params.oneTimeLineItems || []).map(item => ({
      ...item,
      billingType: 'one_time' as const,
    }));

  extraLineItems.forEach((item, index) => {
    const lineIndex = index + 1;
    const billingType = item.billingType || 'one_time';
    body.set(`line_items[${lineIndex}][quantity]`, '1');

    if (item.stripePriceId && !item.bundledAsOneTime) {
      body.set(`line_items[${lineIndex}][price]`, item.stripePriceId);
      return;
    }

    body.set(`line_items[${lineIndex}][price_data][currency]`, item.currency.toLowerCase());
    body.set(`line_items[${lineIndex}][price_data][product_data][name]`, item.name);
    body.set(`line_items[${lineIndex}][price_data][unit_amount]`, String(item.unitAmountCents));
    if (billingType !== 'one_time') {
      body.set(`line_items[${lineIndex}][price_data][recurring][interval]`, billingType);
    }
  });

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

  if (!payload?.id) throw new Error('STRIPE_CHECKOUT_ID_MISSING');
  if (params.embedded) {
    if (!payload?.client_secret) throw new Error('STRIPE_CLIENT_SECRET_MISSING');
    return payload as { id: string; client_secret: string };
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
