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
       6. CREAR REGISTRO BORRADOR DEL LINK
    ===================================================== */

    const {
      data: salesLink,
      error: salesLinkError,
    } = await supabase
      .from('sales_links')
      .insert({
        partner_id: partnerId,
        client_id: client.id,
        offer_id: offer.id,
        product_id: product.id,

        status: 'draft',

        created_by: profile.id,
        created_by_role: profile.role,

        metadata: {
          client_status: client.status || null,
          requested_retail_price: retailPrice,
        },
      })
      .select()
      .single();

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

    let {
      error: updateOfferError,
    } = await supabase
      .from('partner_offers')
      .update({
        ...offerPatch,
        stripe_checkout_session_id:
          session.id,
      })
      .eq('id', offer.id);

    /*
      Compatibilidad por si la columna
      stripe_checkout_session_id no existe
      en algún entorno anterior.
    */
    if (
      updateOfferError?.message?.includes(
        'stripe_checkout_session_id',
      )
    ) {
      const fallback = await supabase
        .from('partner_offers')
        .update(offerPatch)
        .eq('id', offer.id);

      updateOfferError = fallback.error;
    }

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

    const {
      data: activeSalesLink,
      error: updateSalesLinkError,
    } = await supabase
      .from('sales_links')
      .update({
        checkout_url: session.url,
        stripe_checkout_session_id:
          session.id,

        status: 'active',
        failure_reason: null,

        metadata: {
          client_status:
            client.status || null,

          requested_retail_price:
            retailPrice,

          stripe_session_id:
            session.id,
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