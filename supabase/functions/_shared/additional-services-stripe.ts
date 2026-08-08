import { createStripePrice, createStripeProduct, updateStripeProduct } from './stripe.ts';

type AdditionalService = Record<string, unknown>;

function normalizeBillingType(billingType: unknown): 'one_time' | 'month' | 'year' {
  if (billingType === 'year') return 'year';
  if (billingType === 'month') return 'month';
  return 'one_time';
}

export async function syncAdditionalServiceToStripe(
  service: AdditionalService,
  partnerId: string,
  currency = 'USD',
): Promise<AdditionalService> {
  const title = String(service.title || '').trim();
  const price = Number(service.price || 0);
  const billingType = normalizeBillingType(service.billingType);
  const unitAmountCents = Math.round(price * 100);

  if (!title || unitAmountCents <= 0) {
    return service;
  }

  let stripeProductId = String(service.stripe_product_id || '');

  if (!stripeProductId) {
    const product = await createStripeProduct({
      name: title,
      description: String(service.description || '').trim() || undefined,
      metadata: {
        partner_id: partnerId,
        service_id: String(service.id || ''),
        type: 'partner_additional_service',
      },
    });
    stripeProductId = product.id;
  } else {
    await updateStripeProduct(stripeProductId, {
      name: title,
      description: String(service.description || '').trim() || undefined,
    });
  }

  const storedCents = Number(service.stripe_price_cents);
  const storedBilling = String(service.stripe_billing_type || '');
  let stripePriceId = String(service.stripe_price_id || '');

  if (!stripePriceId || storedCents !== unitAmountCents || storedBilling !== billingType) {
    const priceRecord = await createStripePrice({
      productId: stripeProductId,
      unitAmountCents,
      currency,
      billingType,
    });
    stripePriceId = priceRecord.id;
  }

  return {
    ...service,
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePriceId,
    stripe_price_cents: unitAmountCents,
    stripe_billing_type: billingType,
  };
}

export async function syncAdditionalServicesToStripe(
  services: AdditionalService[],
  partnerId: string,
  currency = 'USD',
): Promise<AdditionalService[]> {
  const synced: AdditionalService[] = [];

  for (const service of services) {
    synced.push(await syncAdditionalServiceToStripe(service, partnerId, currency));
  }

  return synced;
}
