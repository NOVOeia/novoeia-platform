export const DEFAULT_FUNNEL_SETTINGS = {
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
    posterUrl: '',
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
    items: [
      {
        id: 't1',
        name: 'Carlos Mendoza',
        role: 'Director Comercial',
        company: 'Constructora Mendoza',
        text: 'Antes perdíamos el 40% de nuestros leads por falta de seguimiento. Ahora tenemos 280 oportunidades organizadas y nuestro equipo cerró el mejor mes del año.',
        result: '+127% en cierres',
        avatar: 'CM',
      },
      {
        id: 't2',
        name: 'Valentina Ríos',
        role: 'Gerente de Ventas',
        company: 'Inmobiliaria Ríos & Asociados',
        text: 'Implementamos el CRM en una semana. Las automatizaciones de seguimiento por WhatsApp cambiaron todo. Los clientes sienten que los atendemos mejor.',
        result: '3x más conversiones',
        avatar: 'VR',
      },
      {
        id: 't3',
        name: 'Miguel Ángel Torres',
        role: 'CEO',
        company: 'Servicios Torres SAS',
        text: 'El onboarding fue increíble. En el primer mes ya teníamos todos nuestros procesos automatizados y el equipo no quería volver a trabajar sin el sistema.',
        result: '15 hrs/semana ahorradas',
        avatar: 'MT',
      },
    ],
  },
  noRisk: {
    enabled: true,
  },
};

export const MAX_PARTNER_ADDITIONAL_SERVICES = 4;

export const DEFAULT_CHECKOUT = {
  title: 'Activa tu servicio',
  subtitle: 'Revisa los detalles de tu compra y completa el pago.',
  buttonText: 'Activar mi servicio',
};

export const DEFAULT_TERMS = {
  title: 'Términos y condiciones',
  text: 'El servicio será prestado y administrado por tu agencia. La suscripción se renueva automáticamente según la frecuencia indicada.',
  required: true,
};

export function cloneFunnelSettings(settings) {
  const src = settings || {};
  const def = DEFAULT_FUNNEL_SETTINGS;

  return {
    hero: { ...def.hero, ...(src.hero || {}) },
    video: { ...def.video, ...(src.video || {}) },
    products: {
      ...def.products,
      ...(src.products || {}),
      visibleProductIds: [...(src.products?.visibleProductIds || [])],
    },
    contact: { ...def.contact, ...(src.contact || {}) },
    testimonials: {
      ...def.testimonials,
      ...(src.testimonials || {}),
      items: src.testimonials?.items
        ? src.testimonials.items.map(item => ({ ...item }))
        : def.testimonials.items.map(item => ({ ...item })),
    },
    noRisk: { ...def.noRisk, ...(src.noRisk || {}) },
  };
}

export function normalizeStoredFunnel(stored = {}) {
  if (stored?.hero) {
    return cloneFunnelSettings(stored);
  }

  return cloneFunnelSettings({
    hero: {
      titlePrefix: stored.title || DEFAULT_FUNNEL_SETTINGS.hero.titlePrefix,
      subtitle: stored.subtitle || DEFAULT_FUNNEL_SETTINGS.hero.subtitle,
      backgroundImageUrl: stored.heroImageUrl || '',
      primaryButtonText: stored.buttonText || DEFAULT_FUNNEL_SETTINGS.hero.primaryButtonText,
    },
    products: {
      showPrices: stored.showProductPrices !== false,
    },
    contact: {
      showForm: stored.showContactFormWithoutPrice !== false,
    },
  });
}

export function mapCatalogToAdminProduct(product) {
  if (!product?.id) return null;

  return {
    id: product.id,
    name: product.displayName || product.catalogName || product.name,
    description: product.displayDescription || product.catalogDescription || product.description || '',
    price: product.retailPrice ?? product.retail_price ?? null,
    currency: product.currency || 'USD',
    interval: product.interval || 'month',
    published: product.published !== false && product.retailPrice != null,
  };
}

export function mapOfferToAdminProduct(offer) {
  const product = offer?.catalog_products || offer?.catalogProducts || null;
  if (!product) return null;

  return {
    id: product.id,
    name: offer.display_name || product.name,
    description: offer.display_description || product.description || '',
    price: offer.retail_price ?? offer.retailPrice ?? null,
    currency: offer.currency || product.currency || 'USD',
    interval: product.interval || 'month',
  };
}
