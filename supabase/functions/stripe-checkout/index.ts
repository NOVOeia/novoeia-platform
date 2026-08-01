import { corsHeaders, handleError, json, requireRole } from '../_shared/core.ts';
import { createStripeCheckoutSession } from '../_shared/stripe.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { profile, supabase } = await requireRole(req, ['partner', 'super_admin']);
    const { action, payload = {} } = await req.json();

    if (action !== 'createSession') throw new Error('UNKNOWN_ACTION');

    const partnerId = profile.partner_id || payload.partnerId;
    if (!partnerId) throw new Error('PARTNER_NOT_ASSIGNED');

    const productId = String(payload.productId || '');
    const retailPrice = Number(payload.retailPrice);
    if (!productId || !Number.isFinite(retailPrice) || retailPrice <= 0) {
      throw new Error('INVALID_CHECKOUT_PAYLOAD');
    }

    const { data: product, error: productError } = await supabase
      .from('catalog_products')
      .select('*')
      .eq('id', productId)
      .eq('active', true)
      .single();
    if (productError || !product) throw new Error('PRODUCT_NOT_FOUND');

    const wholesalePrice = Number(product.wholesale_price || 0);
    if (retailPrice < wholesalePrice) throw new Error('PRICE_BELOW_WHOLESALE');

    const stripeProductId = product.stripe_product_id;
    if (!stripeProductId) throw new Error('STRIPE_PRODUCT_NOT_CONFIGURED');

    const interval = product.interval === 'year' ? 'year' : 'month';
    const publicUrl = Deno.env.get('PUBLIC_APP_URL');
    if (!publicUrl) throw new Error('PUBLIC_APP_URL_NOT_CONFIGURED');

    const { data: offer, error: offerError } = await supabase.from('partner_offers').upsert({
      partner_id: partnerId,
      product_id: productId,
      retail_price: retailPrice,
      currency: product.currency || 'USD',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'partner_id,product_id' }).select().single();
    if (offerError) throw new Error(`OFFER_SAVE:${offerError.message}`);

    const commissionCents = Math.round((retailPrice - wholesalePrice) * 100);
    const metadata: Record<string, string> = {
      partner_id: partnerId,
      offer_id: offer.id,
      catalog_product_id: product.id,
      product_name: product.name,
      wholesale_cents: String(Math.round(wholesalePrice * 100)),
      commission_cents: String(Math.max(commissionCents, 0)),
      retail_cents: String(Math.round(retailPrice * 100)),
    };

    if (payload.clientId) metadata.client_id = String(payload.clientId);

    const session = await createStripeCheckoutSession({
      stripeProductId,
      interval,
      unitAmountCents: Math.round(retailPrice * 100),
      currency: product.currency || 'USD',
      successUrl: `${publicUrl}/#checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${publicUrl}/#checkout/cancel`,
      metadata,
      customerEmail: payload.clientEmail || undefined,
    });

    const offerPatch = {
      checkout_url: session.url,
      updated_at: new Date().toISOString(),
    };

    let { error: updateError } = await supabase.from('partner_offers').update({
      ...offerPatch,
      stripe_checkout_session_id: session.id,
    }).eq('id', offer.id);

    if (updateError?.message?.includes('stripe_checkout_session_id')) {
      ({ error: updateError } = await supabase.from('partner_offers').update(offerPatch).eq('id', offer.id));
    }

    if (updateError) throw new Error(`OFFER_UPDATE:${updateError.message}`);

    await supabase.from('audit_logs').insert({
      actor_user_id: profile.id,
      action: 'partner.checkout_link_created',
      entity_type: 'partner_offer',
      entity_id: offer.id,
      metadata: {
        partnerId,
        productId,
        retailPrice,
        sessionId: session.id,
      },
    });

    return json({
      checkoutUrl: session.url,
      offerId: offer.id,
      sessionId: session.id,
    });
  } catch (error) {
    return handleError(error);
  }
});
