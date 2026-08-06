import { supabase } from './supabase.js';

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
    'Falta STRIPE_SECRET_KEY en Supabase → Edge Functions → Secrets.',

  PUBLIC_APP_URL_NOT_CONFIGURED:
    'Falta PUBLIC_APP_URL en Supabase Secrets.',

  STRIPE_PRODUCT_NOT_CONFIGURED:
    'El producto no tiene stripe_product_id.',

  PRICE_BELOW_WHOLESALE:
    'El precio de venta no puede ser menor al costo mayorista.',

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

async function parseFunctionError(error, data) {
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
    return 'La Edge Function falló. Revisa Supabase → Edge Functions → Logs.';
  }

  if (
    error?.message?.includes('Failed to send a request to the Edge Function')
  ) {
    return 'No se pudo conectar con la Edge Function. Verifica que esté desplegada en Supabase.';
  }

  return translateKnownError(error?.message);
}

async function invoke(functionName, body = {}) {
  const { data, error } =
    await supabase.functions.invoke(functionName, {
      body,
    });

  if (error) {
    throw new Error(
      await parseFunctionError(error, data),
    );
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

export const platformApi = {
  getSession: () => supabase.auth.getSession(),

  signOut: () => supabase.auth.signOut(),

  roleToDashboard,

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

  async updatePartner(payload) {
    await this.requireSuperAdmin();

    const id = payload.id;
    if (!id) {
      throw new Error('MISSING_REQUIRED_FIELDS');
    }

    const patch = {
      updated_at: new Date().toISOString(),
    };

    if (payload.name != null) patch.name = String(payload.name).trim();
    if (payload.slug != null) patch.slug = String(payload.slug).trim().toLowerCase();
    if (payload.plan_name != null) patch.plan_name = payload.plan_name;
    if (payload.status != null) patch.status = payload.status;
    if (payload.ghl_location_id !== undefined) {
      patch.ghl_location_id = payload.ghl_location_id || null;
    }

    const { data, error } = await supabase
      .from('partners')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { partner: data };
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
        partners:partner_id ( id, name, slug )
      `)
      .order('created_at', { ascending: false });

    if (partnerId) query = query.eq('partner_id', partnerId);
    if (status) query = query.eq('status', status);

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
        partners:partner_id ( name, slug ),
        partner_clients:client_id ( company_name, name, email )
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
};