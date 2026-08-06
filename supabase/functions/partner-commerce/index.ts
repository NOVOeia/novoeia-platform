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
        display_name: payload.displayName ? String(payload.displayName).trim() : null,
        display_description: payload.displayDescription ? String(payload.displayDescription).trim() : null,
        currency: product.currency,
        active: payload.active !== false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'partner_id,product_id' }).select().single();
      if (error) throw error;
      return json({ offer: data });
    }

    if (action === 'listPartnerCatalog') {
      const { data: products, error: productsError } = await supabase
        .from('catalog_products')
        .select('*')
        .eq('active', true)
        .order('name');
      if (productsError) throw productsError;

      const { data: offers, error: offersError } = await supabase
        .from('partner_offers')
        .select('id, product_id, retail_price, display_name, display_description, currency, active')
        .eq('partner_id', partnerId);
      if (offersError) throw offersError;

      const offerByProduct = new Map(
        (offers || []).map((offer) => [String(offer.product_id), offer]),
      );

      const rows = (products || []).map((product) => {
        const offer = offerByProduct.get(String(product.id));
        return {
          id: product.id,
          catalogName: product.name,
          catalogDescription: product.description,
          wholesalePrice: product.wholesale_price,
          suggestedPrice: product.suggested_price,
          currency: product.currency,
          billingType: product.billing_type,
          interval: product.interval,
          offerId: offer?.id || null,
          displayName: offer?.display_name || product.name,
          displayDescription: offer?.display_description || product.description || '',
          retailPrice: offer?.retail_price ?? product.suggested_price ?? null,
          published: Boolean(offer?.active && offer?.retail_price != null),
        };
      });

      return json({ products: rows });
    }

    if (action === 'listOffers') {
      const { data, error } = await supabase
        .from('partner_offers')
        .select(`
          id,
          retail_price,
          display_name,
          display_description,
          currency,
          active,
          catalog_products:product_id (
            id,
            name,
            description,
            interval,
            billing_type,
            currency,
            suggested_price,
            active
          )
        `)
        .eq('partner_id', partnerId)
        .eq('active', true);

      if (error) throw error;
      return json({ offers: data || [] });
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

    if (action === 'saveAdditionalServices') {
      const services = Array.isArray(payload.additionalServices) ? payload.additionalServices : [];

      const { data: partner, error: readError } = await supabase
        .from('partners')
        .select('branding')
        .eq('id', partnerId)
        .single();
      if (readError) throw readError;

      const branding = {
        ...(partner.branding || {}),
        additionalServices: services,
      };

      const { data, error } = await supabase
        .from('partners')
        .update({
          branding,
          updated_at: new Date().toISOString(),
        })
        .eq('id', partnerId)
        .select('id, name, slug, status, branding, social_settings')
        .single();
      if (error) throw error;
      return json({ partner: data });
    }

    if (action === 'saveBranding') {
      const { data: existingPartner, error: readError } = await supabase
        .from('partners')
        .select('branding, social_settings')
        .eq('id', partnerId)
        .single();
      if (readError) throw readError;

      const existingBranding = (existingPartner?.branding || {}) as Record<string, unknown>;
      const brand = payload.brand !== undefined ? payload.brand : (existingBranding.brand || {});
      const funnel = payload.funnel !== undefined ? payload.funnel : (existingBranding.funnel || {});
      const checkout = payload.checkout !== undefined ? payload.checkout : (existingBranding.checkout || {});
      const terms = payload.terms !== undefined ? payload.terms : (existingBranding.terms || {});
      const additionalServices = Array.isArray(payload.additionalServices)
        ? payload.additionalServices
        : (Array.isArray(existingBranding.additionalServices) ? existingBranding.additionalServices : []);
      const productOverrides = payload.productOverrides !== undefined
        ? payload.productOverrides
        : (existingBranding.productOverrides || {});

      const branding = {
        ...existingBranding,
        brand,
        funnel,
        checkout,
        terms,
        additionalServices,
        productOverrides,
        name: brand.businessName || payload.name || existingBranding.name || null,
        domain: payload.domain || brand.websiteUrl || existingBranding.domain || null,
        logoUrl: brand.logoUrl || payload.logoUrl || existingBranding.logoUrl || null,
        primaryColor: brand.primaryColor || payload.primaryColor || existingBranding.primaryColor || '#7C3AED',
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
