import { adminClient, corsHeaders, handleError, json } from '../_shared/core.ts';

const DEFAULT_BRAND = {
  businessName: '',
  tagline: '',
  description: '',
  logoUrl: '',
  coverImageUrl: '',
  primaryColor: '#7C3AED',
  secondaryColor: '#111827',
  accentColor: '#22C55E',
  backgroundColor: '#F8FAFC',
  textColor: '#111827',
  supportEmail: '',
  publicContactPhone: '',
  whatsappNumber: '',
  address: '',
  city: '',
  state: '',
  country: '',
  facebookUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  tiktokUrl: '',
};

const DEFAULT_FUNNEL = {
  title: 'Soluciones digitales para hacer crecer tu negocio',
  subtitle: 'Organiza tus clientes, automatiza procesos y vende mejor.',
  heroImageUrl: '',
  buttonText: 'Conocer soluciones',
  showProductPrices: true,
  showContactFormWithoutPrice: true,
};

function normalizeStorefront(partner: Record<string, unknown>) {
  const branding = (partner.branding || {}) as Record<string, unknown>;
  const social = (partner.social_settings || {}) as Record<string, unknown>;
  const brandBlock = (branding.brand || {}) as Record<string, unknown>;
  const funnelBlock = (branding.funnel || {}) as Record<string, unknown>;

  const brand = {
    ...DEFAULT_BRAND,
    businessName: brandBlock.businessName || branding.name || partner.name || '',
    tagline: brandBlock.tagline || '',
    description: brandBlock.description || '',
    logoUrl: brandBlock.logoUrl || branding.logoUrl || '',
    coverImageUrl: brandBlock.coverImageUrl || '',
    primaryColor: brandBlock.primaryColor || branding.primaryColor || DEFAULT_BRAND.primaryColor,
    secondaryColor: brandBlock.secondaryColor || DEFAULT_BRAND.secondaryColor,
    accentColor: brandBlock.accentColor || DEFAULT_BRAND.accentColor,
    backgroundColor: brandBlock.backgroundColor || DEFAULT_BRAND.backgroundColor,
    textColor: brandBlock.textColor || DEFAULT_BRAND.textColor,
    supportEmail: brandBlock.supportEmail || '',
    publicContactPhone: brandBlock.publicContactPhone || '',
    whatsappNumber: brandBlock.whatsappNumber || '',
    address: brandBlock.address || '',
    city: brandBlock.city || '',
    state: brandBlock.state || '',
    country: brandBlock.country || '',
    facebookUrl: brandBlock.facebookUrl || social.facebookUrl || '',
    instagramUrl: brandBlock.instagramUrl || social.instagramUrl || '',
    linkedinUrl: brandBlock.linkedinUrl || social.linkedinUrl || '',
    tiktokUrl: brandBlock.tiktokUrl || social.tiktokUrl || '',
  };

  const funnel = {
    ...DEFAULT_FUNNEL,
    ...funnelBlock,
  };

  return {
    id: partner.id,
    name: partner.name,
    slug: partner.slug,
    brand,
    funnel,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = adminClient();
    const { action, payload = {} } = await req.json();
    const slug = String(payload.slug || '').trim().toLowerCase();

    if (!slug) throw new Error('PARTNER_SLUG_REQUIRED');

    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, name, slug, status, branding, social_settings')
      .eq('slug', slug)
      .maybeSingle();

    if (partnerError) throw partnerError;
    if (!partner) throw new Error('PARTNER_NOT_FOUND');
    if (partner.status !== 'active') throw new Error('PARTNER_NOT_PUBLISHED');

    if (action === 'getStorefront') {
      const { data: offers, error: offersError } = await supabase
        .from('partner_offers')
        .select(`
          id,
          retail_price,
          currency,
          active,
          catalog_products:product_id (
            id,
            name,
            description,
            wholesale_price,
            suggested_price,
            currency,
            interval,
            billing_type,
            active
          )
        `)
        .eq('partner_id', partner.id)
        .eq('active', true);

      if (offersError) throw offersError;

      const products = (offers || [])
        .map((offer) => {
          const product = offer.catalog_products as Record<string, unknown> | null;
          if (!product || product.active === false) return null;
          return {
            id: product.id,
            name: product.name,
            description: product.description,
            interval: product.interval,
            billingType: product.billing_type,
            currency: offer.currency || product.currency || 'USD',
            retailPrice: offer.retail_price,
            suggestedPrice: product.suggested_price,
          };
        })
        .filter(Boolean);

      return json({
        storefront: normalizeStorefront(partner),
        products,
      });
    }

    if (action === 'submitLead') {
      const companyName = String(payload.companyName || payload.name || '').trim();
      const email = String(payload.email || '').trim().toLowerCase();
      const phone = String(payload.phone || '').trim();
      const message = String(payload.message || '').trim();
      const productName = String(payload.productName || '').trim();

      if (!companyName || !email) throw new Error('LEAD_FIELDS_REQUIRED');

      const { data: client, error: clientError } = await supabase
        .from('partner_clients')
        .insert({
          partner_id: partner.id,
          name: companyName,
          company_name: companyName,
          email,
          phone: phone || null,
          contact_name: String(payload.contactName || '').trim() || null,
          status: 'pending',
          notes: [
            productName ? `Producto de interés: ${productName}` : null,
            message || null,
          ].filter(Boolean).join('\n') || null,
        })
        .select('id')
        .single();

      if (clientError) throw clientError;

      await supabase.from('audit_logs').insert({
        action: 'storefront.lead_created',
        entity_type: 'partner_client',
        entity_id: client.id,
        metadata: { partnerId: partner.id, slug, productName },
      });

      return json({ ok: true, clientId: client.id }, 201);
    }

    throw new Error('UNKNOWN_ACTION');
  } catch (error) {
    return handleError(error);
  }
});
