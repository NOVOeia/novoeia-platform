import Stripe from 'https://esm.sh/stripe@17.7.0?target=deno';
import { adminClient, corsHeaders, handleError, json } from '../_shared/core.ts';
import { createDeferredAddonSubscriptions } from '../_shared/deferred-addon-subscriptions.ts';
import { provisionPartnerClientInGhl } from '../_shared/ghl-provision.ts';

function stripeClient() {
  const secret = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secret) throw new Error('STRIPE_NOT_CONFIGURED');
  return new Stripe(secret, { apiVersion: '2023-10-16' });
}

function webhookSecret() {
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!secret) throw new Error('STRIPE_WEBHOOK_NOT_CONFIGURED');
  return secret;
}

async function fulfillCheckoutSession(
  supabase: ReturnType<typeof adminClient>,
  session: Stripe.Checkout.Session,
  stripe: Stripe,
) {
  const metadata = session.metadata || {};
  let salesLinkId = metadata.sales_link_id || null;
  const partnerId = metadata.partner_id || null;
  const clientId = metadata.client_id || null;
  const offerId = metadata.offer_id || null;

  if (!salesLinkId && session.id) {
    const { data: bySession } = await supabase
      .from('sales_links')
      .select('id')
      .eq('stripe_checkout_session_id', session.id)
      .maybeSingle();
    salesLinkId = bySession?.id || null;
  }

  const retailCents = Number(metadata.retail_cents || session.amount_total || 0);
  const wholesaleCents = Number(metadata.wholesale_cents || 0);
  const commissionCents = Number(
    metadata.commission_cents || Math.max(retailCents - wholesaleCents, 0),
  );

  const currency = (session.currency || 'usd').toUpperCase();
  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id || null;

  if (clientId) {
    const clientPatch: Record<string, unknown> = { status: 'active' };
    if (offerId) clientPatch.offer_id = offerId;

    await supabase
      .from('partner_clients')
      .update(clientPatch)
      .eq('id', clientId);
  }

  const deferredAddonSubscriptions = await createDeferredAddonSubscriptions(
    stripe,
    supabase,
    session,
  );

  if (salesLinkId) {
    const { data: salesLink } = await supabase
      .from('sales_links')
      .select('metadata')
      .eq('id', salesLinkId)
      .maybeSingle();

    await supabase
      .from('sales_links')
      .update({
        status: 'active',
        activated_at: new Date().toISOString(),
        failure_reason: null,
        metadata: {
          ...(salesLink?.metadata || {}),
          stripe_customer_id: session.customer || null,
          stripe_subscription_id: subscriptionId,
          deferred_addon_subscriptions: deferredAddonSubscriptions,
          payment_status: session.payment_status || null,
          paid_at: new Date().toISOString(),
        },
      })
      .eq('id', salesLinkId);
  } else if (deferredAddonSubscriptions.length > 0 && clientId) {
    await supabase.from('audit_logs').insert({
      actor_user_id: null,
      action: 'stripe.deferred_addon_subscriptions_created',
      entity_type: 'partner_client',
      entity_id: clientId,
      metadata: {
        sessionId: session.id,
        partnerId,
        deferredAddonSubscriptions,
      },
    });
  }

  if (partnerId && session.id) {
    const gross = retailCents > 0 ? retailCents / 100 : Number(session.amount_total || 0) / 100;
    const wholesale = wholesaleCents / 100;
    const commission = commissionCents > 0 ? commissionCents / 100 : Math.max(gross - wholesale, 0);

    await supabase.from('partner_commissions').upsert({
      partner_id: partnerId,
      sales_link_id: salesLinkId,
      client_id: clientId,
      stripe_checkout_session_id: session.id,
      stripe_subscription_id: subscriptionId,
      gross_amount: gross,
      wholesale_amount: wholesale,
      commission_amount: commission,
      currency,
      status: 'pending',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'stripe_checkout_session_id' });
  }

  await supabase.from('audit_logs').insert({
    actor_user_id: null,
    action: 'stripe.checkout_completed',
    entity_type: 'sales_link',
    entity_id: salesLinkId,
    metadata: {
      sessionId: session.id,
      partnerId,
      clientId,
      offerId,
      subscriptionId,
      deferredAddonSubscriptions,
      paymentStatus: session.payment_status,
    },
  });

  let ghlProvision: Record<string, unknown> | null = null;

  if (clientId) {
    try {
      const result = await provisionPartnerClientInGhl(supabase, {
        clientId,
        offerId,
        catalogProductId: metadata.catalog_product_id || null,
        stripeCustomerId: typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id || null,
      });

      ghlProvision = result as Record<string, unknown>;

      if (!result.skipped) {
        await supabase.from('audit_logs').insert({
          actor_user_id: null,
          action: 'ghl.client_provisioned',
          entity_type: 'partner_client',
          entity_id: clientId,
          metadata: {
            sessionId: session.id,
            partnerId,
            locationId: result.locationId,
            saasEnabled: result.saasEnabled,
          },
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[ghl-provision]', message, error);

      await supabase
        .from('partner_clients')
        .update({ ghl_sync_status: 'failed' })
        .eq('id', clientId);

      await supabase.from('audit_logs').insert({
        actor_user_id: null,
        action: 'ghl.provision_failed',
        entity_type: 'partner_client',
        entity_id: clientId,
        metadata: {
          sessionId: session.id,
          partnerId,
          offerId,
          error: message,
        },
      });

      ghlProvision = { failed: true, error: message };
    }
  }

  return {
    salesLinkId,
    clientId,
    partnerId,
    subscriptionId,
    deferredAddonSubscriptions,
    ghlProvision,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'METHOD_NOT_ALLOWED' }, 405);
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) throw new Error('STRIPE_SIGNATURE_MISSING');

    const body = await req.text();
    const stripe = stripeClient();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret(),
    );

    const supabase = adminClient();

    const { data: existing } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('provider', 'stripe')
      .eq('external_event_id', event.id)
      .maybeSingle();

    if (existing) {
      return json({ ok: true, duplicate: true });
    }

    let result: Record<string, unknown> = { handled: event.type };

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription' && session.payment_status === 'paid') {
        result = { ...result, ...(await fulfillCheckoutSession(supabase, session, stripe)) };
      } else {
        result.skipped = 'not_paid_yet';
      }
    } else if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id || null;

      if (subscriptionId) {
        await supabase
          .from('partner_commissions')
          .update({ updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', subscriptionId);
      }

      result.subscriptionId = subscriptionId;
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const metadata = subscription.metadata || {};

      if (metadata.type !== 'partner_additional_service_subscription' && metadata.client_id) {
        await supabase
          .from('partner_clients')
          .update({ status: 'cancelled' })
          .eq('id', metadata.client_id);
      }

      await supabase
        .from('partner_commissions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subscription.id);
    } else {
      result.ignored = event.type;
    }

    await supabase.from('webhook_events').insert({
      provider: 'stripe',
      external_event_id: event.id,
      event_type: event.type,
      payload: event,
      processed_at: new Date().toISOString(),
    });

    return json({ ok: true, ...result });
  } catch (error) {
    return handleError(error);
  }
});
