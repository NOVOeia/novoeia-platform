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
      const displayName = String(payload.company_name || payload.name || '').trim();
      if (!displayName) throw new Error('CLIENT_NAME_REQUIRED');

      const clientRow = {
        name: displayName,
        email: payload.email || null,
        phone: payload.phone || null,
        status: payload.status || 'pending',
        company_name: payload.company_name || displayName,
        logo_url: payload.logo_url || null,
        industry: payload.industry || null,
        website: payload.website || null,
        contact_name: payload.contact_name || null,
        contact_role: payload.contact_role || null,
        country: payload.country || null,
        city: payload.city || null,
        address: payload.address || null,
        notes: payload.notes || null,
      };

      if (payload.id) {
        const { data, error } = await supabase
          .from('partner_clients')
          .update(clientRow)
          .eq('id', payload.id)
          .eq('partner_id', partnerId)
          .select()
          .single();
        if (error) throw error;

        await supabase.from('audit_logs').insert({
          actor_user_id: profile.id,
          action: 'partner.client_updated',
          entity_type: 'partner_client',
          entity_id: data.id,
          metadata: { partnerId },
        });

        return json({ client: data });
      }

      const { data, error } = await supabase.from('partner_clients').insert({
        partner_id: partnerId,
        ...clientRow,
      }).select().single();
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        actor_user_id: profile.id,
        action: 'partner.client_created',
        entity_type: 'partner_client',
        entity_id: data.id,
        metadata: { partnerId, status: clientRow.status },
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

    if (action === 'getBranding') {
      const { data, error } = await supabase
        .from('partners')
        .select('id, name, slug, status, branding, social_settings')
        .eq('id', partnerId)
        .single();
      if (error) throw error;
      return json({ partner: data });
    }

    if (action === 'saveBranding') {
      const brand = payload.brand || {};
      const funnel = payload.funnel || {};
      const checkout = payload.checkout || {};

      const branding = {
        brand,
        funnel,
        checkout,
        name: brand.businessName || payload.name || null,
        domain: payload.domain || brand.websiteUrl || null,
        logoUrl: brand.logoUrl || payload.logoUrl || null,
        primaryColor: brand.primaryColor || payload.primaryColor || '#7C3AED',
      };

      const social = {
        metaPixelId: payload.metaPixelId || null,
        facebookUrl: brand.facebookUrl || payload.facebookUrl || null,
        instagramUrl: brand.instagramUrl || payload.instagramUrl || null,
        linkedinUrl: brand.linkedinUrl || null,
        tiktokUrl: brand.tiktokUrl || payload.tiktokUrl || null,
      };

      const partnerPatch: Record<string, unknown> = {
        branding,
        social_settings: social,
        updated_at: new Date().toISOString(),
      };

      if (brand.businessName) {
        partnerPatch.name = String(brand.businessName).trim();
      }

      const { data, error } = await supabase
        .from('partners')
        .update(partnerPatch)
        .eq('id', partnerId)
        .select('id, name, slug, status, branding, social_settings')
        .single();
      if (error) throw error;
      return json({ partner: data });
    }

    throw new Error('UNKNOWN_ACTION');
  } catch (error) {
    return handleError(error);
  }
});
