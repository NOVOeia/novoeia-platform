import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, BarChart2, BarChart3, Bell, Bot, Calendar,
  CalendarCheck, Check, ChevronDown, ChevronRight, FileText,
  Inbox, Layers, LayoutDashboard, Mail, MessageCircle,
  Phone, Play, Send, Settings, Shield, ShieldCheck,
  Sparkles, Star, TrendingUp, Users, Workflow, X, Zap,
} from 'lucide-react';

// ─── DEFAULTS ────────────────────────────────────────────────────────────────

export const DEFAULT_BRAND = {
  businessName: 'Tu Agencia',
  tagline: 'Expertos en gestión comercial con tecnología',
  description:
    'Ayudamos a empresas a organizar, automatizar y escalar su proceso comercial con la plataforma más completa del mercado.',
  logoUrl: '',
  websiteUrl: '',
  supportEmail: 'hola@tuagencia.com',
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
  primaryColor: '#6D3AF2',
  secondaryColor: '#0A0F1E',
  accentColor: '#22C55E',
  backgroundColor: '#F7F8FC',
  textColor: '#111827',
};

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
    featuredProductId: 'crm-expansion',
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

export const DEFAULT_PRODUCTS = [
  {
    id: 'crm-growth',
    name: 'CRM Esencial',
    badge: 'Para comenzar',
    description:
      'Todo lo que necesitas para dejar de perder oportunidades y empezar a gestionar tus clientes como un equipo profesional.',
    price: 147,
    currency: 'USD',
    interval: 'month',
    showPrice: true,
    checkoutUrl: '#pago/esencial',
    features: [
      'CRM completo con pipeline visual',
      'Hasta 3 usuarios',
      'Bandeja unificada de conversaciones',
      'Automatizaciones de seguimiento',
      'Formularios y páginas de captura',
      'Calendario y agendamiento',
      'Reportes básicos de ventas',
      'Soporte por chat y correo',
    ],
  },
  {
    id: 'crm-expansion',
    name: 'CRM Profesional',
    badge: 'El más elegido',
    description:
      'La solución completa para empresas que quieren automatizar su proceso comercial de principio a fin y escalar sus ventas.',
    price: 247,
    currency: 'USD',
    interval: 'month',
    showPrice: true,
    checkoutUrl: '#pago/profesional',
    features: [
      'Todo lo de CRM Esencial',
      'Usuarios ilimitados',
      'Automatizaciones avanzadas y flujos complejos',
      'Múltiples pipelines simultáneos',
      'Campañas de email y SMS',
      'Integración con WhatsApp Business',
      'Reportes avanzados y dashboards',
      'Onboarding dedicado (4 sesiones)',
      'Soporte prioritario',
    ],
  },
  {
    id: 'crm-custom',
    name: 'Solución Enterprise',
    badge: 'Para operaciones grandes',
    description:
      'Configuración 100% personalizada para tu operación, con integraciones a medida y acompañamiento estratégico continuo.',
    price: null,
    currency: 'USD',
    interval: null,
    showPrice: false,
    checkoutUrl: '',
    features: [
      'Todo lo de CRM Profesional',
      'Auditoría de procesos comerciales',
      'Integraciones con sistemas existentes',
      'Automatizaciones y flujos a medida',
      'Capacitación completa al equipo',
      'Gerente de cuenta dedicado',
      'SLA de soporte garantizado',
      'Reuniones estratégicas mensuales',
    ],
  },
];

const PAIN_POINTS = [
  {
    before: 'Conversaciones perdidas en WhatsApp personal sin historial ni orden',
    after: 'Todas las conversaciones en un solo lugar, organizadas por cliente',
    iconBefore: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <rect x="2" y="3" width="20" height="16" rx="2" stroke="#ef4444" strokeWidth="1.5"/>
        <path d="M8 7h8M8 11h5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="18" cy="16" r="4" fill="#ef4444"/>
        <path d="M18 14v2l1 1" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    iconAfter: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <rect x="2" y="3" width="20" height="16" rx="2" stroke="#22C55E" strokeWidth="1.5"/>
        <path d="M6 8h12M6 12h8" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="18" cy="16" r="4" fill="#22C55E"/>
        <path d="M16 16l1.5 1.5L20 14" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    before: 'Leads en Excel, cuadernos y notas sin saber en qué estado está cada uno',
    after: 'Pipeline visual donde ves exactamente en qué etapa está cada oportunidad',
    iconBefore: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <rect x="3" y="3" width="18" height="14" rx="1.5" stroke="#ef4444" strokeWidth="1.5"/>
        <path d="M3 7h18" stroke="#ef4444" strokeWidth="1.5"/>
        <path d="M7 11h3M13 11h3M7 14h2M12 14h4" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M14 19l4-2M10 19l-4-2" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="12" cy="20" r="1.5" fill="#ef4444"/>
      </svg>
    ),
    iconAfter: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <rect x="2" y="5" width="4" height="15" rx="1.5" fill="rgba(34,197,94,.2)" stroke="#22C55E" strokeWidth="1.2"/>
        <rect x="8" y="9" width="4" height="11" rx="1.5" fill="rgba(34,197,94,.3)" stroke="#22C55E" strokeWidth="1.2"/>
        <rect x="14" y="7" width="4" height="13" rx="1.5" fill="rgba(34,197,94,.2)" stroke="#22C55E" strokeWidth="1.2"/>
        <rect x="20" y="3" width="4" height="17" rx="1.5" fill="rgba(34,197,94,.4)" stroke="#22C55E" strokeWidth="1.2"/>
        <path d="M2 22h22" stroke="#22C55E" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    before: 'Seguimientos olvidados y clientes que se enfrían sin respuesta a tiempo',
    after: 'Automatizaciones que mantienen cada lead caliente sin esfuerzo manual',
    iconBefore: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <circle cx="12" cy="12" r="9" stroke="#ef4444" strokeWidth="1.5"/>
        <path d="M12 7v5l3 2" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 20l1-3M17 20l-1-3" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="5" cy="21" r="1.5" fill="#ef4444"/>
        <circle cx="19" cy="21" r="1.5" fill="#ef4444"/>
      </svg>
    ),
    iconAfter: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="5" stroke="#22C55E" strokeWidth="1.5"/>
        <path d="M10 12l1.5 1.5L14 10" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16.5 7.5l1-1M6.5 16.5l-1 1M16.5 16.5l1 1M6.5 7.5l-1-1" stroke="#22C55E" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    before: 'Sin visibilidad de cuánto vendes ni por qué pierdes oportunidades en el proceso',
    after: 'Reportes en tiempo real que muestran exactamente dónde está el dinero',
    iconBefore: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <circle cx="12" cy="12" r="9" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2"/>
        <path d="M9 9l6 6M15 9l-6 6" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    iconAfter: (
      <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
        <path d="M3 17l5-5 4 3 5-7 4 2" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="8" cy="12" r="1.5" fill="#22C55E"/>
        <circle cx="12" cy="15" r="1.5" fill="#22C55E"/>
        <circle cx="17" cy="8" r="1.5" fill="#22C55E"/>
        <circle cx="21" cy="10" r="1.5" fill="#22C55E"/>
        <path d="M3 20h18" stroke="#22C55E" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const PLATFORM_FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'CRM y Pipeline',
    description: 'Visualiza cada oportunidad en un tablero Kanban. Arrastra, actualiza y nunca pierdas de vista ningún cliente.',
    detail: 'Etapas personalizadas, notas, archivos, historial completo.',
  },
  {
    icon: Workflow,
    title: 'Automatizaciones',
    description: 'Define reglas una vez y deja que el sistema trabaje por ti. Mensajes, tareas, notificaciones y más.',
    detail: 'Flujos visuales, condiciones, triggers por comportamiento.',
  },
  {
    icon: Inbox,
    title: 'Bandeja Unificada',
    description: 'WhatsApp, email, SMS, Facebook e Instagram en una sola pantalla. Tu equipo responde desde un lugar.',
    detail: 'Sin saltar entre apps. Todo el historial en el contacto.',
  },
  {
    icon: Calendar,
    title: 'Calendarios y Citas',
    description: 'Tu cliente agenda directamente en tu calendario. Sin idas y vueltas por WhatsApp para confirmar horarios.',
    detail: 'Recordatorios automáticos, integración con Google Calendar.',
  },
  {
    icon: FileText,
    title: 'Formularios y Páginas',
    description: 'Crea páginas de captura, formularios y surveys sin necesidad de programar. Los leads entran solos al CRM.',
    detail: 'Diseñador visual, dominio propio, A/B testing.',
  },
  {
    icon: BarChart3,
    title: 'Reportes y Analytics',
    description: 'Sabe en tiempo real cuánto entra, qué convierte y dónde se caen las oportunidades en tu proceso.',
    detail: 'Dashboards personalizados, exportación, métricas de equipo.',
  },
  {
    icon: Bot,
    title: 'Automatización con IA',
    description: 'Respuestas automáticas inteligentes, clasificación de leads y sugerencias para mejorar tu proceso comercial.',
    detail: 'GPT integrado, chatbots, scoring automático.',
  },
  {
    icon: Settings,
    title: 'Integraciones',
    description: 'Conecta con las herramientas que ya usas: Zapier, Stripe, Google Ads, Meta Ads, Calendly y más de 2,000 apps.',
    detail: 'API abierta, webhooks, Zapier nativo.',
  },
];

const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Elegimos tu plan',
    description: 'Conversamos sobre tu operación actual, tus objetivos y el tamaño de tu equipo. Te recomendamos el plan exacto que necesitas.',
    duration: 'Día 1',
    icon: Users,
    details: ['Diagnóstico de tu proceso actual', 'Definición de etapas del pipeline', 'Configuración de tu cuenta'],
  },
  {
    number: '02',
    title: 'Implementamos todo',
    description: 'Nosotros configuramos tu CRM con tu proceso, tus etapas, tus automatizaciones y conectamos tus canales de comunicación.',
    duration: 'Días 2-5',
    icon: Settings,
    details: ['Migración de datos existentes', 'Configuración de automatizaciones', 'Conexión de WhatsApp y correo'],
  },
  {
    number: '03',
    title: 'Capacitamos a tu equipo',
    description: 'Sesiones de onboarding en vivo donde tu equipo aprende a usar cada funcionalidad de forma práctica y sin tecnicismos.',
    duration: 'Semana 2',
    icon: Zap,
    details: ['Sesiones en vivo personalizadas', 'Material de soporte y guías', 'Práctica con casos reales'],
  },
  {
    number: '04',
    title: 'Operas y escalaas',
    description: 'Tu equipo ya opera en el sistema. Nosotros monitoreamos, optimizamos y estamos disponibles cuando nos necesitas.',
    duration: 'Continuo',
    icon: TrendingUp,
    details: ['Soporte continuo incluido', 'Optimizaciones mensuales', 'Nuevas automatizaciones a pedido'],
  },
];

const FAQ_ITEMS = [
  {
    question: '¿Cuánto tiempo toma implementar el sistema?',
    answer: 'La implementación básica toma entre 3 y 5 días hábiles. Tu equipo puede estar operando completamente en la segunda semana. Depende de la complejidad de tu proceso y la cantidad de datos a migrar.',
  },
  {
    question: '¿Tengo que pagar algo para comenzar?',
    answer: 'No. El modelo es simple: una vez que tu cuenta quede configurada y lista, empiezas a pagar la suscripción mensual. No hay costos de setup por adelantado ni sorpresas ocultas.',
  },
  {
    question: '¿Puedo migrar mis contactos y datos actuales?',
    answer: 'Sí. Si tienes tu base de datos en Excel, Google Sheets, otro CRM o cualquier formato, nosotros hacemos la migración. Ningún contacto se pierde en el proceso.',
  },
  {
    question: '¿Qué pasa con mi WhatsApp Business actual?',
    answer: 'Lo conectamos directamente al CRM. Todas las conversaciones de WhatsApp quedan centralizadas, con historial completo, asignadas al contacto correspondiente. Tu número sigue siendo el mismo.',
  },
  {
    question: '¿Cuántos usuarios puede tener mi equipo?',
    answer: 'Depende del plan. El plan Esencial incluye hasta 3 usuarios. El plan Profesional y Enterprise incluyen usuarios ilimitados, con roles y permisos personalizados para cada miembro del equipo.',
  },
  {
    question: '¿La plataforma puede crecer con mi empresa?',
    answer: 'Sí, está diseñada para eso. Puedes agregar nuevas automatizaciones, usuarios, integraciones y funcionalidades conforme crece tu operación. No tienes que migrar a otra plataforma cuando escales.',
  },
  {
    question: '¿Qué incluye el soporte y acompañamiento?',
    answer: 'Todos los planes incluyen soporte por chat y correo. El plan Profesional agrega soporte prioritario y sesiones de onboarding en vivo. El plan Enterprise incluye un gerente de cuenta dedicado.',
  },
  {
    question: '¿Puedo cancelar en cualquier momento?',
    answer: 'Sí. No hay contratos de permanencia. La suscripción es mensual y puedes cancelar cuando quieras sin penalizaciones. Creemos en la retención por resultados, no por contratos.',
  },
];

// ─── UTILITIES ───────────────────────────────────────────────────────────────

function mergeFunnelSettings(settings = {}) {
  const merged = { ...DEFAULT_FUNNEL_SETTINGS };
  const sections = ['hero', 'video', 'products', 'contact', 'testimonials', 'noRisk'];
  sections.forEach(key => {
    merged[key] = { ...DEFAULT_FUNNEL_SETTINGS[key], ...(settings[key] || {}) };
  });
  if (settings.testimonials?.items) {
    merged.testimonials.items = settings.testimonials.items;
  }
  return merged;
}

function formatMoney(value, currency = 'USD') {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function cleanPhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function normalizeVideoUrl(url = '') {
  if (!url) return '';
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`;
  // Already embed or other
  return url;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function PublicFunnelPage({
  brandData,
  funnelSettings,
  products,
  partnerId = 'partner-demo',
  funnelSlug = 'funnel-demo',
  onSubmitLead,
}) {
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [notice, setNotice] = useState({ text: '', type: '' });
  const [sending, setSending] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const observerRef = useRef(null);

  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '', message: '',
  });

  const brand = useMemo(
    () => ({ ...DEFAULT_BRAND, ...(brandData || {}) }),
    [brandData],
  );

  const settings = useMemo(
    () => mergeFunnelSettings(funnelSettings),
    [funnelSettings],
  );

  const availableProducts = useMemo(() => {
    const source = Array.isArray(products) && products.length ? products : DEFAULT_PRODUCTS;
    const visibleIds = settings.products.visibleProductIds || [];
    const filtered = visibleIds.length
      ? source.filter(p => visibleIds.includes(p.id))
      : source;
    return filtered.map(p => ({
      ...p,
      featured: p.id === settings.products.featuredProductId,
    }));
  }, [products, settings]);

  const theme = {
    '--fp': brand.primaryColor || DEFAULT_BRAND.primaryColor,
    '--fs': brand.secondaryColor || DEFAULT_BRAND.secondaryColor,
    '--fa': brand.accentColor || DEFAULT_BRAND.accentColor,
    '--fb': brand.backgroundColor || DEFAULT_BRAND.backgroundColor,
    '--ft': brand.textColor || DEFAULT_BRAND.textColor,
  };

  const heroStyle = settings.hero.backgroundImageUrl
    ? {
        backgroundImage: `linear-gradient(rgba(10,15,30,${settings.hero.backgroundOverlay / 100}),rgba(10,15,30,${settings.hero.backgroundOverlay / 100})),url("${settings.hero.backgroundImageUrl}")`,
        backgroundPosition: settings.hero.backgroundPosition,
        backgroundSize: 'cover',
      }
    : undefined;

  // floating contact logic
  const hasWhatsApp = Boolean(brand.whatsappNumber);
  const hasEmail = Boolean(brand.supportEmail);
  const preferred = settings.contact.preferredChannel;
  const showFloating = settings.contact.showFloatingContact && (hasWhatsApp || hasEmail);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('fp-visible');
          observerRef.current?.unobserve(e.target);
        }
      }),
      { threshold: 0.1 },
    );
    document.querySelectorAll('[data-fp-reveal]').forEach(el =>
      observerRef.current?.observe(el),
    );
    return () => observerRef.current?.disconnect();
  }, []);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  function requestInfo(product) {
    setSelectedProduct(product.name);
    scrollTo('contacto');
  }

  function updateForm(field, value) {
    setForm(c => ({ ...c, [field]: value }));
  }

  async function submitLead(e) {
    e.preventDefault();
    setNotice({ text: '', type: '' });
    if (!form.name.trim() || !form.email.trim()) {
      setNotice({ text: 'Por favor completa tu nombre y correo.', type: 'error' });
      return;
    }
    setSending(true);
    const payload = {
      partner_id: partnerId,
      funnel_slug: funnelSlug,
      product_name: selectedProduct || null,
      name: form.name.trim(),
      company: form.company.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      message: form.message.trim(),
      source: 'public_funnel',
    };
    try {
      if (onSubmitLead) {
        await onSubmitLead(payload);
      } else {
        console.log('Lead payload:', payload);
        await new Promise(r => setTimeout(r, 800));
      }
      setNotice({
        text: `¡Gracias ${form.name}! Tu mensaje fue enviado. El equipo de ${brand.businessName} te contactará pronto.`,
        type: 'success',
      });
      setForm({ name: '', company: '', email: '', phone: '', message: '' });
      setSelectedProduct('');
    } catch (error) {
      setNotice({
        text: error?.message || 'No fue posible enviar tu mensaje. Intenta de nuevo.',
        type: 'error',
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fp-root" style={theme}>
      <style>{CSS}</style>

      {/* HEADER */}
      <header className="fp-header">
        <div className="fp-container fp-header-inner">
          <FPLogo brand={brand} />
          <nav className="fp-nav">
            <button onClick={() => scrollTo('problema')}>¿Por qué?</button>
            <button onClick={() => scrollTo('como-funciona')}>Cómo funciona</button>
            <button onClick={() => scrollTo('planes')}>Planes</button>
            <button onClick={() => scrollTo('contacto')}>Contacto</button>
          </nav>
          <HeaderCTA brand={brand} preferred={preferred} />
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="fp-hero" style={heroStyle}>
          <div className="fp-hero-bg-pattern" />
          <div className="fp-container fp-hero-grid">
            <div className="fp-hero-content">
              <div className="fp-eyebrow">
                <Sparkles size={12} />
                {settings.hero.eyebrow}
              </div>
              <h1 className="fp-hero-title">
                <span>{settings.hero.titlePrefix} </span>
                <strong className="fp-highlight">{settings.hero.titleHighlight}</strong>
                {settings.hero.titleSuffix && <span> {settings.hero.titleSuffix}</span>}
              </h1>
              <p className="fp-hero-sub">{settings.hero.subtitle}</p>
              <div className="fp-hero-actions">
                <button className="fp-btn-primary" onClick={() => scrollTo('planes')}>
                  {settings.hero.primaryButtonText}
                  <ArrowRight size={16} />
                </button>
                <button className="fp-btn-ghost" onClick={() => scrollTo('como-funciona')}>
                  <Play size={14} fill="currentColor" />
                  {settings.hero.secondaryButtonText}
                </button>
              </div>
              <div className="fp-hero-trust">
                <span><ShieldCheck size={14} /> Sin costo inicial</span>
                <span><Zap size={14} /> Listo en 5 días</span>
                <span><Star size={14} /> Soporte incluido</span>
              </div>
            </div>
            {settings.hero.showDashboardPreview && (
              <div className="fp-dashboard-preview">
                <DashboardMockup brand={brand} />
              </div>
            )}
          </div>
        </section>

        {/* SOCIAL PROOF BAR */}
        <div className="fp-proof-bar">
          <div className="fp-container fp-proof-inner">
            <div className="fp-proof-stat">
              <strong>+2,400</strong><span>empresas gestionadas</span>
            </div>
            <div className="fp-proof-divider" />
            <div className="fp-proof-stat">
              <strong>87%</strong><span>aumentan conversiones el primer mes</span>
            </div>
            <div className="fp-proof-divider" />
            <div className="fp-proof-stat">
              <strong>5 días</strong><span>tiempo promedio de implementación</span>
            </div>
            <div className="fp-proof-divider" />
            <div className="fp-proof-stat">
              <strong>4.9★</strong><span>satisfacción promedio</span>
            </div>
          </div>
        </div>

        {/* DOLOR */}
        <section className="fp-pain" id="problema">
          <div className="fp-container">
            <div className="fp-section-head" data-fp-reveal>
              <div className="fp-label">EL PROBLEMA REAL</div>
              <h2 className="fp-section-title">
                ¿Tu proceso de ventas<br />
                <strong className="fp-highlight">depende de tu memoria?</strong>
              </h2>
              <p className="fp-section-desc">
                Si alguna vez dijiste "ese lead lo tengo en WhatsApp" o "no sé en qué quedamos con ese cliente",
                tu negocio está dejando dinero sobre la mesa todos los días.
              </p>
            </div>
            <div className="fp-pain-grid">
              {PAIN_POINTS.map((item, i) => (
                <div key={i} className="fp-pain-card" data-fp-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="fp-pain-before">
                    <div className="fp-pain-icon-wrap fp-pain-icon-bad">{item.iconBefore}</div>
                    <div className="fp-pain-label-bad">Antes</div>
                    <p>{item.before}</p>
                  </div>
                  <div className="fp-pain-arrow">
                    <ChevronRight size={20} />
                  </div>
                  <div className="fp-pain-after">
                    <div className="fp-pain-icon-wrap fp-pain-icon-good">{item.iconAfter}</div>
                    <div className="fp-pain-label-good">Con el CRM</div>
                    <p>{item.after}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PLATAFORMA: FEATURES */}
        <section className="fp-platform" id="plataforma">
          <div className="fp-container">
            <div className="fp-section-head" data-fp-reveal>
              <div className="fp-label">LA PLATAFORMA</div>
              <h2 className="fp-section-title">
                Todo lo que tu equipo necesita,<br />
                <strong className="fp-highlight">en un solo lugar</strong>
              </h2>
              <p className="fp-section-desc">
                No es solo un CRM. Es el sistema nervioso de tu operación comercial.
              </p>
            </div>
            <div className="fp-features-layout">
              <div className="fp-features-grid">
                {PLATFORM_FEATURES.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={i}
                      className={`fp-feature-btn ${activeFeature === i ? 'fp-feature-btn-active' : ''}`}
                      onClick={() => setActiveFeature(i)}
                    >
                      <span className="fp-feature-btn-icon"><Icon size={18} /></span>
                      <strong>{item.title}</strong>
                    </button>
                  );
                })}
              </div>
              <div className="fp-feature-detail" data-fp-reveal>
                {(() => {
                  const f = PLATFORM_FEATURES[activeFeature];
                  const Icon = f.icon;
                  return (
                    <div className="fp-feature-detail-inner">
                      <div className="fp-feature-detail-icon"><Icon size={28} /></div>
                      <h3>{f.title}</h3>
                      <p>{f.description}</p>
                      <div className="fp-feature-detail-chip">{f.detail}</div>
                      <div className="fp-feature-mockup">
                        <FeatureMockup index={activeFeature} brand={brand} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </section>

        {/* VIDEO */}
        {settings.video.enabled && (
          <section className="fp-video" id="video">
            <div className="fp-container">
              <div className="fp-video-grid" data-fp-reveal>
                <div className="fp-video-info">
                  <div className="fp-label fp-label-light">CONOCE LA PLATAFORMA</div>
                  <h2 className="fp-section-title fp-title-light">
                    <span>{settings.video.titlePrefix} </span>
                    <strong className="fp-highlight">{settings.video.titleHighlight}</strong>
                    {settings.video.titleSuffix && <span> {settings.video.titleSuffix}</span>}
                  </h2>
                  <p className="fp-video-desc">{settings.video.description}</p>
                  <ul className="fp-video-bullets">
                    {[
                      'Sin curva de aprendizaje técnica',
                      'Tu equipo lo domina en horas',
                      'Resultados desde la primera semana',
                      'Soporte experto incluido siempre',
                    ].map(b => (
                      <li key={b}><Check size={15} />{b}</li>
                    ))}
                  </ul>
                </div>
                <div className="fp-video-player">
                  {settings.video.url ? (
                    <iframe
                      src={normalizeVideoUrl(settings.video.url)}
                      title="Presentación del CRM"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="fp-video-placeholder">
                      <div className="fp-play-btn">
                        <Play size={32} fill="currentColor" />
                      </div>
                      <p>Video de presentación</p>
                      <small>El equipo de {brand.businessName} lo añadirá pronto</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PROCESO */}
        <section className="fp-process" id="como-funciona">
          <div className="fp-container">
            <div className="fp-section-head" data-fp-reveal>
              <div className="fp-label">EL PROCESO</div>
              <h2 className="fp-section-title">
                De cero al sistema funcionando<br />
                <strong className="fp-highlight">en menos de una semana</strong>
              </h2>
            </div>
            <div className="fp-process-grid">
              {PROCESS_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="fp-process-card" data-fp-reveal style={{ transitionDelay: `${i * 100}ms` }}>
                    <div className="fp-process-top">
                      <div className="fp-process-num">{step.number}</div>
                      <div className="fp-process-badge">{step.duration}</div>
                    </div>
                    <div className="fp-process-icon-wrap"><Icon size={22} /></div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                    <ul className="fp-process-details">
                      {step.details.map(d => (
                        <li key={d}><Check size={12} />{d}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PLANES */}
        <section className="fp-plans" id="planes">
          <div className="fp-container">
            <div className="fp-section-head" data-fp-reveal>
              <div className="fp-label">PLANES Y PRECIOS</div>
              <h2 className="fp-section-title">
                <span>{settings.products.sectionTitlePrefix} </span>
                <strong className="fp-highlight">{settings.products.sectionTitleHighlight}</strong>
                {settings.products.sectionTitleSuffix && <span> {settings.products.sectionTitleSuffix}</span>}
              </h2>
              <p className="fp-section-desc">{settings.products.sectionDescription}</p>
            </div>
            <div className={`fp-plans-grid fp-plans-grid-${availableProducts.length}`}>
              {availableProducts.map((product, i) => {
                const showPrice =
                  settings.products.showPrices &&
                  product.showPrice !== false &&
                  product.price != null;
                return (
                  <div
                    key={product.id}
                    className={`fp-plan-card ${product.featured ? 'fp-plan-featured' : ''}`}
                    data-fp-reveal
                    style={{ transitionDelay: `${i * 90}ms` }}
                  >
                    {product.featured && (
                      <div className="fp-plan-ribbon">
                        <Sparkles size={12} /> {product.badge}
                      </div>
                    )}
                    {!product.featured && (
                      <div className="fp-plan-badge">{product.badge}</div>
                    )}
                    <h3 className="fp-plan-name">{product.name}</h3>
                    <p className="fp-plan-desc">{product.description}</p>
                    <ul className="fp-plan-features">
                      {(product.features || []).map(f => (
                        <li key={f}><Check size={14} />{f}</li>
                      ))}
                    </ul>
                    <div className="fp-plan-footer">
                      {showPrice ? (
                        <>
                          <div className="fp-plan-price">
                            <strong>{formatMoney(product.price, product.currency)}</strong>
                            <span>/{product.interval === 'year' ? 'año' : 'mes'}</span>
                          </div>
                          <a className="fp-btn-plan" href={product.checkoutUrl || `#p/${funnelSlug}/checkout/${product.id}`}>
                            Comenzar ahora <ArrowRight size={15} />
                          </a>
                        </>
                      ) : (
                        <>
                          <div className="fp-plan-custom-label">Precio personalizado</div>
                          <button className="fp-btn-plan fp-btn-plan-outline" onClick={() => requestInfo(product)}>
                            Solicitar propuesta <ArrowRight size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SIN RIESGO */}
        {settings.noRisk?.enabled && (
          <section className="fp-norisk">
            <div className="fp-container fp-norisk-inner" data-fp-reveal>
              <div className="fp-norisk-icon"><Shield size={36} /></div>
              <div className="fp-norisk-content">
                <h2>Comienzas cuando tu cliente paga. <strong className="fp-highlight">Sin riesgo para ti.</strong></h2>
                <p>
                  Nuestro modelo está diseñado para que puedas vender el servicio a tu cliente antes de asumir cualquier costo.
                  Una vez que tu cliente realiza el primer pago, activamos todo: la cuenta, las automatizaciones, el onboarding.
                  Tú cobras tu servicio, tu cliente obtiene su sistema. Todos ganan.
                </p>
                <div className="fp-norisk-chips">
                  <span><Check size={14} /> Sin contrato de permanencia</span>
                  <span><Check size={14} /> Sin pago por adelantado</span>
                  <span><Check size={14} /> Cancela cuando quieras</span>
                  <span><Check size={14} /> Onboarding incluido siempre</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TESTIMONIOS */}
        {settings.testimonials?.enabled && settings.testimonials?.items?.length > 0 && (
          <section className="fp-testimonials">
            <div className="fp-container">
              <div className="fp-section-head" data-fp-reveal>
                <div className="fp-label">RESULTADOS REALES</div>
                <h2 className="fp-section-title">
                  Lo que dicen las empresas que<br />
                  <strong className="fp-highlight">ya dan el paso</strong>
                </h2>
              </div>
              <div className="fp-testimonials-grid">
                {settings.testimonials.items.map((t, i) => (
                  <div key={t.id} className="fp-testimonial-card" data-fp-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                    <div className="fp-testimonial-result">{t.result}</div>
                    <blockquote>"{t.text}"</blockquote>
                    <div className="fp-testimonial-author">
                      <div className="fp-testimonial-avatar">{t.avatar}</div>
                      <div>
                        <strong>{t.name}</strong>
                        <span>{t.role} · {t.company}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="fp-faq">
          <div className="fp-container fp-faq-inner">
            <div className="fp-section-head" data-fp-reveal>
              <div className="fp-label">PREGUNTAS FRECUENTES</div>
              <h2 className="fp-section-title">
                Resolvemos tus dudas<br />
                <strong className="fp-highlight">antes de que las tengas</strong>
              </h2>
            </div>
            <div className="fp-faq-list">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className={`fp-faq-item ${openFaq === i ? 'fp-faq-open' : ''}`}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{item.question}</span>
                    <ChevronDown size={18} />
                  </button>
                  <div className="fp-faq-answer">
                    <p>{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="fp-cta-final">
          <div className="fp-container fp-cta-final-inner" data-fp-reveal>
            <div className="fp-label fp-label-light">¿LISTO PARA EMPEZAR?</div>
            <h2>
              Deja de perder clientes por no tener<br />
              <strong className="fp-highlight">el sistema correcto</strong>
            </h2>
            <p>Agenda una llamada hoy. En 30 minutos te mostramos cómo funciona y diseñamos el plan exacto para tu operación.</p>
            <div className="fp-cta-final-actions">
              <button className="fp-btn-primary fp-btn-large" onClick={() => scrollTo('contacto')}>
                Quiero comenzar ahora <ArrowRight size={18} />
              </button>
              {brand.whatsappNumber && (
                <a
                  className="fp-btn-whatsapp"
                  href={`https://wa.me/${cleanPhone(brand.whatsappNumber)}?text=Hola, me interesa conocer más sobre el CRM`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle size={18} />
                  Hablar por WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>

        {/* CONTACTO */}
        {settings.contact.showForm && (
          <section className="fp-contact" id="contacto">
            <div className="fp-container fp-contact-grid">
              <div className="fp-contact-info" data-fp-reveal>
                <div className="fp-label">HABLEMOS</div>
                <h2 className="fp-section-title">
                  <span>{settings.contact.titlePrefix} </span>
                  <strong className="fp-highlight">{settings.contact.titleHighlight}</strong>
                  {settings.contact.titleSuffix && <span> {settings.contact.titleSuffix}</span>}
                </h2>
                <p>Completa el formulario y el equipo de <strong>{brand.businessName}</strong> te responde en menos de 24 horas.</p>
                <ContactLinks brand={brand} preferred={preferred} />
              </div>
              <form className="fp-contact-form" onSubmit={submitLead}>
                {notice.text && (
                  <div className={`fp-notice fp-notice-${notice.type}`}>
                    {notice.type === 'success' ? <Check size={15} /> : null}
                    {notice.text}
                  </div>
                )}
                <div className="fp-form-row">
                  <FormField label="Nombre *" value={form.name} onChange={v => updateForm('name', v)} />
                  <FormField label="Empresa" value={form.company} onChange={v => updateForm('company', v)} />
                  <FormField label="Correo electrónico *" type="email" value={form.email} onChange={v => updateForm('email', v)} />
                  <FormField label="Teléfono / WhatsApp" value={form.phone} onChange={v => updateForm('phone', v)} />
                </div>
                <label className="fp-field fp-field-full">
                  <span>Producto de interés</span>
                  <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                    <option value="">Selecciona un plan</option>
                    {availableProducts.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </label>
                <label className="fp-field fp-field-full">
                  <span>Cuéntanos sobre tu negocio</span>
                  <textarea rows={4} value={form.message} onChange={e => updateForm('message', e.target.value)} placeholder="¿Cuántas personas tiene tu equipo de ventas? ¿Qué herramientas usas hoy?" />
                </label>
                {/* honeypot */}
                <input type="text" name="_hp" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
                <button type="submit" className="fp-btn-primary fp-btn-submit" disabled={sending}>
                  <Send size={16} />
                  {sending ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="fp-footer">
        <div className="fp-container">
          <div className="fp-footer-grid">
            <div className="fp-footer-brand">
              <FPLogo brand={brand} light />
              <p>{brand.description}</p>
              <FooterSocials brand={brand} />
            </div>
            <div className="fp-footer-col">
              <strong>Contacto</strong>
              {brand.supportEmail && <a href={`mailto:${brand.supportEmail}`}><Mail size={13} />{brand.supportEmail}</a>}
              {brand.publicContactPhone && <a href={`tel:${brand.publicContactPhone}`}><Phone size={13} />{brand.publicContactPhone}</a>}
              {brand.whatsappNumber && (
                <a href={`https://wa.me/${cleanPhone(brand.whatsappNumber)}`} target="_blank" rel="noreferrer">
                  <MessageCircle size={13} />WhatsApp
                </a>
              )}
              {brand.websiteUrl && <a href={brand.websiteUrl} target="_blank" rel="noreferrer">Sitio web</a>}
            </div>
            <div className="fp-footer-col">
              <strong>Navegación</strong>
              <button onClick={() => scrollTo('problema')}>¿Por qué un CRM?</button>
              <button onClick={() => scrollTo('como-funciona')}>Cómo funciona</button>
              <button onClick={() => scrollTo('planes')}>Planes</button>
              <button onClick={() => scrollTo('contacto')}>Contactar</button>
            </div>
          </div>
          <div className="fp-footer-bottom">
            {brand.address && <span>{brand.address}{brand.city ? `, ${brand.city}` : ''}</span>}
            <span>Tecnología proporcionada por <strong>NOVO Enterprise</strong></span>
          </div>
        </div>
      </footer>

      {/* FLOATING WIDGET */}
      {showFloating && (
        <FloatingWidget
          brand={brand}
          preferred={preferred}
          hasWhatsApp={hasWhatsApp}
          hasEmail={hasEmail}
        />
      )}
    </div>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function FPLogo({ brand, light = false }) {
  if (brand.logoUrl) {
    return (
      <img
        className={`fp-logo ${light ? 'fp-logo-light' : ''}`}
        src={brand.logoUrl}
        alt={brand.businessName}
      />
    );
  }
  return (
    <div className={`fp-brand-mark ${light ? 'fp-brand-mark-light' : ''}`}>
      <span>{brand.businessName?.charAt(0) || 'N'}</span>
      <div>
        <strong>{brand.businessName}</strong>
        <small>{brand.tagline}</small>
      </div>
    </div>
  );
}

function HeaderCTA({ brand, preferred }) {
  const hasWhatsApp = Boolean(brand.whatsappNumber);
  const hasEmail = Boolean(brand.supportEmail);
  if (preferred === 'whatsapp' && hasWhatsApp) {
    return (
      <a
        className="fp-header-cta"
        href={`https://wa.me/${cleanPhone(brand.whatsappNumber)}?text=Hola, me interesa el CRM`}
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircle size={15} /> WhatsApp
      </a>
    );
  }
  if (preferred === 'email' && hasEmail) {
    return (
      <a className="fp-header-cta" href={`mailto:${brand.supportEmail}`}>
        <Mail size={15} /> Escribenos
      </a>
    );
  }
  if (hasWhatsApp) {
    return (
      <a
        className="fp-header-cta"
        href={`https://wa.me/${cleanPhone(brand.whatsappNumber)}`}
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircle size={15} /> WhatsApp
      </a>
    );
  }
  if (hasEmail) {
    return (
      <a className="fp-header-cta" href={`mailto:${brand.supportEmail}`}>
        <Mail size={15} /> Contactar
      </a>
    );
  }
  return null;
}

function ContactLinks({ brand, preferred }) {
  return (
    <div className="fp-contact-links">
      {brand.whatsappNumber && (
        <a
          href={`https://wa.me/${cleanPhone(brand.whatsappNumber)}?text=Hola, me interesa conocer más`}
          target="_blank"
          rel="noreferrer"
          className={preferred === 'whatsapp' ? 'fp-link-preferred' : ''}
        >
          <MessageCircle size={16} />
          <div>
            <strong>WhatsApp</strong>
            <small>{brand.whatsappNumber}</small>
          </div>
        </a>
      )}
      {brand.supportEmail && (
        <a
          href={`mailto:${brand.supportEmail}`}
          className={preferred === 'email' ? 'fp-link-preferred' : ''}
        >
          <Mail size={16} />
          <div>
            <strong>Correo electrónico</strong>
            <small>{brand.supportEmail}</small>
          </div>
        </a>
      )}
      {brand.publicContactPhone && (
        <a href={`tel:${brand.publicContactPhone}`}>
          <Phone size={16} />
          <div>
            <strong>Teléfono</strong>
            <small>{brand.publicContactPhone}</small>
          </div>
        </a>
      )}
    </div>
  );
}

function FooterSocials({ brand }) {
  const socials = [
    { url: brand.instagramUrl, label: 'Instagram' },
    { url: brand.facebookUrl, label: 'Facebook' },
    { url: brand.linkedinUrl, label: 'LinkedIn' },
    { url: brand.tiktokUrl, label: 'TikTok' },
  ].filter(s => s.url);
  if (!socials.length) return null;
  return (
    <div className="fp-footer-socials">
      {socials.map(s => (
        <a key={s.label} href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
      ))}
    </div>
  );
}

function FloatingWidget({ brand, preferred, hasWhatsApp, hasEmail }) {
  const [open, setOpen] = useState(false);

  // Determine icon based on preferred channel availability
  const showWhatsAppFirst =
    (preferred === 'whatsapp' && hasWhatsApp) ||
    (preferred === 'email' && !hasEmail && hasWhatsApp);

  return (
    <div className="fp-float">
      {open && (
        <div className="fp-float-menu">
          <div className="fp-float-menu-title">¿Cómo prefieres que te contactemos?</div>
          {/* Preferred channel first */}
          {showWhatsAppFirst && hasWhatsApp && (
            <a
              className="fp-float-option fp-float-option-wa"
              href={`https://wa.me/${cleanPhone(brand.whatsappNumber)}?text=Hola, me interesa el servicio de CRM`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} />
              <div>
                <strong>WhatsApp</strong>
                <small>Respuesta en minutos</small>
              </div>
            </a>
          )}
          {!showWhatsAppFirst && hasEmail && (
            <a className="fp-float-option fp-float-option-mail" href={`mailto:${brand.supportEmail}`}>
              <Mail size={18} />
              <div>
                <strong>Correo electrónico</strong>
                <small>{brand.supportEmail}</small>
              </div>
            </a>
          )}
          {/* Secondary channel */}
          {showWhatsAppFirst && hasEmail && (
            <a className="fp-float-option" href={`mailto:${brand.supportEmail}`}>
              <Mail size={18} />
              <div>
                <strong>Correo</strong>
                <small>{brand.supportEmail}</small>
              </div>
            </a>
          )}
          {!showWhatsAppFirst && hasWhatsApp && (
            <a
              className="fp-float-option"
              href={`https://wa.me/${cleanPhone(brand.whatsappNumber)}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} />
              <div>
                <strong>WhatsApp</strong>
                <small>Respuesta rápida</small>
              </div>
            </a>
          )}
        </div>
      )}
      <button
        className="fp-float-btn"
        aria-label="Contactar"
        onClick={() => setOpen(c => !c)}
      >
        {open
          ? <X size={22} />
          : showWhatsAppFirst
            ? <MessageCircle size={22} />
            : <Mail size={22} />
        }
      </button>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text' }) {
  return (
    <label className="fp-field">
      <span>{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

function DashboardMockup({ brand }) {
  return (
    <div className="fp-dash">
      <div className="fp-dash-topbar">
        <div className="fp-dash-dots">
          <span /><span /><span />
        </div>
        <div className="fp-dash-title">{brand.businessName} · CRM</div>
        <div className="fp-dash-user" />
      </div>
      <div className="fp-dash-body">
        <div className="fp-dash-sidebar">
          {[LayoutDashboard, Users, BarChart3, MessageCircle, Calendar, Settings].map((Icon, i) => (
            <div key={i} className={`fp-dash-nav-item ${i === 0 ? 'fp-dash-nav-active' : ''}`}>
              <Icon size={15} />
            </div>
          ))}
        </div>
        <div className="fp-dash-main">
          <div className="fp-dash-stats">
            {[
              { label: 'Leads', value: '1,248' },
              { label: 'Activos', value: '86' },
              { label: 'Tasa', value: '24%' },
            ].map(s => (
              <div key={s.label} className="fp-dash-stat">
                <small>{s.label}</small>
                <strong>{s.value}</strong>
              </div>
            ))}
          </div>
          <div className="fp-dash-chart">
            {[35, 60, 45, 80, 65, 90, 72, 88].map((h, i) => (
              <div key={i} className="fp-dash-bar" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="fp-dash-pipeline">
            {['Nuevo', 'Contactado', 'Propuesta', 'Cerrado'].map((stage, i) => (
              <div key={stage} className="fp-dash-stage">
                <small>{stage}</small>
                <div className="fp-dash-cards">
                  {[...Array(i === 0 ? 3 : i === 1 ? 2 : i === 2 ? 2 : 1)].map((_, j) => (
                    <div key={j} className="fp-dash-card-item" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureMockup({ index, brand }) {
  const mockups = [
    // Pipeline
    <div className="fp-mockup-pipeline">
      {['Nuevo lead', 'En contacto', 'Propuesta enviada', 'Negociación'].map((s, i) => (
        <div key={s} className="fp-mock-col">
          <div className="fp-mock-col-header">{s}<span>{[4,3,2,1][i]}</span></div>
          {[...Array([2,2,1,1][i])].map((_, j) => (
            <div key={j} className="fp-mock-card">
              <div className="fp-mock-card-line" />
              <div className="fp-mock-card-line fp-mock-card-line-sm" />
            </div>
          ))}
        </div>
      ))}
    </div>,
    // Automatizaciones
    <div className="fp-mockup-flow">
      {['Trigger: Nuevo Lead', 'Esperar 1h', 'Enviar WhatsApp', 'Crear tarea', 'Mover pipeline'].map((s, i) => (
        <div key={s} className="fp-mock-flow-step">
          <div className={`fp-mock-flow-node ${i === 0 ? 'fp-mock-node-trigger' : i === 2 ? 'fp-mock-node-action' : ''}`}>{s}</div>
          {i < 4 && <div className="fp-mock-flow-arrow" />}
        </div>
      ))}
    </div>,
    // Bandeja
    <div className="fp-mockup-inbox">
      {[
        { name: 'María García', ch: 'WhatsApp', msg: 'Hola, ¿tienen disponibilidad?', time: '2m', unread: true },
        { name: 'Juan López', ch: 'Email', msg: 'Necesito una propuesta', time: '15m', unread: true },
        { name: 'Ana Martínez', ch: 'WhatsApp', msg: 'Perfecto, ¿cuándo empezamos?', time: '1h', unread: false },
      ].map(m => (
        <div key={m.name} className={`fp-mock-msg ${m.unread ? 'fp-mock-msg-unread' : ''}`}>
          <div className="fp-mock-avatar">{m.name[0]}</div>
          <div className="fp-mock-msg-body">
            <div className="fp-mock-msg-top">
              <strong>{m.name}</strong>
              <span className="fp-mock-ch">{m.ch}</span>
              <small>{m.time}</small>
            </div>
            <p>{m.msg}</p>
          </div>
        </div>
      ))}
    </div>,
    // Calendario — placeholder visual simple
    <div className="fp-mockup-cal">
      <div className="fp-mock-cal-header">Agosto 2025</div>
      <div className="fp-mock-cal-grid">
        {[...Array(28)].map((_, i) => (
          <div key={i} className={`fp-mock-cal-day ${[3,8,12,15,20].includes(i) ? 'fp-mock-cal-event' : ''}`}>
            {i + 1}
          </div>
        ))}
      </div>
    </div>,
    // Formularios
    <div className="fp-mockup-form">
      <div className="fp-mock-form-title">Formulario de contacto</div>
      {['Nombre completo', 'Correo electrónico', 'Teléfono', 'Mensaje'].map(f => (
        <div key={f} className="fp-mock-form-field">
          <div className="fp-mock-form-label">{f}</div>
          <div className="fp-mock-form-input" />
        </div>
      ))}
      <div className="fp-mock-form-btn">Enviar</div>
    </div>,
    // Reportes
    <div className="fp-mockup-reports">
      <div className="fp-mock-chart-bars">
        {[40, 65, 52, 80, 70, 92, 75, 88].map((h, i) => (
          <div key={i} className="fp-mock-bar-wrap">
            <div className="fp-mock-bar" style={{ height: `${h}%` }} />
          </div>
        ))}
      </div>
      <div className="fp-mock-metrics">
        {[{ l: 'Conversión', v: '24%' }, { l: 'Ticket promedio', v: '$2,400' }, { l: 'Ciclo ventas', v: '8 días' }].map(m => (
          <div key={m.l} className="fp-mock-metric">
            <strong>{m.v}</strong><small>{m.l}</small>
          </div>
        ))}
      </div>
    </div>,
    // IA
    <div className="fp-mockup-ai">
      <div className="fp-mock-ai-bubble fp-mock-ai-user">¿Cómo va el pipeline esta semana?</div>
      <div className="fp-mock-ai-bubble fp-mock-ai-bot">
        <span className="fp-mock-ai-icon"><Bot size={12} /></span>
        Tienes 12 oportunidades activas. 3 llevan más de 5 días sin actividad. Te recomiendo hacer seguimiento hoy.
      </div>
      <div className="fp-mock-ai-bubble fp-mock-ai-user">Recuérdame las de mayor valor</div>
      <div className="fp-mock-ai-bubble fp-mock-ai-bot">
        <span className="fp-mock-ai-icon"><Bot size={12} /></span>
        Empresa ABC ($4,200), Tech SAS ($3,800), Grupo XYZ ($2,900)
      </div>
    </div>,
    // Integraciones
    <div className="fp-mockup-integrations">
      {['Zapier', 'Stripe', 'Google Ads', 'Meta Ads', 'WhatsApp', 'Calendly', 'Gmail', 'Slack'].map(app => (
        <div key={app} className="fp-mock-app-chip">{app}</div>
      ))}
    </div>,
  ];
  return mockups[index] || mockups[0];
}

// ─── CSS ─────────────────────────────────────────────────────────────────────

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  .fp-root {
    min-height: 100vh;
    overflow-x: hidden;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: var(--fb);
    color: var(--ft);
    --radius: 16px;
    --radius-sm: 10px;
    --shadow: 0 20px 60px rgba(10,15,30,.1);
    --shadow-md: 0 8px 24px rgba(10,15,30,.08);
    --transition: .3s cubic-bezier(.4,0,.2,1);
  }

  button, input, select, textarea { font: inherit; }
  a { text-decoration: none; }
  img { max-width: 100%; }

  [data-fp-reveal] {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity .65s ease, transform .65s ease;
  }
  [data-fp-reveal].fp-visible {
    opacity: 1;
    transform: none;
  }

  /* CONTAINER */
  .fp-container { width: min(1200px, calc(100% - 48px)); margin: 0 auto; }

  /* LABEL */
  .fp-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--fp) 12%, transparent);
    color: var(--fp);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .08em;
    margin-bottom: 16px;
  }
  .fp-label-light {
    background: rgba(255,255,255,.15);
    color: rgba(255,255,255,.9);
  }

  /* SECTION HEAD */
  .fp-section-head { text-align: center; max-width: 680px; margin: 0 auto 56px; }
  .fp-section-title {
    font-size: clamp(28px, 4vw, 42px);
    font-weight: 800;
    line-height: 1.18;
    color: var(--ft);
    margin-bottom: 16px;
    letter-spacing: -.02em;
  }
  .fp-title-light { color: white; }
  .fp-section-desc { color: #64748b; font-size: 16px; line-height: 1.7; }
  .fp-highlight {
    color: var(--fp);
    font-weight: 900;
    position: relative;
  }

  /* BUTTONS */
  .fp-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 26px;
    border: 0;
    border-radius: var(--radius-sm);
    background: var(--fp);
    color: white;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: var(--transition);
    box-shadow: 0 10px 32px color-mix(in srgb, var(--fp) 35%, transparent);
  }
  .fp-btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .fp-btn-large { padding: 16px 32px; font-size: 16px; }
  .fp-btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 22px;
    border: 1.5px solid rgba(255,255,255,.25);
    border-radius: var(--radius-sm);
    background: rgba(255,255,255,.08);
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    backdrop-filter: blur(8px);
  }
  .fp-btn-ghost:hover { background: rgba(255,255,255,.15); }

  /* HEADER */
  .fp-header {
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid rgba(15,23,42,.07);
    background: rgba(255,255,255,.9);
    backdrop-filter: blur(20px);
  }
  .fp-header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    min-height: 72px;
  }
  .fp-nav { display: flex; gap: 4px; }
  .fp-nav button {
    padding: 8px 14px;
    border: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    color: #64748b;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
  }
  .fp-nav button:hover { background: color-mix(in srgb, var(--fp) 8%, transparent); color: var(--fp); }
  .fp-header-cta {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 10px 18px;
    border-radius: var(--radius-sm);
    background: var(--fp);
    color: white;
    font-size: 13px;
    font-weight: 700;
    transition: var(--transition);
    white-space: nowrap;
  }
  .fp-header-cta:hover { filter: brightness(1.1); }

  /* LOGO / BRAND MARK */
  .fp-logo { max-width: 160px; max-height: 44px; object-fit: contain; }
  .fp-logo-light { filter: brightness(0) invert(1); }
  .fp-brand-mark { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .fp-brand-mark > span {
    width: 40px; height: 40px;
    display: grid; place-items: center;
    border-radius: 11px;
    background: var(--fp);
    color: white;
    font-size: 18px;
    font-weight: 900;
    flex-shrink: 0;
  }
  .fp-brand-mark > div { display: grid; gap: 1px; }
  .fp-brand-mark strong { font-size: 14px; }
  .fp-brand-mark small { color: #94a3b8; font-size: 9px; }
  .fp-brand-mark-light > div strong { color: white; }
  .fp-brand-mark-light > div small { color: rgba(255,255,255,.5); }

  /* HERO */
  .fp-hero {
    position: relative;
    min-height: 88vh;
    display: flex;
    align-items: center;
    background: var(--fs);
    overflow: hidden;
  }
  .fp-hero-bg-pattern {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 20% 50%, color-mix(in srgb, var(--fp) 18%, transparent) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, color-mix(in srgb, var(--fa) 12%, transparent) 0%, transparent 45%),
      linear-gradient(135deg, transparent 40%, color-mix(in srgb, var(--fp) 6%, transparent) 100%);
    pointer-events: none;
  }
  .fp-hero-grid {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
    padding: 80px 0;
  }
  .fp-hero-content { display: grid; gap: 20px; }
  .fp-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 14px;
    border-radius: 999px;
    background: rgba(255,255,255,.1);
    border: 1px solid rgba(255,255,255,.15);
    color: rgba(255,255,255,.85);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .08em;
    width: fit-content;
  }
  .fp-hero-title {
    font-size: clamp(36px, 5vw, 58px);
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -.03em;
    color: white;
  }
  .fp-hero-title .fp-highlight {
    color: var(--fp);
    display: inline-block;
    background: linear-gradient(135deg, var(--fp), color-mix(in srgb, var(--fp) 70%, var(--fa)));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .fp-hero-sub { color: rgba(255,255,255,.72); font-size: 17px; line-height: 1.65; max-width: 500px; }
  .fp-hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
  .fp-hero-trust {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    margin-top: 4px;
  }
  .fp-hero-trust span {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(255,255,255,.55);
    font-size: 12px;
    font-weight: 600;
  }

  /* DASHBOARD PREVIEW */
  .fp-dashboard-preview { display: flex; align-items: center; justify-content: center; }
  .fp-dash {
    width: 100%;
    max-width: 500px;
    border-radius: 16px;
    overflow: hidden;
    background: #1e2533;
    border: 1px solid rgba(255,255,255,.08);
    box-shadow: 0 40px 100px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.05);
    transform: perspective(1000px) rotateY(-4deg) rotateX(2deg);
  }
  .fp-dash-topbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: #151b27;
    border-bottom: 1px solid rgba(255,255,255,.06);
  }
  .fp-dash-dots { display: flex; gap: 5px; }
  .fp-dash-dots span {
    width: 9px; height: 9px; border-radius: 50%;
    background: rgba(255,255,255,.15);
  }
  .fp-dash-dots span:nth-child(1) { background: #ff5f57; }
  .fp-dash-dots span:nth-child(2) { background: #febc2e; }
  .fp-dash-dots span:nth-child(3) { background: #28c840; }
  .fp-dash-title { color: rgba(255,255,255,.4); font-size: 10px; flex: 1; text-align: center; }
  .fp-dash-user { width: 20px; height: 20px; border-radius: 50%; background: var(--fp); opacity: .7; }
  .fp-dash-body { display: flex; height: 280px; }
  .fp-dash-sidebar {
    width: 44px;
    background: #151b27;
    border-right: 1px solid rgba(255,255,255,.06);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px 0;
  }
  .fp-dash-nav-item {
    width: 32px; height: 32px;
    display: grid; place-items: center;
    border-radius: 8px;
    color: rgba(255,255,255,.25);
    cursor: pointer;
  }
  .fp-dash-nav-active {
    background: color-mix(in srgb, var(--fp) 20%, transparent);
    color: var(--fp);
  }
  .fp-dash-main { flex: 1; padding: 12px; display: flex; flex-direction: column; gap: 10px; overflow: hidden; }
  .fp-dash-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; }
  .fp-dash-stat {
    background: rgba(255,255,255,.04);
    border-radius: 8px;
    padding: 8px;
    border: 1px solid rgba(255,255,255,.06);
  }
  .fp-dash-stat small { display: block; color: rgba(255,255,255,.35); font-size: 7px; margin-bottom: 2px; }
  .fp-dash-stat strong { color: white; font-size: 14px; }
  .fp-dash-chart { display: flex; align-items: flex-end; gap: 3px; height: 60px; }
  .fp-dash-bar {
    flex: 1;
    background: color-mix(in srgb, var(--fp) 60%, transparent);
    border-radius: 3px 3px 0 0;
    transition: .3s;
  }
  .fp-dash-bar:nth-child(even) { background: color-mix(in srgb, var(--fp) 35%, transparent); }
  .fp-dash-pipeline { display: grid; grid-template-columns: repeat(4,1fr); gap: 4px; flex: 1; }
  .fp-dash-stage { display: flex; flex-direction: column; gap: 3px; }
  .fp-dash-stage small { color: rgba(255,255,255,.3); font-size: 7px; }
  .fp-dash-cards { display: flex; flex-direction: column; gap: 3px; }
  .fp-dash-card-item {
    height: 20px;
    background: rgba(255,255,255,.06);
    border-radius: 4px;
    border: 1px solid rgba(255,255,255,.08);
  }

  /* PROOF BAR */
  .fp-proof-bar { background: white; border-bottom: 1px solid rgba(15,23,42,.07); }
  .fp-proof-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 20px 0;
    flex-wrap: wrap;
  }
  .fp-proof-stat { display: flex; flex-direction: column; align-items: center; padding: 8px 32px; }
  .fp-proof-stat strong { font-size: 22px; font-weight: 900; color: var(--fp); }
  .fp-proof-stat span { font-size: 11px; color: #64748b; font-weight: 500; text-align: center; }
  .fp-proof-divider { width: 1px; height: 36px; background: #e2e8f0; }

  /* PAIN */
  .fp-pain { padding: 100px 0; background: var(--fb); }
  .fp-pain-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
  .fp-pain-card {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 16px;
    padding: 24px;
    border-radius: var(--radius);
    background: white;
    border: 1px solid rgba(15,23,42,.07);
    box-shadow: var(--shadow-md);
    transition: var(--transition);
  }
  .fp-pain-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
  .fp-pain-icon-wrap {
    width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 12px;
    margin-bottom: 10px;
    flex-shrink: 0;
  }
  .fp-pain-icon-bad { background: #fef2f2; }
  .fp-pain-icon-good { background: color-mix(in srgb, var(--fa) 10%, transparent); }
  .fp-pain-label-bad {
    font-size: 9px; font-weight: 800; letter-spacing: .06em;
    color: #ef4444; margin-bottom: 6px;
    padding: 3px 8px; border-radius: 4px;
    background: #fef2f2; width: fit-content;
  }
  .fp-pain-label-good {
    font-size: 9px; font-weight: 800; letter-spacing: .06em;
    color: var(--fa); margin-bottom: 6px;
    padding: 3px 8px; border-radius: 4px;
    background: color-mix(in srgb, var(--fa) 10%, transparent); width: fit-content;
  }
  .fp-pain-before p, .fp-pain-after p { font-size: 13px; line-height: 1.55; color: var(--ft); font-weight: 500; }
  .fp-pain-arrow { color: #cbd5e1; }
  .fp-pain-after { position: relative; }
  .fp-pain-check { color: var(--fa); position: absolute; top: 0; right: 0; }

  /* PLATFORM */
  .fp-platform { padding: 100px 0; background: white; }
  .fp-features-layout { display: grid; grid-template-columns: 300px 1fr; gap: 28px; align-items: start; }
  .fp-features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }
  .fp-feature-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px 10px;
    border: 1.5px solid transparent;
    border-radius: var(--radius-sm);
    background: var(--fb);
    text-align: center;
    cursor: pointer;
    transition: var(--transition);
    color: #64748b;
  }
  .fp-feature-btn:hover { background: white; border-color: rgba(15,23,42,.08); color: var(--ft); }
  .fp-feature-btn-active {
    background: white !important;
    border-color: color-mix(in srgb, var(--fp) 30%, transparent) !important;
    color: var(--fp) !important;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--fp) 10%, transparent);
  }
  .fp-feature-btn-active .fp-feature-btn-icon { background: var(--fp); color: white; }
  .fp-feature-btn-icon {
    width: 40px; height: 40px;
    display: grid; place-items: center;
    border-radius: 10px;
    background: #f1f5f9;
    color: #64748b;
    flex-shrink: 0;
    transition: var(--transition);
  }
  .fp-feature-btn strong { font-size: 11px; font-weight: 700; line-height: 1.3; }
  .fp-feature-detail {
    position: sticky;
    top: 90px;
    border-radius: var(--radius);
    background: var(--fb);
    border: 1px solid rgba(15,23,42,.07);
    overflow: hidden;
    min-height: 440px;
  }
  .fp-feature-detail-inner { padding: 32px; }
  .fp-feature-detail-icon {
    width: 52px; height: 52px;
    display: grid; place-items: center;
    border-radius: 14px;
    background: color-mix(in srgb, var(--fp) 12%, transparent);
    color: var(--fp);
    margin-bottom: 16px;
  }
  .fp-feature-detail-inner h3 { font-size: 22px; font-weight: 800; margin-bottom: 10px; }
  .fp-feature-detail-inner > p { color: #64748b; font-size: 15px; line-height: 1.65; margin-bottom: 12px; }
  .fp-feature-detail-chip {
    display: inline-flex;
    padding: 5px 12px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--fp) 10%, transparent);
    color: var(--fp);
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  .fp-feature-mockup {
    border-radius: 12px;
    background: white;
    border: 1px solid rgba(15,23,42,.08);
    padding: 16px;
    min-height: 160px;
    overflow: hidden;
  }

  /* Feature mockup internals */
  .fp-mockup-pipeline { display: flex; gap: 8px; overflow-x: auto; }
  .fp-mock-col { min-width: 120px; }
  .fp-mock-col-header {
    display: flex; align-items: center; justify-content: space-between;
    font-size: 9px; font-weight: 700; color: #64748b; margin-bottom: 6px;
  }
  .fp-mock-col-header span {
    background: #f1f5f9; border-radius: 4px;
    padding: 1px 5px; font-size: 8px;
  }
  .fp-mock-card {
    background: white; border: 1px solid #e2e8f0;
    border-radius: 6px; padding: 8px; margin-bottom: 4px;
  }
  .fp-mock-card-line { height: 6px; background: #e2e8f0; border-radius: 3px; margin-bottom: 4px; }
  .fp-mock-card-line-sm { width: 60%; }

  .fp-mockup-flow { display: flex; flex-direction: column; gap: 0; align-items: flex-start; }
  .fp-mock-flow-step { display: flex; flex-direction: column; align-items: flex-start; }
  .fp-mock-flow-node {
    padding: 6px 12px; border-radius: 6px;
    background: #f8fafc; border: 1px solid #e2e8f0;
    font-size: 10px; font-weight: 600; color: #334155;
  }
  .fp-mock-node-trigger { background: color-mix(in srgb, var(--fp) 10%, transparent); border-color: color-mix(in srgb, var(--fp) 30%, transparent); color: var(--fp); }
  .fp-mock-node-action { background: color-mix(in srgb, var(--fa) 10%, transparent); border-color: color-mix(in srgb, var(--fa) 30%, transparent); color: #15803d; }
  .fp-mock-flow-arrow { width: 2px; height: 14px; background: #cbd5e1; margin-left: 20px; }

  .fp-mockup-inbox { display: flex; flex-direction: column; gap: 6px; }
  .fp-mock-msg {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 8px; border-radius: 8px;
    border: 1px solid #f1f5f9; background: white;
  }
  .fp-mock-msg-unread { border-color: color-mix(in srgb, var(--fp) 20%, transparent); }
  .fp-mock-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--fp); color: white;
    display: grid; place-items: center; font-size: 11px; font-weight: 700; flex-shrink: 0;
  }
  .fp-mock-msg-body { flex: 1; min-width: 0; }
  .fp-mock-msg-top { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }
  .fp-mock-msg-top strong { font-size: 10px; }
  .fp-mock-msg-top small { color: #94a3b8; font-size: 9px; margin-left: auto; }
  .fp-mock-ch { padding: 1px 5px; border-radius: 3px; background: #f1f5f9; font-size: 8px; color: #64748b; }
  .fp-mock-msg-body p { font-size: 9px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .fp-mockup-cal {}
  .fp-mock-cal-header { font-size: 11px; font-weight: 700; margin-bottom: 8px; color: var(--ft); }
  .fp-mock-cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 3px; }
  .fp-mock-cal-day {
    aspect-ratio: 1;
    display: grid; place-items: center;
    font-size: 9px; border-radius: 4px;
    color: #64748b;
  }
  .fp-mock-cal-event { background: color-mix(in srgb, var(--fp) 15%, transparent); color: var(--fp); font-weight: 700; }

  .fp-mockup-form {}
  .fp-mock-form-title { font-size: 11px; font-weight: 700; margin-bottom: 10px; }
  .fp-mock-form-field { margin-bottom: 8px; }
  .fp-mock-form-label { font-size: 8px; color: #64748b; margin-bottom: 3px; }
  .fp-mock-form-input { height: 22px; border-radius: 4px; background: #f8fafc; border: 1px solid #e2e8f0; }
  .fp-mock-form-btn {
    margin-top: 8px; padding: 6px 14px;
    border-radius: 5px; background: var(--fp);
    color: white; font-size: 9px; font-weight: 700; width: fit-content;
  }

  .fp-mockup-reports { display: flex; flex-direction: column; gap: 12px; }
  .fp-mock-chart-bars { display: flex; align-items: flex-end; gap: 4px; height: 80px; }
  .fp-mock-bar-wrap { flex: 1; height: 100%; display: flex; align-items: flex-end; }
  .fp-mock-bar { width: 100%; background: color-mix(in srgb, var(--fp) 55%, transparent); border-radius: 3px 3px 0 0; }
  .fp-mock-metrics { display: flex; gap: 12px; }
  .fp-mock-metric { display: flex; flex-direction: column; gap: 2px; }
  .fp-mock-metric strong { font-size: 15px; font-weight: 800; color: var(--fp); }
  .fp-mock-metric small { font-size: 9px; color: #64748b; }

  .fp-mockup-ai { display: flex; flex-direction: column; gap: 6px; }
  .fp-mock-ai-bubble {
    max-width: 90%;
    padding: 8px 12px;
    border-radius: 10px;
    font-size: 10px;
    line-height: 1.5;
  }
  .fp-mock-ai-user { background: color-mix(in srgb, var(--fp) 10%, transparent); align-self: flex-end; color: var(--ft); }
  .fp-mock-ai-bot { background: #f8fafc; border: 1px solid #e2e8f0; align-self: flex-start; display: flex; gap: 6px; align-items: flex-start; }
  .fp-mock-ai-icon { color: var(--fp); flex-shrink: 0; margin-top: 1px; }

  .fp-mockup-integrations { display: flex; flex-wrap: wrap; gap: 6px; }
  .fp-mock-app-chip {
    padding: 5px 10px;
    border-radius: 6px;
    background: #f1f5f9;
    font-size: 10px;
    font-weight: 600;
    color: #334155;
    border: 1px solid #e2e8f0;
  }

  /* VIDEO */
  .fp-video { padding: 100px 0; background: var(--fs); }
  .fp-video-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
  .fp-video-info { display: grid; gap: 20px; }
  .fp-video-desc { color: rgba(255,255,255,.65); font-size: 15px; line-height: 1.65; }
  .fp-video-bullets { display: grid; gap: 10px; list-style: none; }
  .fp-video-bullets li { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,.75); font-size: 14px; }
  .fp-video-bullets li svg { color: var(--fa); flex-shrink: 0; }
  .fp-video-player {
    border-radius: var(--radius);
    overflow: hidden;
    aspect-ratio: 16/9;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.08);
    box-shadow: 0 40px 80px rgba(0,0,0,.4);
  }
  .fp-video-player iframe { width: 100%; height: 100%; border: 0; }
  .fp-video-placeholder {
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 12px; color: rgba(255,255,255,.5);
  }
  .fp-play-btn {
    width: 72px; height: 72px;
    display: grid; place-items: center;
    border-radius: 50%;
    background: rgba(255,255,255,.1);
    color: white;
    border: 2px solid rgba(255,255,255,.2);
    transition: var(--transition);
    cursor: pointer;
  }
  .fp-play-btn:hover { background: var(--fp); border-color: var(--fp); transform: scale(1.05); }
  .fp-video-placeholder p { font-size: 15px; font-weight: 600; color: rgba(255,255,255,.7); }
  .fp-video-placeholder small { font-size: 12px; color: rgba(255,255,255,.4); }

  /* PROCESS */
  .fp-process { padding: 100px 0; background: white; }
  .fp-process-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
  .fp-process-card {
    padding: 28px;
    border-radius: var(--radius);
    background: var(--fb);
    border: 1px solid rgba(15,23,42,.07);
    transition: var(--transition);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .fp-process-card:hover { transform: translateY(-4px); box-shadow: var(--shadow); }
  .fp-process-top { display: flex; align-items: center; justify-content: space-between; }
  .fp-process-num { font-size: 11px; font-weight: 900; color: var(--fp); letter-spacing: .06em; }
  .fp-process-badge {
    font-size: 9px; font-weight: 700; color: #64748b;
    padding: 3px 8px; border-radius: 999px; background: white;
    border: 1px solid #e2e8f0;
  }
  .fp-process-icon-wrap {
    width: 44px; height: 44px;
    display: grid; place-items: center;
    border-radius: 12px;
    background: color-mix(in srgb, var(--fp) 10%, transparent);
    color: var(--fp);
  }
  .fp-process-card h3 { font-size: 16px; font-weight: 800; }
  .fp-process-card > p { font-size: 13px; color: #64748b; line-height: 1.6; flex: 1; }
  .fp-process-details { display: flex; flex-direction: column; gap: 6px; list-style: none; }
  .fp-process-details li { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #64748b; }
  .fp-process-details li svg { color: var(--fa); flex-shrink: 0; }

  /* PLANS */
  .fp-plans { padding: 100px 0; background: var(--fb); }
  .fp-plans-grid { display: grid; gap: 20px; }
  .fp-plans-grid-1 { grid-template-columns: 1fr; max-width: 440px; margin: 0 auto; }
  .fp-plans-grid-2 { grid-template-columns: repeat(2,1fr); max-width: 900px; margin: 0 auto; }
  .fp-plans-grid-3 { grid-template-columns: repeat(3,1fr); }
  .fp-plan-card {
    display: flex;
    flex-direction: column;
    padding: 32px;
    border-radius: var(--radius);
    background: white;
    border: 1.5px solid rgba(15,23,42,.08);
    transition: var(--transition);
    position: relative;
  }
  .fp-plan-card:hover { transform: translateY(-4px); box-shadow: var(--shadow); }
  .fp-plan-featured {
    border-color: var(--fp);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--fp) 15%, transparent), var(--shadow);
    background: white;
  }
  .fp-plan-ribbon {
    position: absolute;
    top: -14px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 16px;
    border-radius: 999px;
    background: var(--fp);
    color: white;
    font-size: 10px;
    font-weight: 800;
    white-space: nowrap;
  }
  .fp-plan-badge {
    font-size: 10px; font-weight: 700;
    color: #64748b; margin-bottom: 12px;
  }
  .fp-plan-name { font-size: 22px; font-weight: 800; margin-bottom: 8px; }
  .fp-plan-desc { font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 20px; }
  .fp-plan-features { display: flex; flex-direction: column; gap: 10px; flex: 1; list-style: none; margin-bottom: 24px; }
  .fp-plan-features li { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #334155; }
  .fp-plan-features li svg { color: var(--fa); flex-shrink: 0; margin-top: 1px; }
  .fp-plan-footer { margin-top: auto; }
  .fp-plan-price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 14px; }
  .fp-plan-price strong { font-size: 34px; font-weight: 900; }
  .fp-plan-price span { font-size: 13px; color: #64748b; }
  .fp-plan-custom-label { font-size: 14px; font-weight: 700; color: var(--fp); margin-bottom: 14px; }
  .fp-btn-plan {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 14px;
    border: 0;
    border-radius: var(--radius-sm);
    background: var(--fp);
    color: white;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: var(--transition);
    box-shadow: 0 8px 24px color-mix(in srgb, var(--fp) 30%, transparent);
  }
  .fp-btn-plan:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .fp-btn-plan-outline {
    background: transparent;
    border: 2px solid var(--fp);
    color: var(--fp);
    box-shadow: none;
  }
  .fp-btn-plan-outline:hover { background: color-mix(in srgb, var(--fp) 8%, transparent); }

  /* NO RISK */
  .fp-norisk { padding: 80px 0; background: var(--fs); }
  .fp-norisk-inner {
    display: flex;
    align-items: center;
    gap: 48px;
    padding: 48px;
    border-radius: 24px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.08);
  }
  .fp-norisk-icon {
    width: 80px; height: 80px; flex-shrink: 0;
    display: grid; place-items: center;
    border-radius: 20px;
    background: color-mix(in srgb, var(--fa) 15%, transparent);
    color: var(--fa);
    border: 1px solid color-mix(in srgb, var(--fa) 25%, transparent);
  }
  .fp-norisk-content h2 { font-size: clamp(22px, 3vw, 34px); font-weight: 800; color: white; line-height: 1.2; margin-bottom: 14px; }
  .fp-norisk-content p { color: rgba(255,255,255,.65); font-size: 15px; line-height: 1.7; margin-bottom: 20px; }
  .fp-norisk-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .fp-norisk-chips span {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 14px; border-radius: 999px;
    background: rgba(255,255,255,.08);
    color: rgba(255,255,255,.8);
    font-size: 11px; font-weight: 600;
    border: 1px solid rgba(255,255,255,.1);
  }
  .fp-norisk-chips svg { color: var(--fa); }

  /* TESTIMONIALS */
  .fp-testimonials { padding: 100px 0; background: white; }
  .fp-testimonials-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
  .fp-testimonial-card {
    padding: 28px;
    border-radius: var(--radius);
    background: var(--fb);
    border: 1px solid rgba(15,23,42,.07);
    transition: var(--transition);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .fp-testimonial-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
  .fp-testimonial-result {
    display: inline-flex;
    padding: 5px 12px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--fa) 12%, transparent);
    color: #15803d;
    font-size: 11px;
    font-weight: 800;
    width: fit-content;
  }
  .fp-testimonial-card blockquote {
    font-size: 14px;
    color: #334155;
    line-height: 1.7;
    font-style: italic;
    flex: 1;
  }
  .fp-testimonial-author { display: flex; align-items: center; gap: 12px; }
  .fp-testimonial-avatar {
    width: 40px; height: 40px; flex-shrink: 0;
    border-radius: 50%;
    background: var(--fp);
    color: white;
    display: grid; place-items: center;
    font-size: 14px; font-weight: 800;
  }
  .fp-testimonial-author strong { display: block; font-size: 13px; }
  .fp-testimonial-author span { font-size: 11px; color: #94a3b8; }

  /* FAQ */
  .fp-faq { padding: 100px 0; background: var(--fb); }
  .fp-faq-inner { display: grid; grid-template-columns: 1fr 1.5fr; gap: 80px; align-items: start; }
  .fp-faq-list { display: flex; flex-direction: column; }
  .fp-faq-item { border-bottom: 1px solid rgba(15,23,42,.08); }
  .fp-faq-item button {
    display: flex; align-items: center; justify-content: space-between;
    width: 100%; padding: 20px 0;
    border: 0; background: transparent;
    font-size: 15px; font-weight: 700; text-align: left;
    cursor: pointer; color: var(--ft);
    gap: 16px;
  }
  .fp-faq-item button span { flex: 1; }
  .fp-faq-item button svg { flex-shrink: 0; transition: transform .25s ease; color: #94a3b8; }
  .fp-faq-open button svg { transform: rotate(180deg); color: var(--fp); }
  .fp-faq-answer {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows .3s ease;
  }
  .fp-faq-open .fp-faq-answer { grid-template-rows: 1fr; }
  .fp-faq-answer > p {
    overflow: hidden;
    min-height: 0;
    padding-bottom: 0;
    font-size: 14px;
    color: #64748b;
    line-height: 1.7;
    transition: padding-bottom .3s ease;
  }
  .fp-faq-open .fp-faq-answer > p { padding-bottom: 20px; }

  /* CTA FINAL */
  .fp-cta-final { padding: 100px 0; background: var(--fs); }
  .fp-cta-final-inner {
    text-align: center;
    max-width: 700px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  .fp-cta-final-inner h2 { font-size: clamp(28px, 4vw, 44px); font-weight: 900; color: white; line-height: 1.15; }
  .fp-cta-final-inner > p { color: rgba(255,255,255,.65); font-size: 16px; line-height: 1.7; }
  .fp-cta-final-actions { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
  .fp-btn-whatsapp {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 16px 28px;
    border: 2px solid rgba(255,255,255,.2);
    border-radius: var(--radius-sm);
    background: rgba(255,255,255,.08);
    color: white;
    font-size: 16px; font-weight: 700;
    backdrop-filter: blur(8px);
    transition: var(--transition);
  }
  .fp-btn-whatsapp:hover { background: #25d366; border-color: #25d366; }

  /* CONTACT */
  .fp-contact { padding: 100px 0; background: white; }
  .fp-contact-grid { display: grid; grid-template-columns: .9fr 1.1fr; gap: 80px; align-items: start; }
  .fp-contact-info { display: grid; gap: 16px; }
  .fp-contact-info > p { color: #64748b; font-size: 15px; line-height: 1.65; }
  .fp-contact-links { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
  .fp-contact-links a {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 16px;
    border-radius: var(--radius-sm);
    border: 1px solid rgba(15,23,42,.08);
    background: var(--fb);
    color: var(--ft);
    font-size: 13px;
    transition: var(--transition);
  }
  .fp-contact-links a:hover { border-color: var(--fp); color: var(--fp); }
  .fp-link-preferred { border-color: color-mix(in srgb, var(--fp) 30%, transparent) !important; background: color-mix(in srgb, var(--fp) 5%, transparent) !important; }
  .fp-contact-links svg { color: var(--fp); flex-shrink: 0; }
  .fp-contact-links strong { display: block; font-size: 13px; font-weight: 700; }
  .fp-contact-links small { font-size: 11px; color: #94a3b8; }
  .fp-contact-form {
    padding: 36px;
    border-radius: var(--radius);
    background: var(--fb);
    border: 1px solid rgba(15,23,42,.07);
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .fp-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
  .fp-field {
    display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;
  }
  .fp-field-full { grid-column: 1 / -1; }
  .fp-field > span { font-size: 11px; font-weight: 700; color: #334155; }
  .fp-field input, .fp-field select, .fp-field textarea {
    width: 100%; padding: 12px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: var(--radius-sm);
    background: white;
    color: var(--ft);
    font-size: 14px;
    outline: none;
    transition: border-color .2s;
  }
  .fp-field input:focus, .fp-field select:focus, .fp-field textarea:focus {
    border-color: var(--fp);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--fp) 12%, transparent);
  }
  .fp-field textarea { resize: vertical; }
  .fp-notice {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 14px 16px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 16px;
  }
  .fp-notice-success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
  .fp-notice-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .fp-btn-submit {
    width: 100%;
    justify-content: center;
    margin-top: 4px;
    padding: 15px;
    font-size: 15px;
  }
  .fp-btn-submit:disabled { opacity: .7; cursor: wait; }

  /* FOOTER */
  .fp-footer { padding: 64px 0 32px; background: var(--fs); }
  .fp-footer-grid { display: grid; grid-template-columns: 1.6fr 1fr 1fr; gap: 48px; margin-bottom: 40px; }
  .fp-footer-brand { display: flex; flex-direction: column; gap: 14px; }
  .fp-footer-brand > p { color: rgba(255,255,255,.45); font-size: 13px; line-height: 1.65; }
  .fp-footer-socials { display: flex; gap: 12px; }
  .fp-footer-socials a { color: rgba(255,255,255,.4); font-size: 11px; font-weight: 600; transition: var(--transition); }
  .fp-footer-socials a:hover { color: white; }
  .fp-footer-col { display: flex; flex-direction: column; gap: 10px; }
  .fp-footer-col > strong { display: block; font-size: 12px; font-weight: 800; color: rgba(255,255,255,.6); letter-spacing: .06em; margin-bottom: 4px; text-transform: uppercase; }
  .fp-footer-col a, .fp-footer-col button {
    display: flex; align-items: center; gap: 7px;
    color: rgba(255,255,255,.4); font-size: 13px;
    border: 0; background: transparent; cursor: pointer; text-align: left;
    transition: var(--transition);
    padding: 0;
  }
  .fp-footer-col a:hover, .fp-footer-col button:hover { color: white; }
  .fp-footer-col svg { opacity: .6; }
  .fp-footer-bottom {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 24px;
    border-top: 1px solid rgba(255,255,255,.07);
    flex-wrap: wrap;
    gap: 8px;
  }
  .fp-footer-bottom span { color: rgba(255,255,255,.28); font-size: 11px; }
  .fp-footer-bottom strong { color: rgba(255,255,255,.45); }

  /* FLOATING WIDGET */
  .fp-float { position: fixed; right: 24px; bottom: 24px; z-index: 90; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
  .fp-float-btn {
    width: 56px; height: 56px;
    display: grid; place-items: center;
    border: 0; border-radius: 50%;
    background: var(--fp);
    color: white;
    cursor: pointer;
    box-shadow: 0 12px 36px color-mix(in srgb, var(--fp) 40%, transparent);
    transition: var(--transition);
  }
  .fp-float-btn:hover { transform: scale(1.08); }
  .fp-float-menu {
    background: white;
    border-radius: 16px;
    padding: 12px;
    box-shadow: 0 20px 60px rgba(10,15,30,.18);
    border: 1px solid rgba(15,23,42,.08);
    min-width: 240px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .fp-float-menu-title { font-size: 10px; font-weight: 700; color: #94a3b8; padding: 4px 8px; letter-spacing: .05em; text-transform: uppercase; }
  .fp-float-option {
    display: flex; align-items: center; gap: 12px;
    padding: 12px;
    border-radius: 10px;
    color: var(--ft);
    font-size: 13px;
    transition: var(--transition);
    border: 1px solid transparent;
  }
  .fp-float-option:hover { background: var(--fb); border-color: rgba(15,23,42,.06); }
  .fp-float-option-wa:hover { background: #f0fdf4; border-color: #bbf7d0; }
  .fp-float-option-wa svg { color: #25d366; }
  .fp-float-option-mail svg { color: var(--fp); }
  .fp-float-option strong { display: block; font-size: 13px; font-weight: 700; }
  .fp-float-option small { color: #94a3b8; font-size: 11px; }

  /* RESPONSIVE */
  @media (max-width: 1024px) {
    .fp-features-layout { grid-template-columns: 260px 1fr; }
    .fp-process-grid { grid-template-columns: repeat(2,1fr); }
    .fp-testimonials-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 860px) {
    .fp-nav { display: none; }
    .fp-hero-grid, .fp-video-grid, .fp-contact-grid { grid-template-columns: 1fr; }
    .fp-dashboard-preview { display: none; }
    .fp-features-layout { grid-template-columns: 1fr; }
    .fp-feature-detail { position: static; }
    .fp-faq-inner { grid-template-columns: 1fr; gap: 40px; }
    .fp-pain-grid { grid-template-columns: 1fr; }
    .fp-footer-grid { grid-template-columns: 1fr 1fr; }
    .fp-norisk-inner { flex-direction: column; text-align: center; }
    .fp-norisk-chips { justify-content: center; }
  }

  @media (max-width: 620px) {
    .fp-container { width: calc(100% - 32px); }
    .fp-hero-grid { padding: 60px 0; }
    .fp-process-grid, .fp-plans-grid-3, .fp-plans-grid-2, .fp-footer-grid { grid-template-columns: 1fr; }
    .fp-proof-inner { justify-content: flex-start; }
    .fp-proof-divider { display: none; }
    .fp-form-row { grid-template-columns: 1fr; }
    .fp-features-list { grid-template-columns: 1fr; }
    .fp-cta-final-actions { flex-direction: column; align-items: stretch; }
    .fp-btn-whatsapp { justify-content: center; }
    .fp-pain-card { grid-template-columns: 1fr; }
    .fp-pain-arrow { display: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
    [data-fp-reveal] { opacity: 1; transform: none; }
  }
`;
