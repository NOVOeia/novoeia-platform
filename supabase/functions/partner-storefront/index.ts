import { adminClient, corsHeaders, handleError, json } from '../_shared/core.ts';
import { createStripeCheckoutSession } from '../_shared/stripe.ts';

const DEFAULT_BRAND = {
  businessName: '',
  tagline: '',
  description: '',
  logoUrl: '',
  websiteUrl: '',
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
  hero: {
    eyebrow: 'GESTIÓN COMERCIAL TODO EN UNO',
    titlePrefix: 'Tu negocio merece un sistema que',
    titleHighlight: 'cierre más ventas',
    titleSuffix: 'sin depender del caos',
    subtitle:
      'Te implementamos la plataforma de gestión comercial más completa del mercado, con acompañamiento experto y sin que tengas que pagar nada por adelantado.',
    primaryButtonText: 'Ver planes disponibles',
    secondaryButtonText: 'Conocer la plataforma',
    backgroundImageUrl: '',
    backgroundPosition: 'center center',
    backgroundOverlay: 75,
    showDashboardPreview: true,
  },
  video: {
    enabled: true,
    url: '',
    titlePrefix: 'Mira cómo funciona tu',
    titleHighlight: 'nuevo sistema comercial',
    titleSuffix: 'en acción',
    description:
      'En menos de 5 minutos vas a entender por qué cientos de empresas ya gestionan todos sus clientes, seguimientos y ventas desde un solo lugar.',
  },
  products: {
    sectionTitlePrefix: 'Elige el plan',
    sectionTitleHighlight: 'ideal para tu operación',
    sectionTitleSuffix: '',
    sectionDescription:
      'Todos los planes incluyen acompañamiento experto, onboarding personalizado y soporte continuo.',
    showPrices: true,
    featuredProductId: '',
    visibleProductIds: [],
  },
  contact: {
    showForm: true,
    showFloatingContact: true,
    preferredChannel: 'whatsapp',
    titlePrefix: 'Hablemos y encontremos la',
    titleHighlight: 'solución perfecta',
    titleSuffix: 'para tu empresa',
  },
  testimonials: {
    enabled: true,
    items: [],
  },
  noRisk: {
    enabled: true,
  },
};

function normalizeFunnelSettings(stored: Record<string, unknown> = {}) {
  if (stored?.hero) {
    return {
      hero: { ...DEFAULT_FUNNEL.hero, ...(stored.hero as Record<string, unknown> || {}) },
      video: { ...DEFAULT_FUNNEL.video, ...(stored.video as Record<string, unknown> || {}) },
      products: {
        ...DEFAULT_FUNNEL.products,
        ...(stored.products as Record<string, unknown> || {}),
        visibleProductIds: Array.isArray((stored.products as Record<string, unknown>)?.visibleProductIds)
          ? [...((stored.products as Record<string, unknown>).visibleProductIds as string[])]
          : [],
      },
      contact: { ...DEFAULT_FUNNEL.contact, ...(stored.contact as Record<string, unknown> || {}) },
      testimonials: {
        ...DEFAULT_FUNNEL.testimonials,
        ...(stored.testimonials as Record<string, unknown> || {}),
        items: Array.isArray((stored.testimonials as Record<string, unknown>)?.items)
          ? (stored.testimonials as Record<string, unknown>).items
          : DEFAULT_FUNNEL.testimonials.items,
      },
      noRisk: { ...DEFAULT_FUNNEL.noRisk, ...(stored.noRisk as Record<string, unknown> || {}) },
    };
  }

  return normalizeFunnelSettings({
    hero: {
      titlePrefix: stored.title || DEFAULT_FUNNEL.hero.titlePrefix,
      subtitle: stored.subtitle || DEFAULT_FUNNEL.hero.subtitle,
      backgroundImageUrl: stored.heroImageUrl || '',
      primaryButtonText: stored.buttonText || DEFAULT_FUNNEL.hero.primaryButtonText,
    },
    products: {
      showPrices: stored.showProductPrices !== false,
    },
    contact: {
      showForm: stored.showContactFormWithoutPrice !== false,
    },
  });
}

function normalizeStorefront(partner: Record<string, unknown>) {
  const branding = (partner.branding || {}) as Record<string, unknown>;
  const social = (partner.social_settings || {}) as Record<string, unknown>;
  const brandBlock = (branding.brand || {}) as Record<string, unknown>;
  const checkoutBlock = (branding.checkout || {}) as Record<string, unknown>;
  const termsBlock = (branding.terms || {}) as Record<string, unknown>;

  const brand = {
    ...DEFAULT_BRAND,
    businessName: brandBlock.businessName || branding.name || partner.name || '',
    tagline: brandBlock.tagline || '',
    description: brandBlock.description || '',
    logoUrl: brandBlock.logoUrl || branding.logoUrl || '',
    websiteUrl: brandBlock.websiteUrl || branding.domain || '',
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

  const funnelSettings = normalizeFunnelSettings((branding.funnel || {}) as Record<string, unknown>);

  return {
    partnerId: partner.id,
    funnelSlug: partner.slug,
    id: partner.id,
    name: partner.name,
    slug: partner.slug,
    status: partner.status,
    published: partner.status === 'active',
    brand,
    funnelSettings,
    checkout: {
      title: checkoutBlock.title || 'Activa tu servicio',
      subtitle: checkoutBlock.subtitle || 'Revisa los detalles de tu compra y completa el pago.',
      buttonText: checkoutBlock.buttonText || 'Activar mi servicio',
    },
    terms: {
      title: termsBlock.title || 'Términos y condiciones',
      text: termsBlock.text || '',
      required: termsBlock.required !== false,
    },
    additionalServices: Array.isArray(branding.additionalServices) ? branding.additionalServices : [],
    productOverrides: (branding.productOverrides || {}) as Record<string, unknown>,
  };
}

function buildStorefrontProducts(
  offers: Array<Record<string, unknown>>,
  overrides: Record<string, unknown>,
  slug: string,
) {
  return offers
    .map((offer) => {
      const product = offer.catalog_products as Record<string, unknown> | null;
      if (!product || product.active === false) return null;

      const override = (overrides[String(product.id)] || {}) as Record<string, unknown>;
      const price = offer.retail_price != null ? Number(offer.retail_price) : null;

      return {
        id: product.id,
        name: override.name || product.name,
        badge: override.badge || '',
        description: override.description || product.description || '',
        price,
        currency: offer.currency || product.currency || 'USD',
        interval: product.interval || null,
        showPrice: override.showPrice !== false && price != null,
        checkoutUrl: override.checkoutUrl || `#p/${slug}/checkout/${product.id}`,
        features: Array.isArray(override.features) ? override.features : [],
        status: 'active',
      };
    })
    .filter(Boolean);
}

async function loadPartnerOffer(
  supabase: ReturnType<typeof adminClient>,
  partnerId: string,
  productId: string,
) {
  const { data: offer, error } = await supabase
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
        currency,
        interval,
        billing_type,
        stripe_product_id,
        active
      )
    `)
    .eq('partner_id', partnerId)
    .eq('product_id', productId)
    .eq('active', true)
    .maybeSingle();

  if (error) throw error;
  if (!offer) throw new Error('PRODUCT_NOT_AVAILABLE');

  const product = offer.catalog_products as Record<string, unknown> | null;
  if (!product || product.active === false) throw new Error('PRODUCT_NOT_AVAILABLE');

  return { offer, product };
}

function buildCheckoutPayload(
  storefront: ReturnType<typeof normalizeStorefront>,
  offer: Record<string, unknown>,
  product: Record<string, unknown>,
) {
  const override = (storefront.productOverrides[String(product.id)] || {}) as Record<string, unknown>;
  const price = offer.retail_price != null ? Number(offer.retail_price) : null;

  return {
    partner: {
      businessName: storefront.brand.businessName,
      logoUrl: storefront.brand.logoUrl,
      supportEmail: storefront.brand.supportEmail,
      publicPhone: storefront.brand.publicContactPhone,
      whatsappNumber: storefront.brand.whatsappNumber,
      websiteUrl: storefront.brand.websiteUrl,
    },
    theme: {
      primaryColor: storefront.brand.primaryColor,
      secondaryColor: storefront.brand.secondaryColor,
      accentColor: storefront.brand.accentColor,
      backgroundColor: storefront.brand.backgroundColor,
      surfaceColor: '#FFFFFF',
      textColor: storefront.brand.textColor,
      mutedTextColor: '#64748B',
    },
    product: {
      id: product.id,
      name: override.name || product.name,
      description: override.description || product.description || '',
      price,
      currency: offer.currency || product.currency || 'USD',
      interval: product.interval || 'month',
      benefits: Array.isArray(override.features) ? override.features : [],
    },
    additionalServices: storefront.additionalServices,
    terms: storefront.terms,
    checkout: storefront.checkout,
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
    if (partner.status === 'inactive') throw new Error('PARTNER_NOT_PUBLISHED');

    const published = partner.status === 'active';
    const storefront = normalizeStorefront(partner);

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

      const products = buildStorefrontProducts(
        offers || [],
        storefront.productOverrides,
        String(partner.slug),
      );

      if (!storefront.funnelSettings.products.featuredProductId && products.length > 0) {
        storefront.funnelSettings.products.featuredProductId = String(products[0]?.id || '');
      }

      return json({
        storefront,
        products,
        published,
      });
    }

    if (action === 'submitLead') {
      const companyName = String(payload.companyName || payload.company || payload.name || '').trim();
      const email = String(payload.email || '').trim().toLowerCase();
      const phone = String(payload.phone || '').trim();
      const message = String(payload.message || '').trim();
      const productName = String(payload.productName || payload.product_name || '').trim();
      const contactName = String(payload.contactName || payload.name || '').trim();

      if (!companyName || !email) throw new Error('LEAD_FIELDS_REQUIRED');

      const { data: client, error: clientError } = await supabase
        .from('partner_clients')
        .insert({
          partner_id: partner.id,
          name: companyName,
          company_name: companyName,
          email,
          phone: phone || null,
          contact_name: contactName || null,
          status: 'pending',
          notes: [
            productName ? `Producto de interés: ${productName}` : null,
            message || null,
          ].filter(Boolean).join('\n') || null,
        })
        .select('id')
        .single();

      if (clientError) throw clientError;

      await supabase.from('platform_notifications').insert({
        partner_id: partner.id,
        recipient_role: 'partner',
        type: 'storefront.lead_created',
        title: 'Nuevo lead desde tu landing',
        body: `${companyName} dejó sus datos${productName ? ` por ${productName}` : ''}.`,
        metadata: {
          clientId: client.id,
          slug,
          email,
          companyName,
          contactName: contactName || null,
          productName: productName || null,
        },
      });

      await supabase.from('audit_logs').insert({
        action: 'storefront.lead_created',
        entity_type: 'partner_client',
        entity_id: client.id,
        metadata: { partnerId: partner.id, slug, productName },
      });

      return json({ ok: true, clientId: client.id }, 201);
    }

    if (action === 'getCheckout') {
      const productId = String(payload.productId || '').trim();
      if (!productId) throw new Error('PRODUCT_ID_REQUIRED');

      const { offer, product } = await loadPartnerOffer(supabase, String(partner.id), productId);
      const checkout = buildCheckoutPayload(storefront, offer, product);

      if (checkout.product.price == null || checkout.product.price <= 0) {
        throw new Error('PRODUCT_REQUIRES_CUSTOM_QUOTE');
      }

      return json({ checkout, published });
    }

    if (action === 'createCheckoutSession') {
      const productId = String(payload.productId || '').trim();
      const email = String(payload.email || '').trim().toLowerCase();
      const selectedServiceIds = Array.isArray(payload.selectedServiceIds)
        ? payload.selectedServiceIds.map(String)
        : [];

      if (!productId) throw new Error('PRODUCT_ID_REQUIRED');
      if (!email) throw new Error('CHECKOUT_EMAIL_REQUIRED');

      const { offer, product } = await loadPartnerOffer(supabase, String(partner.id), productId);
      const checkout = buildCheckoutPayload(storefront, offer, product);
      const retailPrice = Number(checkout.product.price || 0);
      const wholesalePrice = Number(product.wholesale_price || 0);

      if (!Number.isFinite(retailPrice) || retailPrice <= 0) {
        throw new Error('PRODUCT_REQUIRES_CUSTOM_QUOTE');
      }

      if (retailPrice < wholesalePrice) {
        throw new Error('PRICE_BELOW_WHOLESALE');
      }

      const stripeProductId = String(product.stripe_product_id || '');
      if (!stripeProductId) throw new Error('STRIPE_PRODUCT_NOT_CONFIGURED');

      const publicUrl = Deno.env.get('PUBLIC_APP_URL');
      if (!publicUrl) throw new Error('PUBLIC_APP_URL_NOT_CONFIGURED');

      const activeServices = (storefront.additionalServices as Array<Record<string, unknown>>)
        .filter(service => service.active !== false);
      const selectedServices = activeServices.filter(service =>
        selectedServiceIds.includes(String(service.id))
      );

      const oneTimeLineItems = selectedServices
        .filter(service => service.billingType === 'one_time')
        .map(service => ({
          name: String(service.title || 'Servicio adicional'),
          unitAmountCents: Math.round(Number(service.price || 0) * 100),
          currency: String(checkout.product.currency || 'USD'),
        }))
        .filter(item => item.unitAmountCents > 0);

      const { data: existingClient } = await supabase
        .from('partner_clients')
        .select('id, name, company_name, email, status')
        .eq('partner_id', partner.id)
        .eq('email', email)
        .maybeSingle();

      let client = existingClient;

      if (!client) {
        const clientName = email.split('@')[0] || 'Cliente storefront';
        const { data: createdClient, error: createClientError } = await supabase
          .from('partner_clients')
          .insert({
            partner_id: partner.id,
            name: clientName,
            company_name: clientName,
            email,
            status: 'pending',
            notes: `Checkout iniciado desde landing pública (${String(product.name)})`,
          })
          .select('id, name, company_name, email, status')
          .single();

        if (createClientError) throw createClientError;
        client = createdClient;
      }

      const clientName = client.company_name || client.name || email;
      const currency = String(checkout.product.currency || 'USD').toUpperCase();
      const interval = product.interval === 'year' ? 'year' : 'month';
      const commissionCents = Math.round((retailPrice - wholesalePrice) * 100);

      const metadata: Record<string, string> = {
        partner_id: String(partner.id),
        client_id: String(client.id),
        offer_id: String(offer.id),
        catalog_product_id: String(product.id),
        product_name: String(product.name),
        source: 'public_storefront_checkout',
        storefront_slug: slug,
        selected_services: JSON.stringify(selectedServiceIds),
        wholesale_cents: String(Math.round(wholesalePrice * 100)),
        commission_cents: String(Math.max(commissionCents, 0)),
        retail_cents: String(Math.round(retailPrice * 100)),
      };

      const session = await createStripeCheckoutSession({
        stripeProductId,
        interval,
        unitAmountCents: Math.round(retailPrice * 100),
        currency,
        successUrl: `${publicUrl}/#checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${publicUrl}/#p/${slug}/checkout/${productId}`,
        metadata,
        customerEmail: email,
        oneTimeLineItems,
      });

      await supabase.from('partner_offers').update({
        checkout_url: session.url,
        updated_at: new Date().toISOString(),
      }).eq('id', offer.id);

      await supabase.from('audit_logs').insert({
        action: 'storefront.checkout_started',
        entity_type: 'partner_client',
        entity_id: client.id,
        metadata: {
          partnerId: partner.id,
          slug,
          productId,
          email,
          sessionId: session.id,
          selectedServiceIds,
        },
      });

      return json({ url: session.url, sessionId: session.id });
    }

    throw new Error('UNKNOWN_ACTION');
  } catch (error) {
    return handleError(error);
  }
});
