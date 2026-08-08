import type Stripe from 'https://esm.sh/stripe@17.7.0?target=deno';
import { adminClient } from './core.ts';

function serviceBillingInterval(billingType: unknown): 'one_time' | 'month' | 'year' {
  if (billingType === 'year') return 'year';
  if (billingType === 'month') return 'month';
  return 'one_time';
}

function deferredAddonTrialDays(billingType: unknown): number {
  return serviceBillingInterval(billingType) === 'year' ? 365 : 30;
}

function isDeferredAddonService(
  service: Record<string, unknown>,
  productInterval: 'month' | 'year',
): boolean {
  const serviceCycle = serviceBillingInterval(service.billingType);
  return serviceCycle !== 'one_time' && serviceCycle !== productInterval;
}

async function resolveDeferredAddonServiceIds(
  supabase: ReturnType<typeof adminClient>,
  metadata: Stripe.Metadata,
  partnerId: string,
): Promise<string[]> {
  const explicitIds = JSON.parse(String(metadata.deferred_addon_service_ids || '[]')) as string[];
  if (explicitIds.length > 0) {
    return explicitIds;
  }

  const selectedIds = JSON.parse(String(metadata.selected_services || '[]')) as string[];
  if (selectedIds.length === 0) {
    return [];
  }

  let productInterval = metadata.product_interval === 'year'
    ? 'year'
    : metadata.product_interval === 'month'
      ? 'month'
      : null;

  if (!productInterval && metadata.catalog_product_id) {
    const { data: product } = await supabase
      .from('catalog_products')
      .select('interval')
      .eq('id', String(metadata.catalog_product_id))
      .maybeSingle();
    productInterval = product?.interval === 'year' ? 'year' : 'month';
  }

  if (!productInterval) {
    return [];
  }

  const { data: partner, error: partnerError } = await supabase
    .from('partners')
    .select('branding')
    .eq('id', partnerId)
    .maybeSingle();
  if (partnerError) throw partnerError;

  const services = Array.isArray(partner?.branding?.additionalServices)
    ? partner.branding.additionalServices as Array<Record<string, unknown>>
    : [];

  return selectedIds.filter((serviceId) => {
    const service = services.find(item => String(item.id) === String(serviceId));
    return Boolean(service && isDeferredAddonService(service, productInterval!));
  });
}

async function findExistingDeferredAddonSubscription(
  stripe: Stripe,
  customerId: string,
  sessionId: string,
  serviceId: string,
) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 100,
    status: 'all',
  });

  return subscriptions.data.find(subscription =>
    subscription.metadata?.parent_checkout_session_id === sessionId
    && subscription.metadata?.service_id === serviceId,
  ) || null;
}

export async function createDeferredAddonSubscriptions(
  stripe: Stripe,
  supabase: ReturnType<typeof adminClient>,
  session: Stripe.Checkout.Session,
) {
  const metadata = session.metadata || {};
  const partnerId = metadata.partner_id;
  if (!partnerId) {
    return [];
  }

  const deferredServiceIds = await resolveDeferredAddonServiceIds(
    supabase,
    metadata,
    String(partnerId),
  );

  if (deferredServiceIds.length === 0) {
    return [];
  }

  const customerId = typeof session.customer === 'string'
    ? session.customer
    : session.customer?.id || null;

  if (!customerId) {
    return [];
  }

  const { data: partner, error: partnerError } = await supabase
    .from('partners')
    .select('branding')
    .eq('id', partnerId)
    .maybeSingle();

  if (partnerError) throw partnerError;

  const services = Array.isArray(partner?.branding?.additionalServices)
    ? partner.branding.additionalServices as Array<Record<string, unknown>>
    : [];

  const created: Array<{ serviceId: string; subscriptionId: string }> = [];

  for (const serviceId of deferredServiceIds) {
    const service = services.find(item => String(item.id) === String(serviceId));
    if (!service) continue;

    const stripePriceId = String(service.stripe_price_id || '');
    if (!stripePriceId) {
      console.error('[deferred-addon] missing stripe_price_id for service', serviceId);
      continue;
    }

    const existingSubscription = await findExistingDeferredAddonSubscription(
      stripe,
      customerId,
      session.id,
      String(serviceId),
    );

    if (existingSubscription) {
      created.push({
        serviceId: String(serviceId),
        subscriptionId: existingSubscription.id,
      });
      continue;
    }

    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: stripePriceId }],
        trial_period_days: deferredAddonTrialDays(service.billingType),
        metadata: {
          partner_id: String(partnerId),
          client_id: String(metadata.client_id || ''),
          service_id: String(serviceId),
          catalog_product_id: String(metadata.catalog_product_id || ''),
          type: 'partner_additional_service_subscription',
          parent_checkout_session_id: session.id,
        },
      });

      created.push({
        serviceId: String(serviceId),
        subscriptionId: subscription.id,
      });
    } catch (error) {
      console.error('[deferred-addon] subscription create failed', serviceId, error);
      throw error;
    }
  }

  return created;
}
