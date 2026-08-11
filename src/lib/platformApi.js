import { supabase } from './supabase.js';
import { listPartnerClientTemplatesForUi } from './partnerEmailTemplateDefaults.js';

const GHL_OAUTH_STATE_KEY = 'novoeia_ghl_oauth_state';

const RESOURCE_BUCKET = 'partner-resources';
const BRAND_ASSETS_BUCKET = 'brand-assets';
const MAX_BRAND_IMAGE_SIZE = 2 * 1024 * 1024;
const MAX_BRAND_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_RESOURCE_FILE_SIZE = 100 * 1024 * 1024;

const ALLOWED_BRAND_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
]);

const ALLOWED_BRAND_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

const ALLOWED_RESOURCE_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

function readStoredGhlState() {
  try {
    const raw = sessionStorage.getItem(GHL_OAUTH_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearStoredGhlState() {
  sessionStorage.removeItem(GHL_OAUTH_STATE_KEY);
}

function sanitizeStorageFileName(fileName = 'resource') {
  const cleaned = String(fileName)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return cleaned || 'resource';
}

function createStoragePath(userId, folder, fileName) {
  const safeFolder =
    folder === 'thumbnails'
      ? 'thumbnails'
      : 'media';

  const safeFileName =
    sanitizeStorageFileName(fileName);

  const randomId =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;

  return `${userId}/${safeFolder}/${randomId}-${safeFileName}`;
}

const ERROR_HINTS = {
  INVALID_OR_EXPIRED_STATE:
    'La sesión OAuth expiró o falta la tabla oauth_states. Vuelve a iniciar con HighLevel.',

  MISSING_CODE_OR_STATE:
    'Faltan datos OAuth. Intenta de nuevo desde el login.',

  GHL_OAUTH_NOT_CONFIGURED:
    'Faltan secrets GHL en Supabase → Edge Functions → Secrets.',

  GHL_TOKEN_EXCHANGE_FAILED:
    'HighLevel rechazó el intercambio del código. Instala la app Private desde GHL y vuelve a intentar.',

  GHL_ACCESS_TOKEN_MISSING:
    'HighLevel no devolvió access_token.',

  GHL_CONNECTION_SAVE:
    'No se pudo guardar la conexión GHL en la base de datos.',

  INTEGRATION_SAVE:
    'No se pudo actualizar platform_integrations.',

  PROFILE_UPSERT:
    'No se pudo guardar el perfil del usuario.',

  SESSION_LINK:
    'No se pudo generar la sesión Supabase.',

  GHL_USER_MISSING:
    'HighLevel no devolvió userId. Agrega el scope users.readonly.',

  SESSION_TOKEN_MISSING:
    'No se pudo crear la sesión en Supabase Auth.',

  EMAIL_ALREADY_REGISTERED:
    'Este correo ya está registrado. Si fue un registro incompleto, usa la misma contraseña para completarlo, o inicia sesión.',

  INVALID_CREDENTIALS:
    'Correo inválido o contraseña muy corta (mínimo 8 caracteres).',

  MISSING_REQUIRED_FIELDS:
    'Completa empresa y responsable.',

  PARTNER_REGISTRATION_ONLY:
    'Solo partners pueden registrarse en la plataforma.',

  CLIENTS_NO_PLATFORM_ACCESS:
    'Los clientes finales no tienen acceso. Ingresa con una cuenta de partner o Super Admin.',

  CLIENT_NAME_REQUIRED:
    'El nombre del cliente es obligatorio.',

  CLIENT_REQUIRED:
    'Selecciona un cliente antes de generar el link de venta.',

  CLIENT_NOT_FOUND:
    'El cliente seleccionado no existe o no está disponible.',

  CLIENT_DOES_NOT_BELONG_TO_PARTNER:
    'El cliente seleccionado no pertenece a este Partner.',

  USER_RESOLVE_FAILED:
    'No se pudo crear ni encontrar el usuario en Supabase.',

  FORBIDDEN:
    'No tienes permisos para realizar esta acción.',

  PROFILE_NOT_FOUND:
    'Perfil de usuario no encontrado. Vuelve a iniciar sesión.',

  STRIPE_NOT_CONFIGURED:
    'Falta Stripe Secret Key. Configúrala en Super Admin → Configuración → Stripe o en Supabase secrets (STRIPE_SECRET_KEY).',

  STRIPE_WEBHOOK_NOT_CONFIGURED:
    'Falta Stripe Webhook Secret. Configúralo en Super Admin → Configuración → Stripe o en Supabase secrets (STRIPE_WEBHOOK_SECRET).',

  STRIPE_PUBLISHABLE_NOT_CONFIGURED:
    'Falta Stripe Publishable Key. Configúrala en Super Admin → Configuración → Stripe.',

  PUBLIC_APP_URL_NOT_CONFIGURED:
    'Falta la URL pública de la app. Configúrala en Super Admin → Configuración → App y Webhooks.',

  STRIPE_PRODUCT_NOT_CONFIGURED:
    'El producto no tiene stripe_product_id.',

  PRICE_BELOW_WHOLESALE:
    'El precio de venta no puede ser menor al costo mayorista.',

  ADDITIONAL_SERVICES_LIMIT_4:
    'Solo puedes tener hasta 4 servicios adicionales.',

  CHECKOUT_SESSION_ID_REQUIRED:
    'Indica el ID de la sesión de checkout de Stripe (cs_...).',

  CHECKOUT_NOT_PAID:
    'La sesión de checkout aún no está pagada.',

  INVALID_CHECKOUT_PAYLOAD:
    'Selecciona producto, cliente y define un precio de venta válido.',

  PRODUCT_NOT_FOUND:
    'Producto no encontrado en el catálogo.',

  PARTNER_NOT_ASSIGNED:
    'La cuenta no está vinculada a un Partner.',

  PARTNER_NOT_FOUND:
    'No encontramos un partner con ese enlace. Verifica el slug en Mi marca y páginas.',

  PARTNER_NOT_PUBLISHED:
    'Esta landing no está publicada. El Super Admin debe activar tu cuenta en Partners.',

  PARTNER_SLUG_REQUIRED:
    'Falta el identificador del partner en la URL.',

  LEAD_FIELDS_REQUIRED:
    'Completa empresa y correo para enviar la solicitud.',

  OFFER_NOT_FOUND:
    'La oferta no fue encontrada.',

  OFFER_DOES_NOT_BELONG_TO_PARTNER:
    'La oferta no pertenece a este Partner.',

  OFFER_PRODUCT_MISMATCH:
    'La oferta y el producto seleccionados no coinciden.',

  INVALID_SALES_LINK_STATUS:
    'El estado solicitado para el link no es válido.',

  SALES_LINK_NOT_FOUND:
    'El link de venta no fue encontrado.',

  SALES_LINK_RELATIONS_IMMUTABLE:
    'No se puede cambiar el Partner, cliente, oferta o producto de un link ya creado.',

  RESOURCE_TITLE_REQUIRED:
    'El título del recurso es obligatorio.',

  RESOURCE_MEDIA_REQUIRED:
    'Debes subir un archivo o agregar una URL para el recurso.',

  RESOURCE_NOT_FOUND:
    'El recurso no fue encontrado.',

  INVALID_RESOURCE_TYPE:
    'El tipo de recurso debe ser imagen o video.',

  INVALID_RESOURCE_SOURCE:
    'El origen del recurso debe ser archivo subido o enlace externo.',

  INVALID_RESOURCE_STATUS:
    'El estado del recurso no es válido.',

  RESOURCE_FILE_REQUIRED:
    'Selecciona un archivo antes de subirlo.',

  RESOURCE_FILE_TOO_LARGE:
    'El archivo supera el tamaño máximo permitido de 100 MB.',

  RESOURCE_FILE_TYPE_NOT_ALLOWED:
    'El formato del archivo no está permitido.',

  RESOURCE_THUMBNAIL_IMAGE_REQUIRED:
    'La portada del recurso debe ser una imagen.',

  RESOURCE_UPLOAD_FAILED:
    'No se pudo subir el archivo del recurso.',

  RESOURCE_SAVE_FAILED:
    'No se pudo guardar el recurso.',

  RESOURCE_DELETE_FAILED:
    'No se pudo eliminar el recurso.',

  UNKNOWN_ACTION:
    'Esta función aún no está desplegada en el servidor. Ejecuta: supabase functions deploy partner-commerce --project-ref jwtymqtwlbifojtvxwpx',

  PAYMENT_PROFILE_LOCKED:
    'Tu cuenta de pagos ya está aprobada y no se puede editar.',

  PAYMENT_PROFILE_ALREADY_SUBMITTED:
    'Tu cuenta de pagos ya está en revisión.',

  PAYMENT_PROFILE_CONFIRMATION_REQUIRED:
    'Confirma que los datos son correctos antes de enviar.',

  PAYMENT_PROFILE_FIRST_NAME_REQUIRED:
    'Indica el nombre del titular.',

  PAYMENT_PROFILE_LAST_NAME_REQUIRED:
    'Indica el apellido del titular.',

  PAYMENT_PROFILE_TYPE_REQUIRED:
    'Selecciona el tipo de Partner.',

  PAYMENT_PROFILE_COUNTRY_REQUIRED:
    'Selecciona el país de residencia.',

  PAYMENT_PROFILE_EMAIL_REQUIRED:
    'Indica el correo del titular.',

  PAYMENT_PROFILE_BANK_COUNTRY_REQUIRED:
    'Selecciona el país del banco de respaldo.',

  PAYMENT_PROFILE_BANK_NAME_REQUIRED:
    'Indica el nombre del banco de respaldo.',

  PAYMENT_PROFILE_BANK_HOLDER_REQUIRED:
    'Indica el titular de la cuenta de respaldo.',

  PAYMENT_PROFILE_BANK_ACCOUNT_REQUIRED:
    'Indica el número de cuenta de respaldo.',

  PAYMENT_PROFILE_PROVIDER_REQUIRED:
    'Elige un método oficial de pago.',

  PAYMENT_PROFILE_WISE_DESTINATION_REQUIRED:
    'Indica si recibirás en Wise o en tu banco vía Wise.',

  PAYMENT_PROFILE_US_BANK_NAME_REQUIRED:
    'Indica el banco USA.',

  PAYMENT_PROFILE_US_BANK_HOLDER_REQUIRED:
    'Indica el titular de la cuenta USA.',

  PAYMENT_PROFILE_US_BANK_ROUTING_REQUIRED:
    'Indica el routing/ABA de la cuenta USA.',

  PAYMENT_PROFILE_US_BANK_ACCOUNT_REQUIRED:
    'Indica el número de cuenta USA.',

  PAYMENT_PROFILE_ROUTE_REQUIRED:
    'No se pudo determinar la ruta de pago. Revisa el método seleccionado.',

  INVALID_PAYMENT_PROFILE_REVIEW:
    'Decisión de revisión inválida.',

  SUPPORT_TICKET_REQUIRED:
    'Indica el ticket de soporte.',

  SUPPORT_TICKET_FIELDS_REQUIRED:
    'Completa el asunto y el mensaje del ticket.',

  INVALID_SUPPORT_PRIORITY:
    'La prioridad del ticket no es válida.',

  SUPPORT_TICKET_CLOSED:
    'Este ticket está cerrado y no admite nuevas respuestas.',

  INVALID_SUPPORT_TICKET_STATUS:
    'El estado del ticket no es válido.',
};

function translateKnownError(rawError) {
  const raw = String(rawError || '');

  if (!raw) {
    return 'Error de conexión';
  }

  if (ERROR_HINTS[raw]) {
    return ERROR_HINTS[raw];
  }

  const prefixedErrors = [
    ['STRIPE_CHECKOUT:', 'Stripe: '],
    ['STRIPE_PAYMENT_LINK:', 'Stripe: '],
    ['ADDITIONAL_SERVICE_STRIPE:', 'No se pudo sincronizar el servicio con Stripe: '],
    ['OFFER_SAVE:', 'No se pudo guardar la oferta: '],
    ['OFFER_UPDATE:', 'No se pudo actualizar la oferta: '],
    ['SALES_LINK_CREATE:', 'No se pudo registrar el link de venta: '],
    ['SALES_LINK_UPDATE:', 'No se pudo actualizar el link de venta: '],
    ['RESOURCE_UPLOAD:', 'No se pudo subir el recurso: '],
    ['RESOURCE_SAVE:', 'No se pudo guardar el recurso: '],
    ['RESOURCE_DELETE:', 'No se pudo eliminar el recurso: '],
    ['RESOURCE_STATUS:', 'No se pudo actualizar el recurso: '],
  ];

  for (const [prefix, message] of prefixedErrors) {
    if (raw.startsWith(prefix)) {
      return `${message}${raw.slice(prefix.length)}`;
    }
  }

  if (raw.includes('invalid_request')) {
    return 'El código OAuth ya fue usado o expiró. Vuelve a Ingresar → Continuar con HighLevel.';
  }

  return raw;
}

async function parseFunctionError(error, data, functionName = 'edge-function') {
  if (data?.error) {
    return translateKnownError(data.error);
  }

  if (
    error?.context &&
    typeof error.context.json === 'function'
  ) {
    try {
      const payload = await error.context.json();

      if (payload?.error) {
        return translateKnownError(payload.error);
      }
    } catch {
      // No fue posible leer el cuerpo del error.
    }
  }

  if (
    error?.message ===
    'Edge Function returned a non-2xx status code'
  ) {
    return `La Edge Function "${functionName}" falló. Revisa Supabase → Edge Functions → Logs.`;
  }

  if (
    error?.message?.includes('Failed to send a request to the Edge Function')
  ) {
    return `No se pudo conectar con "${functionName}". Despliégala con: supabase functions deploy ${functionName}`;
  }

  return translateKnownError(error?.message);
}

function isUnknownActionError(error) {
  const message = String(error?.message || '');
  return message.includes('UNKNOWN_ACTION') || message.includes('supabase functions deploy partner-commerce');
}

function extractPartnerEmailBranding(partner) {
  const branding = partner?.branding || {};
  const brand = branding.brand || {};
  const emailSettings = branding.emailSettings || brand.emailSettings || {};
  const storedTemplates = branding.emailTemplates || brand.emailTemplates || {};
  const partnerName = String(brand.businessName || branding.name || partner?.name || '').trim();

  return {
    emailSettings: {
      fromName: String(emailSettings.fromName || partnerName || '').trim(),
      replyTo: String(emailSettings.replyTo || brand.contactEmail || '').trim(),
    },
    storedTemplates,
    brand,
  };
}

async function getPartnerEmailTemplatesFromBranding() {
  const data = await invoke('partner-commerce', { action: 'getBranding' });
  const { emailSettings, storedTemplates } = extractPartnerEmailBranding(data?.partner);
  return {
    emailSettings,
    templates: listPartnerClientTemplatesForUi(storedTemplates),
  };
}

async function savePartnerEmailTemplatesViaBranding(payload) {
  const current = await invoke('partner-commerce', { action: 'getBranding' });
  const { brand } = extractPartnerEmailBranding(current?.partner);
  const emailSettings = payload.emailSettings || {};
  const emailTemplates = payload.templates || {};

  await invoke('partner-commerce', {
    action: 'saveBranding',
    payload: {
      brand: {
        ...brand,
        emailSettings,
        emailTemplates,
      },
      emailSettings,
      emailTemplates,
    },
  });

  return getPartnerEmailTemplatesFromBranding();
}

const IMPERSONATION_STORAGE_KEY = 'novo_impersonate_partner';

function readImpersonation() {
  try {
    const raw = sessionStorage.getItem(IMPERSONATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function invoke(functionName, body = {}) {
  let finalBody = body;
  const impersonation = readImpersonation();
  if (
    impersonation?.partnerId
    && !body.payload?.partnerId
    && (functionName === 'partner-commerce' || functionName === 'stripe-checkout')
  ) {
    finalBody = {
      ...body,
      payload: {
        ...(body.payload || {}),
        partnerId: impersonation.partnerId,
      },
    };
  }

  const { data, error } =
    await supabase.functions.invoke(functionName, {
      body: finalBody,
    });

  if (error) {
    const parsed = await parseFunctionError(error, data, functionName);
    throw new Error(parsed);
  }

  if (data?.error) {
    throw new Error(
      translateKnownError(data.error),
    );
  }

  return data;
}

function roleToDashboard(role) {
  if (role === 'super_admin') {
    return 'admin-dashboard';
  }

  if (role === 'partner') {
    return 'partner-dashboard';
  }

  return 'client-dashboard';
}

function defaultDashboardSection(roleOrPage) {
  if (roleOrPage === 'partner' || roleOrPage === 'partner-dashboard') {
    return 'partner-center';
  }
  return 'dashboard';
}

export const platformApi = {
  getSession: () => supabase.auth.getSession(),

  signOut: () => supabase.auth.signOut(),

  roleToDashboard,

  defaultDashboardSection,

  getImpersonation: readImpersonation,

  startImpersonatingPartner(partner) {
    if (!partner?.id) {
      throw new Error('Partner inválido.');
    }
    sessionStorage.setItem(
      IMPERSONATION_STORAGE_KEY,
      JSON.stringify({
        partnerId: partner.id,
        partnerName: partner.name || 'Partner',
        partnerSlug: partner.slug || null,
        startedAt: new Date().toISOString(),
      }),
    );
  },

  clearImpersonation() {
    sessionStorage.removeItem(IMPERSONATION_STORAGE_KEY);
  },

  async getMyProfile() {
    const { data: sessionData } =
      await supabase.auth.getSession();

    const userId =
      sessionData.session?.user?.id;

    if (!userId) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  async requireSuperAdmin() {
    const profile =
      await this.getMyProfile();

    if (!profile) {
      throw new Error(
        ERROR_HINTS.PROFILE_NOT_FOUND,
      );
    }

    if (profile.role !== 'super_admin') {
      throw new Error(
        ERROR_HINTS.FORBIDDEN,
      );
    }

    return profile;
  },

  async getPlatformSettings() {
    const { data, error } = await supabase
      .from('platform_settings_public')
      .select('*')
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  saveIntegrationSettings(payload) {
    return invoke('platform-admin', {
      action: 'saveIntegrationSettings',
      payload,
    });
  },

  sendTestEmail(to = null) {
    return invoke('platform-admin', {
      action: 'sendTestEmail',
      payload: { to },
    });
  },

  getEmailTemplates() {
    return invoke('platform-admin', {
      action: 'getEmailTemplates',
    });
  },

  saveEmailTemplates(templates, deleteIds = []) {
    return invoke('platform-admin', {
      action: 'saveEmailTemplates',
      payload: { templates, deleteIds },
    });
  },

  sendTemplateTestEmail(templateId, to = null) {
    return invoke('platform-admin', {
      action: 'sendTemplateTestEmail',
      payload: { templateId, to },
    });
  },

  getIntegrationSettings() {
    return invoke('platform-admin', {
      action: 'getIntegrationSettings',
    });
  },

  async getAdminSystemHealth() {
    const profile = await this.getMyProfile();
    if (profile?.role !== 'super_admin') {
      throw new Error(ERROR_HINTS.FORBIDDEN);
    }

    const [ghlResult, integrationsResult, failedResult, pendingPartnersResult] = await Promise.all([
      supabase
        .from('ghl_connections')
        .select('scopes, company_id, status, updated_at')
        .eq('connection_type', 'agency')
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('platform_integrations')
        .select('provider, status, public_config')
        .in('provider', ['ghl', 'stripe']),
      supabase
        .from('partner_clients')
        .select('id', { count: 'exact', head: true })
        .eq('ghl_sync_status', 'failed'),
      supabase
        .from('partners')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ]);

    if (ghlResult.error) throw ghlResult.error;
    if (integrationsResult.error) throw integrationsResult.error;
    if (failedResult.error) throw failedResult.error;
    if (pendingPartnersResult.error) throw pendingPartnersResult.error;

    const ghlConn = ghlResult.data;
    const ghlScopes = ghlConn?.scopes || [];
    const integrationsByProvider = Object.fromEntries(
      (integrationsResult.data || []).map((row) => [row.provider, row]),
    );
    const ghlIntegration = integrationsByProvider.ghl;
    const stripeIntegration = integrationsByProvider.stripe;
    const ghlConnected = Boolean(ghlConn?.company_id || ghlIntegration?.status === 'connected');

    return {
      ghl: {
        connected: ghlConnected,
        provisionReady: ghlConnected && ghlScopes.includes('locations.write'),
        scopes: ghlScopes,
        companyId: ghlConn?.company_id || ghlIntegration?.public_config?.companyId || null,
        updatedAt: ghlConn?.updated_at || ghlIntegration?.public_config?.connectedAt || null,
      },
      stripe: {
        status: stripeIntegration?.status || 'unknown',
        configured: stripeIntegration?.status === 'connected',
        publishableConfigured: Boolean(stripeIntegration?.public_config?.publishableKey),
        priceMode: stripeIntegration?.public_config?.priceMode || 'test',
      },
      clientsGhlFailed: failedResult.count || 0,
      partnersPending: pendingPartnersResult.count || 0,
    };
  },

  async listPendingPartnerRegistrations() {
    await this.requireSuperAdmin();

    const { data, error } = await supabase
      .from('partners')
      .select(`
        id,
        name,
        slug,
        status,
        plan_name,
        branding,
        created_at,
        owner_user_id
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const ownerIds = [...new Set((data || []).map(row => row.owner_user_id).filter(Boolean))];
    let ownersById = {};
    if (ownerIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone')
        .in('id', ownerIds);
      if (profilesError) throw profilesError;
      ownersById = Object.fromEntries((profiles || []).map(profile => [profile.id, profile]));
    }

    return {
      registrations: (data || []).map(row => ({
        ...row,
        owner: ownersById[row.owner_user_id] || null,
      })),
    };
  },

  reviewPartnerRegistration(partnerId, decision, note = null) {
    return invoke('platform-admin', {
      action: 'reviewPartnerRegistration',
      payload: { partnerId, decision, note },
    });
  },

  async listAuditLogs({
    actionPrefix = null,
    entityType = null,
    limit = 100,
  } = {}) {
    await this.requireSuperAdmin();

    let query = supabase
      .from('audit_logs')
      .select('id, actor_user_id, action, entity_type, entity_id, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 200));

    if (actionPrefix) query = query.like('action', `${actionPrefix}%`);
    if (entityType) query = query.eq('entity_type', entityType);

    const { data, error } = await query;
    if (error) throw error;
    return { logs: data || [] };
  },

  testIntegration(provider) {
    return invoke('platform-admin', {
      action: 'testIntegration',
      provider,
    });
  },

  startGhlOAuth(
    purpose = 'connect',
    userType,
  ) {
    return invoke('ghl-oauth', {
      action: 'authorize',
      purpose,
      userType:
        userType ||
        (
          purpose === 'connect'
            ? 'Company'
            : 'Location'
        ),
    }).then((data) => {
      if (data?.state) {
        sessionStorage.setItem(
          GHL_OAUTH_STATE_KEY,
          JSON.stringify({
            state: data.state,
            purpose:
              data.purpose || purpose,
          }),
        );
      }

      return data;
    });
  },

  startGhlLogin() {
    return this.startGhlOAuth(
      'login',
      'Company',
    );
  },

  readPendingGhlOAuth() {
    const params =
      new URLSearchParams(
        window.location.search,
      );

    const code = params.get('code');

    if (!code) {
      return null;
    }

    const state =
      params.get('state') ||
      readStoredGhlState()?.state ||
      null;

    return {
      code,
      state,
    };
  },

  completeGhlOAuth({ code, state }) {
    return invoke('ghl-oauth', {
      action: 'callback',
      code,
      state,
    }).finally(clearStoredGhlState);
  },

  async establishGhlSession(tokenHash) {
    const { data, error } =
      await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'magiclink',
      });

    if (error) {
      throw error;
    }

    return data;
  },

  syncGhlLocations() {
    return invoke('ghl-proxy', {
      action: 'syncLocations',
    });
  },

  provisionClientInGhl(clientId, payload = {}) {
    return invoke('ghl-proxy', {
      action: 'provisionClient',
      clientId,
      offerId: payload.offerId || null,
      catalogProductId: payload.catalogProductId || null,
      stripeCustomerId: payload.stripeCustomerId || null,
    });
  },

  async listPartners() {
    const profile =
      await this.getMyProfile();

    if (profile?.role !== 'super_admin') {
      throw new Error(
        ERROR_HINTS.FORBIDDEN,
      );
    }

    const { data, error } = await supabase
      .from('partners')
      .select(`
        id,
        name,
        slug,
        status,
        plan_name,
        ghl_location_id,
        branding,
        created_at,
        owner_user_id
      `)
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return {
      partners: data || [],
    };
  },

  async createPartner(payload) {
    await this.requireSuperAdmin();

    const name = String(payload.name || '').trim();
    const slug = String(payload.slug || '').trim().toLowerCase();

    if (!name || !slug) {
      throw new Error('MISSING_REQUIRED_FIELDS');
    }

    const { data, error } = await supabase
      .from('partners')
      .insert({
        name,
        slug,
        plan_name: payload.plan_name || 'partner',
        status: payload.status || 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return { partner: data };
  },

  createPartnerAccount(payload) {
    return invoke('platform-admin', {
      action: 'createPartnerAccount',
      payload,
    });
  },

  updatePartner(payload) {
    return invoke('platform-admin', {
      action: 'updatePartner',
      payload,
    });
  },

  listCatalog() {
    return invoke('partner-commerce', {
      action: 'listCatalog',
    });
  },

  async listCatalogProducts() {
    const profile =
      await this.getMyProfile();

    if (profile?.role !== 'super_admin') {
      throw new Error(
        ERROR_HINTS.FORBIDDEN,
      );
    }

    const { data, error } = await supabase
      .from('catalog_products')
      .select('*')
      .order('name');

    if (error) {
      throw error;
    }

    return {
      products: data || [],
    };
  },

  async saveCatalogProduct(payload) {
    const profile =
      await this.getMyProfile();

    if (profile?.role !== 'super_admin') {
      throw new Error(
        ERROR_HINTS.FORBIDDEN,
      );
    }

    const row = {
      name: payload.name,
      description:
        payload.description || null,

      wholesale_price:
        Number(payload.wholesalePrice),

      suggested_price:
        payload.suggestedPrice != null
          ? Number(payload.suggestedPrice)
          : null,

      currency:
        payload.currency || 'USD',

      billing_type:
        payload.billingType || 'recurring',

      interval:
        payload.interval || null,

      stripe_product_id:
        payload.stripeProductId || null,

      stripe_price_id:
        payload.stripePriceId || null,

      ghl_product_id:
        payload.ghlProductId || null,

      ghl_price_id:
        payload.ghlPriceId || null,

      active:
        payload.active !== false,

      metadata:
        payload.metadata || {},
    };

    if (payload.id) {
      const { data, error } = await supabase
        .from('catalog_products')
        .update(row)
        .eq('id', payload.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        product: data,
      };
    }

    const { data, error } = await supabase
      .from('catalog_products')
      .insert(row)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      product: data,
    };
  },

  savePartnerOffer(payload) {
    return invoke('partner-commerce', {
      action: 'saveOffer',
      payload,
    });
  },

  async listPartnerOffersForAdmin(partnerId) {
    await this.requireSuperAdmin();
    if (!partnerId) throw new Error('Partner requerido.');

    const [productsResult, offersResult] = await Promise.all([
      supabase
        .from('catalog_products')
        .select('id, name, description, wholesale_price, suggested_price, currency, interval, ghl_product_id, ghl_price_id, active')
        .order('name'),
      supabase
        .from('partner_offers')
        .select('id, product_id, retail_price, ghl_price_id, currency, active, display_name, display_description')
        .eq('partner_id', partnerId),
    ]);

    if (productsResult.error) throw productsResult.error;
    if (offersResult.error) throw offersResult.error;

    const offerByProduct = new Map(
      (offersResult.data || []).map(offer => [String(offer.product_id), offer]),
    );

    const products = (productsResult.data || []).map(product => {
      const offer = offerByProduct.get(String(product.id));
      return {
        ...product,
        offerId: offer?.id || null,
        retailPrice: offer?.retail_price ?? product.suggested_price ?? null,
        ghlPriceId: offer?.ghl_price_id || product.ghl_price_id || '',
        catalogGhlPriceId: product.ghl_price_id || '',
        offerActive: offer?.active ?? false,
        displayName: offer?.display_name || product.name,
      };
    });

    return { products };
  },

  savePartnerOfferForAdmin(partnerId, payload) {
    return invoke('partner-commerce', {
      action: 'saveOffer',
      payload: {
        ...payload,
        partnerId,
      },
    });
  },

  savePartnerAdditionalServices(additionalServices) {
    return invoke('partner-commerce', {
      action: 'saveAdditionalServices',
      payload: { additionalServices },
    });
  },

  generateCheckoutLink(payload) {
    return invoke('stripe-checkout', {
      action: 'createSession',
      payload,
    });
  },

  listPartnerClients(partnerId = null) {
    return invoke('partner-commerce', {
      action: 'listClients',
      payload:
        partnerId
          ? { partnerId }
          : {},
    });
  },

  createPartnerClient(payload) {
    return invoke('partner-commerce', {
      action: 'createClient',
      payload,
    });
  },

  async listSalesLinks({
    partnerId = null,
    clientId = null,
    productId = null,
    status = null,
  } = {}) {
    const profile =
      await this.getMyProfile();

    if (!profile) {
      throw new Error(
        ERROR_HINTS.PROFILE_NOT_FOUND,
      );
    }

    let query = supabase
      .from('sales_links')
      .select(`
        id,
        public_token,

        partner_id,
        partner_name,

        client_id,
        client_name,
        client_email,

        offer_id,

        product_id,
        product_name,

        billing_type,
        billing_interval,
        currency,

        wholesale_price,
        sale_price,
        partner_margin,

        checkout_url,
        stripe_product_id,
        stripe_price_id,
        stripe_checkout_session_id,
        stripe_payment_link_id,

        status,

        created_by,
        created_by_role,

        activated_at,
        disabled_at,
        expires_at,

        failure_reason,
        metadata,

        created_at,
        updated_at
      `)
      .order('created_at', {
        ascending: false,
      });

    if (
      profile.role === 'super_admin' &&
      partnerId
    ) {
      query = query.eq(
        'partner_id',
        partnerId,
      );
    } else if (
      profile.role === 'partner' &&
      profile.partner_id
    ) {
      query = query.eq(
        'partner_id',
        profile.partner_id,
      );
    }

    if (clientId) {
      query = query.eq(
        'client_id',
        clientId,
      );
    }

    if (productId) {
      query = query.eq(
        'product_id',
        productId,
      );
    }

    if (status) {
      query = query.eq(
        'status',
        status,
      );
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return {
      links: data || [],
    };
  },

  async getSalesLink(linkId) {
    if (!linkId) {
      throw new Error(
        ERROR_HINTS.SALES_LINK_NOT_FOUND,
      );
    }

    const { data, error } = await supabase
      .from('sales_links')
      .select('*')
      .eq('id', linkId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        ERROR_HINTS.SALES_LINK_NOT_FOUND,
      );
    }

    return {
      link: data,
    };
  },

  async listAllClients({
    partnerId = null,
    status = null,
    ghlSyncStatus = null,
  } = {}) {
    const profile = await this.getMyProfile();
    if (profile?.role !== 'super_admin') {
      throw new Error(ERROR_HINTS.FORBIDDEN);
    }

    let query = supabase
      .from('partner_clients')
      .select(`
        id,
        partner_id,
        name,
        company_name,
        contact_name,
        email,
        phone,
        status,
        industry,
        city,
        country,
        logo_url,
        created_at,
        offer_id,
        ghl_location_id,
        ghl_sync_status,
        partners:partner_id ( id, name, slug )
      `)
      .order('created_at', { ascending: false });

    if (partnerId) query = query.eq('partner_id', partnerId);
    if (status) query = query.eq('status', status);
    if (ghlSyncStatus) query = query.eq('ghl_sync_status', ghlSyncStatus);

    const { data, error } = await query;
    if (error) throw error;
    return { clients: data || [] };
  },

  async listCommissions({
    partnerId = null,
    status = null,
  } = {}) {
    const profile = await this.getMyProfile();
    if (!profile) {
      throw new Error(ERROR_HINTS.FORBIDDEN);
    }

    if (
      profile.role !== 'super_admin' &&
      profile.role !== 'partner'
    ) {
      throw new Error(ERROR_HINTS.FORBIDDEN);
    }

    let query = supabase
      .from('partner_commissions')
      .select(`
        id,
        partner_id,
        sales_link_id,
        client_id,
        stripe_checkout_session_id,
        stripe_subscription_id,
        gross_amount,
        wholesale_amount,
        commission_amount,
        currency,
        status,
        paid_at,
        created_at,
        updated_at,
        partners:partner_id ( id, name, slug ),
        partner_clients:client_id ( company_name, name, email ),
        sales_links:sales_link_id (
          id,
          product_id,
          product_name,
          sale_price,
          billing_interval,
          metadata
        )
      `)
      .order('created_at', { ascending: false });

    if (profile.role === 'partner') {
      if (!profile.partner_id) {
        return { commissions: [] };
      }
      query = query.eq('partner_id', profile.partner_id);
    } else if (partnerId) {
      query = query.eq('partner_id', partnerId);
    }

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return { commissions: data || [] };
  },

  async updateCommissionStatus(commissionId, status) {
    const profile = await this.getMyProfile();
    if (profile?.role !== 'super_admin') {
      throw new Error(ERROR_HINTS.FORBIDDEN);
    }

    const allowed = ['pending', 'paid', 'cancelled'];
    if (!allowed.includes(status)) {
      throw new Error('INVALID_COMMISSION_STATUS');
    }

    const patch = {
      status,
      updated_at: new Date().toISOString(),
      paid_at: status === 'paid' ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from('partner_commissions')
      .update(patch)
      .eq('id', commissionId)
      .select()
      .single();

    if (error) throw error;
    return { commission: data };
  },

  async listActiveSubscriptions({
    partnerId = null,
  } = {}) {
    const profile = await this.getMyProfile();
    if (!profile) {
      throw new Error(ERROR_HINTS.FORBIDDEN);
    }

    if (
      profile.role !== 'super_admin' &&
      profile.role !== 'partner'
    ) {
      throw new Error(ERROR_HINTS.FORBIDDEN);
    }

    let query = supabase
      .from('sales_links')
      .select(`
        id,
        partner_id,
        partner_name,
        client_id,
        client_name,
        client_email,
        product_name,
        billing_interval,
        currency,
        sale_price,
        wholesale_price,
        partner_margin,
        status,
        stripe_checkout_session_id,
        activated_at,
        metadata,
        created_at
      `)
      .eq('status', 'active')
      .order('activated_at', { ascending: false, nullsFirst: false });

    if (profile.role === 'partner') {
      if (!profile.partner_id) {
        return { subscriptions: [] };
      }
      query = query.eq('partner_id', profile.partner_id);
    } else if (partnerId) {
      query = query.eq('partner_id', partnerId);
    }

    const { data: links, error } = await query;
    if (error) throw error;

    const clientIds = [...new Set((links || []).map(link => link.client_id).filter(Boolean))];
    let clientStatusMap = {};

    if (clientIds.length > 0) {
      const { data: clients } = await supabase
        .from('partner_clients')
        .select('id, status')
        .in('id', clientIds);
      clientStatusMap = Object.fromEntries((clients || []).map(c => [c.id, c.status]));
    }

    const subscriptions = (links || []).map(link => ({
      ...link,
      client_status: clientStatusMap[link.client_id] || null,
      stripe_subscription_id:
        link.metadata?.stripe_subscription_id ||
        link.stripe_checkout_session_id ||
        null,
    }));

    return { subscriptions };
  },

  async updateSalesLinkStatus(
    linkId,
    status,
  ) {
    const allowedStatuses = [
      'active',
      'disabled',
      'expired',
      'archived',
    ];

    if (!linkId) {
      throw new Error(
        ERROR_HINTS.SALES_LINK_NOT_FOUND,
      );
    }

    if (
      !allowedStatuses.includes(status)
    ) {
      throw new Error(
        ERROR_HINTS.INVALID_SALES_LINK_STATUS,
      );
    }

    const { data, error } = await supabase
      .from('sales_links')
      .update({ status })
      .eq('id', linkId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      link: data,
    };
  },

  async listPartnerResources({
    status = null,
    resourceType = null,
    category = null,
    featured = null,
  } = {}) {
    const profile =
      await this.getMyProfile();

    if (!profile) {
      throw new Error(
        ERROR_HINTS.PROFILE_NOT_FOUND,
      );
    }

    if (
      profile.role !== 'super_admin' &&
      profile.role !== 'partner'
    ) {
      throw new Error(
        ERROR_HINTS.FORBIDDEN,
      );
    }

    let query = supabase
      .from('partner_resources')
      .select(`
        id,
        title,
        description,
        resource_type,
        source_type,
        category,
        media_url,
        thumbnail_url,
        share_text,
        status,
        is_featured,
        sort_order,
        created_by,
        published_at,
        created_at,
        updated_at,
        metadata
      `)
      .order('is_featured', {
        ascending: false,
      })
      .order('sort_order', {
        ascending: true,
      })
      .order('created_at', {
        ascending: false,
      });

    if (profile.role === 'partner') {
      query = query.eq(
        'status',
        'published',
      );
    }

    if (
      profile.role === 'super_admin' &&
      status &&
      status !== 'all'
    ) {
      query = query.eq(
        'status',
        status,
      );
    }

    if (
      resourceType &&
      resourceType !== 'all'
    ) {
      query = query.eq(
        'resource_type',
        resourceType,
      );
    }

    if (
      category &&
      category !== 'all'
    ) {
      query = query.eq(
        'category',
        category,
      );
    }

    if (typeof featured === 'boolean') {
      query = query.eq(
        'is_featured',
        featured,
      );
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return {
      resources: data || [],
    };
  },

  async getPartnerResource(resourceId) {
    const profile =
      await this.getMyProfile();

    if (!profile) {
      throw new Error(
        ERROR_HINTS.PROFILE_NOT_FOUND,
      );
    }

    if (!resourceId) {
      throw new Error(
        ERROR_HINTS.RESOURCE_NOT_FOUND,
      );
    }

    const { data, error } = await supabase
      .from('partner_resources')
      .select('*')
      .eq('id', resourceId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        ERROR_HINTS.RESOURCE_NOT_FOUND,
      );
    }

    return {
      resource: data,
    };
  },

  async uploadPartnerResource(
    file,
    {
      folder = 'media',
    } = {},
  ) {
    const profile =
      await this.requireSuperAdmin();

    if (!file) {
      throw new Error(
        ERROR_HINTS.RESOURCE_FILE_REQUIRED,
      );
    }

    if (
      typeof file.size !== 'number' ||
      file.size <= 0
    ) {
      throw new Error(
        ERROR_HINTS.RESOURCE_FILE_REQUIRED,
      );
    }

    if (
      file.size >
      MAX_RESOURCE_FILE_SIZE
    ) {
      throw new Error(
        ERROR_HINTS.RESOURCE_FILE_TOO_LARGE,
      );
    }

    const mimeType =
      String(file.type || '').toLowerCase();

    if (
      !ALLOWED_RESOURCE_MIME_TYPES.has(
        mimeType,
      )
    ) {
      throw new Error(
        ERROR_HINTS.RESOURCE_FILE_TYPE_NOT_ALLOWED,
      );
    }

    if (
      folder === 'thumbnails' &&
      !mimeType.startsWith('image/')
    ) {
      throw new Error(
        ERROR_HINTS.RESOURCE_THUMBNAIL_IMAGE_REQUIRED,
      );
    }

    const storagePath =
      createStoragePath(
        profile.id,
        folder,
        file.name || 'resource',
      );

    const uploadOptions = {
      cacheControl: '3600',
      upsert: false,
      contentType: mimeType,
    };

    const { error: uploadError } =
      await supabase.storage
        .from(RESOURCE_BUCKET)
        .upload(
          storagePath,
          file,
          uploadOptions,
        );

    if (uploadError) {
      throw new Error(
        `RESOURCE_UPLOAD:${uploadError.message}`,
      );
    }

    const { data: publicUrlData } =
      supabase.storage
        .from(RESOURCE_BUCKET)
        .getPublicUrl(storagePath);

    const publicUrl =
      publicUrlData?.publicUrl;

    if (!publicUrl) {
      await supabase.storage
        .from(RESOURCE_BUCKET)
        .remove([storagePath]);

      throw new Error(
        ERROR_HINTS.RESOURCE_UPLOAD_FAILED,
      );
    }

    return {
      bucket: RESOURCE_BUCKET,
      path: storagePath,
      url: publicUrl,
      mimeType,
      fileName:
        file.name || 'resource',
      size: file.size,
    };
  },

  async savePartnerResource(payload) {
    const profile =
      await this.requireSuperAdmin();

    const title =
      String(payload?.title || '').trim();

    if (!title) {
      throw new Error(
        ERROR_HINTS.RESOURCE_TITLE_REQUIRED,
      );
    }

    const resourceType =
      payload.resourceType ||
      payload.resource_type;

    if (
      !['image', 'video'].includes(
        resourceType,
      )
    ) {
      throw new Error(
        ERROR_HINTS.INVALID_RESOURCE_TYPE,
      );
    }

    const sourceType =
      payload.sourceType ||
      payload.source_type ||
      'upload';

    if (
      !['upload', 'external'].includes(
        sourceType,
      )
    ) {
      throw new Error(
        ERROR_HINTS.INVALID_RESOURCE_SOURCE,
      );
    }

    const status =
      payload.status || 'draft';

    if (
      ![
        'draft',
        'published',
        'archived',
      ].includes(status)
    ) {
      throw new Error(
        ERROR_HINTS.INVALID_RESOURCE_STATUS,
      );
    }

    const mediaUrl =
      String(
        payload.mediaUrl ||
        payload.media_url ||
        '',
      ).trim();

    if (!mediaUrl) {
      throw new Error(
        ERROR_HINTS.RESOURCE_MEDIA_REQUIRED,
      );
    }

    const thumbnailUrl =
      String(
        payload.thumbnailUrl ||
        payload.thumbnail_url ||
        '',
      ).trim() || null;

    const metadata =
      payload.metadata &&
      typeof payload.metadata === 'object'
        ? payload.metadata
        : {};

    const row = {
      title,

      description:
        String(
          payload.description || '',
        ).trim() || null,

      resource_type:
        resourceType,

      source_type:
        sourceType,

      category:
        String(
          payload.category || '',
        ).trim() || null,

      media_url:
        mediaUrl,

      thumbnail_url:
        thumbnailUrl,

      share_text:
        String(
          payload.shareText ||
          payload.share_text ||
          '',
        ).trim() || null,

      status,

      is_featured:
        Boolean(
          payload.isFeatured ??
          payload.is_featured ??
          false,
        ),

      sort_order:
        Number.isFinite(
          Number(
            payload.sortOrder ??
            payload.sort_order,
          ),
        )
          ? Number(
              payload.sortOrder ??
              payload.sort_order,
            )
          : 0,

      published_at:
        status === 'published'
          ? (
              payload.publishedAt ||
              payload.published_at ||
              new Date().toISOString()
            )
          : null,

      metadata,
    };

    const resourceId =
      payload.id || null;

    if (resourceId) {
      const { data, error } = await supabase
        .from('partner_resources')
        .update(row)
        .eq('id', resourceId)
        .select()
        .single();

      if (error) {
        throw new Error(
          `RESOURCE_SAVE:${error.message}`,
        );
      }

      return {
        resource: data,
      };
    }

    const { data, error } = await supabase
      .from('partner_resources')
      .insert({
        ...row,
        created_by: profile.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(
        `RESOURCE_SAVE:${error.message}`,
      );
    }

    return {
      resource: data,
    };
  },

  async updatePartnerResourceStatus(
    resourceId,
    status,
  ) {
    await this.requireSuperAdmin();

    if (!resourceId) {
      throw new Error(
        ERROR_HINTS.RESOURCE_NOT_FOUND,
      );
    }

    if (
      ![
        'draft',
        'published',
        'archived',
      ].includes(status)
    ) {
      throw new Error(
        ERROR_HINTS.INVALID_RESOURCE_STATUS,
      );
    }

    const updates = {
      status,
      published_at:
        status === 'published'
          ? new Date().toISOString()
          : null,
    };

    const { data, error } = await supabase
      .from('partner_resources')
      .update(updates)
      .eq('id', resourceId)
      .select()
      .single();

    if (error) {
      throw new Error(
        `RESOURCE_STATUS:${error.message}`,
      );
    }

    return {
      resource: data,
    };
  },

  async deletePartnerResource(
    resourceId,
  ) {
    await this.requireSuperAdmin();

    if (!resourceId) {
      throw new Error(
        ERROR_HINTS.RESOURCE_NOT_FOUND,
      );
    }

    const { data: resource, error: findError } =
      await supabase
        .from('partner_resources')
        .select('*')
        .eq('id', resourceId)
        .maybeSingle();

    if (findError) {
      throw new Error(
        `RESOURCE_DELETE:${findError.message}`,
      );
    }

    if (!resource) {
      throw new Error(
        ERROR_HINTS.RESOURCE_NOT_FOUND,
      );
    }

    const metadata =
      resource.metadata &&
      typeof resource.metadata === 'object'
        ? resource.metadata
        : {};

    const storagePaths = [
      metadata.storage_path,
      metadata.media_storage_path,
      metadata.mediaStoragePath,
      metadata.thumbnail_storage_path,
      metadata.thumbnailStoragePath,
    ].filter(Boolean);

    const uniqueStoragePaths = [
      ...new Set(storagePaths),
    ];

    if (uniqueStoragePaths.length > 0) {
      const { error: storageError } =
        await supabase.storage
          .from(RESOURCE_BUCKET)
          .remove(uniqueStoragePaths);

      if (storageError) {
        throw new Error(
          `RESOURCE_DELETE:${storageError.message}`,
        );
      }
    }

    const { error: deleteError } =
      await supabase
        .from('partner_resources')
        .delete()
        .eq('id', resourceId);

    if (deleteError) {
      throw new Error(
        `RESOURCE_DELETE:${deleteError.message}`,
      );
    }

    return {
      deleted: true,
      resourceId,
    };
  },

  async deletePartnerResourceFile(
    storagePath,
  ) {
    await this.requireSuperAdmin();

    if (!storagePath) {
      return {
        deleted: false,
      };
    }

    const { error } =
      await supabase.storage
        .from(RESOURCE_BUCKET)
        .remove([storagePath]);

    if (error) {
      throw new Error(
        `RESOURCE_DELETE:${error.message}`,
      );
    }

    return {
      deleted: true,
      path: storagePath,
    };
  },

  async signInWithPassword(
    email,
    password,
  ) {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      throw error;
    }

    try {
      await invoke('auth-register', {
        action: 'syncRole',
      });
    } catch {
      // La sincronización es opcional.
    }

    const profile =
      await this.getMyProfile();

    return {
      session: data.session,
      profile,
    };
  },

  registerAccount(payload) {
    return invoke('auth-register', {
      action: 'register',
      payload,
    });
  },

  async getPartnerBranding() {
    return invoke('partner-commerce', {
      action: 'getBranding',
    });
  },

  async uploadBrandAsset(file, { folder = 'logos', assetType = 'image' } = {}) {
    const profile = await this.getMyProfile();
    if (!profile) {
      throw new Error(ERROR_HINTS.FORBIDDEN);
    }

    if (!file) {
      throw new Error(assetType === 'video' ? 'Selecciona un video.' : 'Selecciona una imagen.');
    }

    const mimeType = String(file.type || '').toLowerCase();
    const isVideo = assetType === 'video';

    if (isVideo) {
      if (!ALLOWED_BRAND_VIDEO_TYPES.has(mimeType)) {
        throw new Error('Usa MP4, WebM o MOV.');
      }
      if (file.size > MAX_BRAND_VIDEO_SIZE) {
        throw new Error('El video no puede superar 50 MB.');
      }
    } else if (!ALLOWED_BRAND_IMAGE_TYPES.has(mimeType)) {
      throw new Error('Usa PNG, JPG, JPEG o WEBP.');
    } else if (file.size > MAX_BRAND_IMAGE_SIZE) {
      throw new Error('La imagen no puede superar 2 MB.');
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      throw new Error('Debes iniciar sesión para subir archivos.');
    }

    const extension = sanitizeStorageFileName(
      (file.name.split('.').pop() || (isVideo ? 'mp4' : 'png')).toLowerCase(),
    ).replace(/\.+/g, '');
    const partnerScope = profile.partner_id
      ? `partners/${profile.partner_id}`
      : 'partners/unassigned';
    const cleanFolder = String(folder || 'logos').replace(/[^a-zA-Z0-9/_-]/g, '-');
    const storagePath = `${partnerScope}/${cleanFolder}/${userData.user.id}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BRAND_ASSETS_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`No se pudo subir el ${isVideo ? 'video' : 'imagen'}: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(BRAND_ASSETS_BUCKET)
      .getPublicUrl(storagePath);

    if (!publicUrlData?.publicUrl) {
      await supabase.storage.from(BRAND_ASSETS_BUCKET).remove([storagePath]);
      throw new Error(`Supabase no devolvió la URL pública del ${isVideo ? 'video' : 'imagen'}.`);
    }

    return {
      url: publicUrlData.publicUrl,
      path: storagePath,
    };
  },

  savePartnerBranding(payload) {
    return invoke('partner-commerce', {
      action: 'saveBranding',
      payload,
    });
  },

  getPartnerEmailTemplates() {
    return invoke('partner-commerce', {
      action: 'getPartnerEmailTemplates',
    }).catch(async (error) => {
      if (!isUnknownActionError(error)) throw error;
      return getPartnerEmailTemplatesFromBranding();
    });
  },

  savePartnerEmailTemplates(payload) {
    return invoke('partner-commerce', {
      action: 'savePartnerEmailTemplates',
      payload,
    }).catch(async (error) => {
      if (!isUnknownActionError(error)) throw error;
      return savePartnerEmailTemplatesViaBranding(payload);
    });
  },

  sendPartnerEmailTemplateTest(templateId, to = null) {
    return invoke('partner-commerce', {
      action: 'sendPartnerEmailTemplateTest',
      payload: { templateId, to },
    }).catch((error) => {
      if (!isUnknownActionError(error)) throw error;
      throw new Error(
        'El envío de prueba requiere desplegar partner-commerce. Ejecuta: supabase functions deploy partner-commerce --project-ref jwtymqtwlbifojtvxwpx',
      );
    });
  },

  listPartnerOffers() {
    return invoke('partner-commerce', {
      action: 'listOffers',
    });
  },

  listPartnerCatalog() {
    return invoke('partner-commerce', {
      action: 'listPartnerCatalog',
    });
  },

  getPartnerStorefront(slug) {
    return invoke('partner-storefront', {
      action: 'getStorefront',
      payload: { slug },
    });
  },

  getPartnerCheckout(slug, productId, linkToken = null) {
    return invoke('partner-storefront', {
      action: 'getCheckout',
      payload: {
        slug,
        productId,
        linkToken,
      },
    });
  },

  async createPartnerCheckoutSession(payload) {
    const data = await invoke('partner-storefront', {
      action: 'createCheckoutSession',
      payload,
    });

    return {
      ...data,
      clientSecret: data?.clientSecret || data?.client_secret || null,
      sessionId: data?.sessionId || data?.session_id || null,
      url: data?.url || null,
    };
  },

  submitPartnerLead(slug, payload) {
    return invoke('partner-storefront', {
      action: 'submitLead',
      payload: { slug, ...payload },
    });
  },

  async listNotifications() {
    const profile = await this.getMyProfile();
    if (!profile) {
      throw new Error(ERROR_HINTS.FORBIDDEN);
    }

    let query = supabase
      .from('platform_notifications')
      .select('id, partner_id, type, title, body, metadata, read_at, created_at')
      .order('created_at', { ascending: false })
      .limit(40);

    if (profile.role === 'partner') {
      if (!profile.partner_id) return { notifications: [] };
      query = query.eq('partner_id', profile.partner_id);
    } else if (profile.role !== 'super_admin') {
      return { notifications: [] };
    }

    const { data, error } = await query;
    if (error) throw error;
    return { notifications: data || [] };
  },

  async markNotificationRead(notificationId) {
    const profile = await this.getMyProfile();
    if (!profile) {
      throw new Error(ERROR_HINTS.FORBIDDEN);
    }

    const { data, error } = await supabase
      .from('platform_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return { notification: data };
  },

  async markAllNotificationsRead() {
    const profile = await this.getMyProfile();
    if (!profile) {
      throw new Error(ERROR_HINTS.FORBIDDEN);
    }

    let query = supabase
      .from('platform_notifications')
      .update({ read_at: new Date().toISOString() })
      .is('read_at', null);

    if (profile.role === 'partner') {
      if (!profile.partner_id) return { ok: true };
      query = query.eq('partner_id', profile.partner_id);
    }

    const { error } = await query;
    if (error) throw error;
    return { ok: true };
  },
  getPaymentProfile() {
    return invoke('partner-commerce', {
      action: 'getPaymentProfile',
      payload: {},
    });
  },

  savePaymentProfile(payload = {}) {
    return invoke('partner-commerce', {
      action: 'savePaymentProfile',
      payload,
    });
  },

  submitPaymentProfile(payload = {}) {
    return invoke('partner-commerce', {
      action: 'submitPaymentProfile',
      payload,
    });
  },

  listPaymentProfiles({ status = null, partnerId = null } = {}) {
    return invoke('platform-admin', {
      action: 'listPaymentProfiles',
      payload: { status, partnerId },
    });
  },

  reviewPaymentProfile({ profileId, decision, notes = null }) {
    return invoke('platform-admin', {
      action: 'reviewPaymentProfile',
      payload: { profileId, decision, notes },
    });
  },
  listSupportTickets(filters = {}) {
    return invoke('partner-commerce', {
      action: 'listSupportTickets',
      payload: filters,
    });
  },

  getSupportTicket(ticketId) {
    return invoke('partner-commerce', {
      action: 'getSupportTicket',
      payload: { ticketId },
    });
  },

  createSupportTicket(payload = {}) {
    return invoke('partner-commerce', {
      action: 'createSupportTicket',
      payload,
    });
  },

  replySupportTicket(payload = {}) {
    return invoke('partner-commerce', {
      action: 'replySupportTicket',
      payload,
    });
  },

  listAdminSupportTickets(filters = {}) {
    return invoke('platform-admin', {
      action: 'listSupportTickets',
      payload: filters,
    });
  },

  getAdminSupportTicket(ticketId) {
    return invoke('platform-admin', {
      action: 'getSupportTicket',
      payload: { ticketId },
    });
  },

  replyAdminSupportTicket(payload = {}) {
    return invoke('platform-admin', {
      action: 'replySupportTicket',
      payload,
    });
  },

  updateSupportTicketStatus(payload = {}) {
    return invoke('platform-admin', {
      action: 'updateSupportTicketStatus',
      payload,
    });
  },
};
