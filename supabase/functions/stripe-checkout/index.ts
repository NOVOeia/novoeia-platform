import {
  corsHeaders,
  handleError,
  json,
  requireRole,
} from '../_shared/core.ts';

import {
  createStripeCheckoutSession,
} from '../_shared/stripe.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    const { profile, supabase } = await requireRole(req, [
      'partner',
      'super_admin',
    ]);

    const {
      action,
      payload = {},
    } = await req.json();

    if (action !== 'createSession') {
      throw new Error('UNKNOWN_ACTION');
    }

    /* =====================================================
       1. RESOLVER PARTNER
    ===================================================== */

    const partnerId =
      profile.partner_id ||
      payload.partnerId;

    if (!partnerId) {
      throw new Error('PARTNER_NOT_ASSIGNED');
    }

    /* =====================================================
       2. VALIDAR PRODUCTO, PRECIO Y CLIENTE
    ===================================================== */

    const productId = String(payload.productId || '');
    const clientId = String(payload.clientId || '');
    const retailPrice = Number(payload.retailPrice);

    if (!clientId) {
      throw new Error('CLIENT_REQUIRED');
    }

    if (
      !productId ||
      !Number.isFinite(retailPrice) ||
      retailPrice <= 0
    ) {
      throw new Error('INVALID_CHECKOUT_PAYLOAD');
    }

    /* =====================================================
       3. OBTENER Y VALIDAR CLIENTE
    ===================================================== */

    const {
      data: client,
      error: clientError,
    } = await supabase
      .from('partner_clients')
      .select(`
        id,
        partner_id,
        name,
        company_name,
        email,
        status
      `)
      .eq('id', clientId)
      .eq('partner_id', partnerId)
      .single();

    if (clientError || !client) {
      throw new Error('CLIENT_NOT_FOUND');
    }

    if (client.partner_id !== partnerId) {
      throw new Error(
        'CLIENT_DOES_NOT_BELONG_TO_PARTNER',
      );
    }

    /* =====================================================
       4. OBTENER Y VALIDAR PRODUCTO
    ===================================================== */

    const {
      data: product,
      error: productError,
    } = await supabase
      .from('catalog_products')
      .select('*')
      .eq('id', productId)
      .eq('active', true)
      .single();

    if (productError || !product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    const wholesalePrice = Number(
      product.wholesale_price || 0,
    );

    if (retailPrice < wholesalePrice) {
      throw new Error('PRICE_BELOW_WHOLESALE');
    }

    const stripeProductId =
      product.stripe_product_id;

    if (!stripeProductId) {
      throw new Error(
        'STRIPE_PRODUCT_NOT_CONFIGURED',
      );
    }

    const {
      data: partner,
      error: partnerError,
    } = await supabase
      .from('partners')
      .select('id, name')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partner) {
      throw new Error('PARTNER_NOT_FOUND');
    }

    const clientName =
      client.company_name ||
      client.name;

    const billingType =
      product.billing_type || 'recurring';

    const billingInterval =
      product.interval || null;

    const currency =
      (product.currency || 'USD').toUpperCase();

    /* =====================================================
       5. CREAR O ACTUALIZAR OFERTA DEL PARTNER
    ===================================================== */

    const {
      data: offer,
      error: offerError,
    } = await supabase
      .from('partner_offers')
      .upsert(
        {
          partner_id: partnerId,
          product_id: productId,
          retail_price: retailPrice,
          currency: product.currency || 'USD',
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'partner_id,product_id',
        },
      )
      .select()
      .single();

    if (offerError || !offer) {
      throw new Error(
        `OFFER_SAVE:${
          offerError?.message ||
          'No se pudo guardar la oferta'
        }`,
      );
    }

    /* =====================================================
       6. ARCHIVAR LINKS ACTIVOS Y REUTILIZAR BORRADOR
    ===================================================== */

    await supabase
      .from('sales_links')
      .update({
        status: 'archived',
        disabled_at: new Date().toISOString(),
        stripe_checkout_session_id: null,
        failure_reason: null,
      })
      .eq('partner_id', partnerId)
      .eq('client_id', client.id)
      .eq('product_id', product.id)
      .eq('status', 'active');

    await supabase
      .from('sales_links')
      .update({
        status: 'archived',
        disabled_at: new Date().toISOString(),
        stripe_checkout_session_id: null,
      })
      .eq('partner_id', partnerId)
      .eq('client_id', client.id)
      .eq('product_id', product.id)
      .eq('status', 'draft')
      .not('stripe_checkout_session_id', 'is', null);

    const salesLinkBase = {
      partner_id: partnerId,
      partner_name: partner.name,
      client_id: client.id,
      client_name: clientName,
      client_email: client.email || null,
      offer_id: offer.id,
      product_id: product.id,
      product_name: product.name,
      billing_type: billingType,
      billing_interval: billingInterval,
      currency,
      wholesale_price: wholesalePrice,
      sale_price: retailPrice,
      stripe_product_id: stripeProductId,
      stripe_checkout_session_id: null,
      stripe_payment_link_id: null,
      checkout_url: null,
      status: 'draft',
      created_by: profile.id,
      created_by_role: profile.role,
      failure_reason: null,
      metadata: {
        client_status: client.status || null,
        requested_retail_price: retailPrice,
      },
    };

    const { data: existingDraft } = await supabase
      .from('sales_links')
      .select('id')
      .eq('partner_id', partnerId)
      .eq('client_id', client.id)
      .eq('product_id', product.id)
      .eq('status', 'draft')
      .is('stripe_checkout_session_id', null)
      .maybeSingle();

    let salesLink;
    let salesLinkError;

    if (existingDraft?.id) {
      const updated = await supabase
        .from('sales_links')
        .update({
          ...salesLinkBase,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDraft.id)
        .select()
        .single();
      salesLink = updated.data;
      salesLinkError = updated.error;
    } else {
      const inserted = await supabase
        .from('sales_links')
        .insert(salesLinkBase)
        .select()
        .single();
      salesLink = inserted.data;
      salesLinkError = inserted.error;
    }

    if (salesLinkError || !salesLink) {
      throw new Error(
        `SALES_LINK_CREATE:${
          salesLinkError?.message ||
          'No se pudo registrar el link'
        }`,
      );
    }

    /* =====================================================
       7. PREPARAR METADATA PARA STRIPE
    ===================================================== */

    const commissionCents = Math.round(
      (retailPrice - wholesalePrice) * 100,
    );

    const metadata: Record<string, string> = {
      sales_link_id: salesLink.id,
      partner_id: partnerId,
      client_id: client.id,
      offer_id: offer.id,
      catalog_product_id: product.id,
      product_name: product.name,

      wholesale_cents: String(
        Math.round(wholesalePrice * 100),
      ),

      commission_cents: String(
        Math.max(commissionCents, 0),
      ),

      retail_cents: String(
        Math.round(retailPrice * 100),
      ),
    };

    const interval =
      product.interval === 'year'
        ? 'year'
        : 'month';

    const publicUrl =
      Deno.env.get('PUBLIC_APP_URL');

    if (!publicUrl) {
      await supabase
        .from('sales_links')
        .update({
          failure_reason:
            'PUBLIC_APP_URL_NOT_CONFIGURED',
        })
        .eq('id', salesLink.id);

      throw new Error(
        'PUBLIC_APP_URL_NOT_CONFIGURED',
      );
    }

    /* =====================================================
       8. CREAR CHECKOUT EN STRIPE
    ===================================================== */

    let session;

    try {
      session = await createStripeCheckoutSession({
        stripeProductId,
        interval,

        unitAmountCents: Math.round(
          retailPrice * 100,
        ),

        currency:
          product.currency || 'USD',

        successUrl:
          `${publicUrl}/#checkout/success` +
          '?session_id={CHECKOUT_SESSION_ID}',

        cancelUrl:
          `${publicUrl}/#checkout/cancel`,

        metadata,

        customerEmail:
          client.email || undefined,
      });
    } catch (stripeError) {
      const message =
        stripeError instanceof Error
          ? stripeError.message
          : String(stripeError);

      await supabase
        .from('sales_links')
        .update({
          failure_reason: message,
        })
        .eq('id', salesLink.id);

      throw stripeError;
    }

    /* =====================================================
       9. ACTUALIZAR OFERTA CON CHECKOUT
    ===================================================== */

    const offerPatch = {
      checkout_url: session.url,
      updated_at: new Date().toISOString(),
    };

    const { error: updateOfferError } = await supabase
      .from('partner_offers')
      .update(offerPatch)
      .eq('id', offer.id);

    if (updateOfferError) {
      await supabase
        .from('sales_links')
        .update({
          failure_reason:
            `OFFER_UPDATE:${updateOfferError.message}`,
        })
        .eq('id', salesLink.id);

      throw new Error(
        `OFFER_UPDATE:${updateOfferError.message}`,
      );
    }

    /* =====================================================
       10. ACTIVAR LINK DE VENTA
    ===================================================== */

    await supabase
      .from('sales_links')
      .update({ stripe_checkout_session_id: null })
      .eq('stripe_checkout_session_id', session.id)
      .neq('id', salesLink.id);

    const {
      data: activeSalesLink,
      error: updateSalesLinkError,
    } = await supabase
      .from('sales_links')
      .update({
        checkout_url: session.url,
        stripe_checkout_session_id: session.id,
        stripe_product_id: stripeProductId,
        sale_price: retailPrice,
        wholesale_price: wholesalePrice,
        status: 'active',
        activated_at: new Date().toISOString(),
        failure_reason: null,
        metadata: {
          client_status: client.status || null,
          requested_retail_price: retailPrice,
          stripe_session_id: session.id,
        },
      })
      .eq('id', salesLink.id)
      .select()
      .single();

    if (
      updateSalesLinkError ||
      !activeSalesLink
    ) {
      throw new Error(
        `SALES_LINK_UPDATE:${
          updateSalesLinkError?.message ||
          'No se pudo activar el link'
        }`,
      );
    }

    /* =====================================================
       11. AUDITORÍA
    ===================================================== */

    await supabase
      .from('audit_logs')
      .insert({
        actor_user_id: profile.id,

        action:
          'partner.sales_link_created',

        entity_type:
          'sales_link',

        entity_id:
          activeSalesLink.id,

        metadata: {
          partnerId,
          clientId: client.id,
          productId,
          offerId: offer.id,
          retailPrice,
          wholesalePrice,
          sessionId: session.id,
        },
      });

    /* =====================================================
       12. RESPUESTA
    ===================================================== */

    return json({
      salesLinkId:
        activeSalesLink.id,

      checkoutUrl:
        activeSalesLink.checkout_url,

      offerId:
        activeSalesLink.offer_id,

      clientId:
        activeSalesLink.client_id,

      productId:
        activeSalesLink.product_id,

      sessionId:
        activeSalesLink
          .stripe_checkout_session_id,

      status:
        activeSalesLink.status,

      salePrice:
        activeSalesLink.sale_price,

      wholesalePrice:
        activeSalesLink.wholesale_price,

      partnerMargin:
        activeSalesLink.partner_margin,
    });
  } catch (error) {
    return handleError(error);
  }
});