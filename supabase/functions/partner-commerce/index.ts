import { corsHeaders, handleError, json, requireRole } from '../_shared/core.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { profile, supabase } = await requireRole(req, ['partner', 'super_admin']);
    const { action, payload = {} } = await req.json();
    const partnerId = profile.partner_id || payload.partnerId;
    if (!partnerId && profile.role !== 'super_admin') throw new Error('PARTNER_NOT_ASSIGNED');

    if (action === 'listCatalog') {
      const { data, error } = await supabase.from('catalog_products').select('*').eq('active', true).order('name');
      if (error) throw error;
      return json({ products: data });
    }

    if (action === 'listClients') {
      const { data, error } = await supabase.from('partner_clients').select('*').eq('partner_id', partnerId).order('created_at', { ascending: false });
      if (error) throw error;
      return json({ clients: data });
    }

    if (action === 'createClient') {
      if (!payload.name) throw new Error('CLIENT_NAME_REQUIRED');
      const { data, error } = await supabase.from('partner_clients').insert({
        partner_id: partnerId,
        name: payload.name,
        email: payload.email || null,
        phone: payload.phone || null,
        status: 'pending',
      }).select().single();
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        actor_user_id: profile.id,
        action: 'partner.client_created',
        entity_type: 'partner_client',
        entity_id: data.id,
        metadata: { partnerId, status: 'pending' },
      });

      return json({ client: data }, 201);
    }

    if (action === 'saveOffer') {
      const { data: product, error: productError } = await supabase.from('catalog_products').select('*').eq('id', payload.productId).single();
      if (productError) throw productError;
      if (Number(payload.retailPrice) < Number(product.wholesale_price)) throw new Error('PRICE_BELOW_WHOLESALE');

      const { data, error } = await supabase.from('partner_offers').upsert({
        partner_id: partnerId,
        product_id: payload.productId,
        retail_price: payload.retailPrice,
        currency: product.currency,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'partner_id,product_id' }).select().single();
      if (error) throw error;
      return json({ offer: data });
    }

    if (action === 'generateCheckoutLink') {
      const { data: offer, error } = await supabase.from('partner_offers')
        .select('*, catalog_products(*)')
        .eq('partner_id', partnerId)
        .eq('product_id', payload.productId)
        .single();
      if (error) throw error;

      const baseUrl = Deno.env.get('PUBLIC_APP_URL');
      if (!baseUrl) throw new Error('PUBLIC_APP_URL_NOT_CONFIGURED');
      const checkoutUrl = `${baseUrl}/checkout?offer=${offer.id}`;

      await supabase.from('partner_offers').update({ checkout_url: checkoutUrl }).eq('id', offer.id);
      return json({ checkoutUrl, offerId: offer.id });
    }

    if (action === 'saveBranding') {
      const allowed = {
        name: payload.name,
        domain: payload.domain,
        logoUrl: payload.logoUrl,
        primaryColor: payload.primaryColor,
      };
      const social = {
        metaPixelId: payload.metaPixelId,
        facebookUrl: payload.facebookUrl,
        instagramUrl: payload.instagramUrl,
        tiktokUrl: payload.tiktokUrl,
      };
      const { data, error } = await supabase.from('partners').update({
        branding: allowed,
        social_settings: social,
        updated_at: new Date().toISOString(),
      }).eq('id', partnerId).select().single();
      if (error) throw error;
      return json({ partner: data });
    }

    throw new Error('UNKNOWN_ACTION');
  } catch (error) {
    return handleError(error);
  }
});
