import { supabase } from './supabase.js';

const GHL_OAUTH_STATE_KEY = 'novoeia_ghl_oauth_state';

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

const ERROR_HINTS = {
  INVALID_OR_EXPIRED_STATE: 'La sesión OAuth expiró o falta la tabla oauth_states. Vuelve a iniciar con HighLevel.',
  MISSING_CODE_OR_STATE: 'Faltan datos OAuth. Intenta de nuevo desde el login.',
  GHL_OAUTH_NOT_CONFIGURED: 'Faltan secrets GHL en Supabase → Edge Functions → Secrets.',
  GHL_TOKEN_EXCHANGE_FAILED: 'HighLevel rechazó el intercambio del código. Instala la app Private desde GHL y vuelve a intentar.',
  GHL_ACCESS_TOKEN_MISSING: 'HighLevel no devolvió access_token.',
  GHL_CONNECTION_SAVE: 'No se pudo guardar la conexión GHL en la base de datos.',
  INTEGRATION_SAVE: 'No se pudo actualizar platform_integrations.',
  PROFILE_UPSERT: 'No se pudo guardar el perfil del usuario.',
  SESSION_LINK: 'No se pudo generar la sesión Supabase.',
  GHL_USER_MISSING: 'HighLevel no devolvió userId. Agrega el scope users.readonly.',
  SESSION_TOKEN_MISSING: 'No se pudo crear la sesión en Supabase Auth.',
  EMAIL_ALREADY_REGISTERED: 'Este correo ya está registrado. Si fue un registro incompleto, usa la misma contraseña para completarlo, o inicia sesión.',
  INVALID_CREDENTIALS: 'Correo inválido o contraseña muy corta (mínimo 8 caracteres).',
  MISSING_REQUIRED_FIELDS: 'Completa empresa y responsable.',
  PARTNER_REGISTRATION_ONLY: 'Solo partners pueden registrarse en la plataforma.',
  CLIENTS_NO_PLATFORM_ACCESS: 'Los clientes finales no tienen acceso. Ingresa con una cuenta de partner o Super Admin.',
  CLIENT_NAME_REQUIRED: 'El nombre del cliente es obligatorio.',
  USER_RESOLVE_FAILED: 'No se pudo crear ni encontrar el usuario en Supabase.',
  FORBIDDEN: 'No tienes permisos de Super Admin para ver partners.',
  PROFILE_NOT_FOUND: 'Perfil de usuario no encontrado. Vuelve a iniciar sesión.',
  STRIPE_NOT_CONFIGURED: 'Falta STRIPE_SECRET_KEY en Supabase → Edge Functions → Secrets.',
  PUBLIC_APP_URL_NOT_CONFIGURED: 'Falta PUBLIC_APP_URL en Supabase secrets (URL de Netlify o localhost).',
  STRIPE_PRODUCT_NOT_CONFIGURED: 'El producto no tiene stripe_product_id. Aplica la migración del catálogo.',
  PRICE_BELOW_WHOLESALE: 'El precio de venta no puede ser menor al costo mayorista.',
  INVALID_CHECKOUT_PAYLOAD: 'Selecciona producto y define un precio de venta válido.',
  PRODUCT_NOT_FOUND: 'Producto no encontrado en el catálogo.',
  PARTNER_NOT_ASSIGNED: 'Tu cuenta partner no está vinculada a un partner.',
};

async function parseFunctionError(error, data) {
  if (data?.error) {
    const raw = String(data.error);
    if (raw.startsWith('STRIPE_CHECKOUT:')) return `Stripe: ${raw.replace('STRIPE_CHECKOUT:', '')}`;
    if (raw.startsWith('STRIPE_PAYMENT_LINK:')) return `Stripe: ${raw.replace('STRIPE_PAYMENT_LINK:', '')}`;
    const msg = ERROR_HINTS[data.error] || data.error;
    if (String(msg).includes('invalid_request')) {
      return 'El código OAuth ya fue usado o expiró. Vuelve a Ingresar → Continuar con HighLevel.';
    }
    return msg;
  }

  if (error?.context && typeof error.context.json === 'function') {
    try {
      const payload = await error.context.json();
      if (payload?.error) {
        const msg = ERROR_HINTS[payload.error] || payload.error;
        if (String(msg).includes('invalid_request')) {
          return 'El código OAuth ya fue usado o expiró. Vuelve a Ingresar → Continuar con HighLevel.';
        }
        return msg;
      }
    } catch {
      // ignore parse errors
    }
  }

  if (error?.message === 'Edge Function returned a non-2xx status code') {
    return 'La Edge Function falló. Revisa Supabase → Edge Functions → Logs.';
  }

  const raw = error?.message || '';
  if (raw.startsWith('STRIPE_CHECKOUT:')) return raw.replace('STRIPE_CHECKOUT:', 'Stripe: ');
  if (raw.startsWith('STRIPE_PAYMENT_LINK:')) return raw.replace('STRIPE_PAYMENT_LINK:', 'Stripe: ');

  return raw || 'Error de conexión';
}

async function invoke(functionName, body = {}) {
  const { data, error } = await supabase.functions.invoke(functionName, { body });
  if (error) throw new Error(await parseFunctionError(error, data));
  if (data?.error) throw new Error(ERROR_HINTS[data.error] || data.error);
  return data;
}

function roleToDashboard(role) {
  if (role === 'super_admin') return 'admin-dashboard';
  if (role === 'partner') return 'partner-dashboard';
  return 'client-dashboard';
}

export const platformApi = {
  getSession: () => supabase.auth.getSession(),
  signOut: () => supabase.auth.signOut(),
  roleToDashboard,

  async getMyProfile() {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getPlatformSettings() {
    const { data, error } = await supabase
      .from('platform_settings_public')
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  saveIntegrationSettings(payload) {
    return invoke('platform-admin', { action: 'saveIntegrationSettings', payload });
  },

  testIntegration(provider) {
    return invoke('platform-admin', { action: 'testIntegration', provider });
  },

  startGhlOAuth(purpose = 'connect', userType) {
    return invoke('ghl-oauth', {
      action: 'authorize',
      purpose,
      userType: userType || (purpose === 'connect' ? 'Company' : 'Location'),
    }).then((data) => {
      if (data?.state) {
        sessionStorage.setItem(GHL_OAUTH_STATE_KEY, JSON.stringify({
          state: data.state,
          purpose: data.purpose || purpose,
        }));
      }
      return data;
    });
  },

  startGhlLogin() {
    return this.startGhlOAuth('login', 'Company');
  },

  readPendingGhlOAuth() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return null;
    const state = params.get('state') || readStoredGhlState()?.state || null;
    return { code, state };
  },

  completeGhlOAuth({ code, state }) {
    return invoke('ghl-oauth', { action: 'callback', code, state }).finally(clearStoredGhlState);
  },

  async establishGhlSession(tokenHash) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'magiclink',
    });
    if (error) throw error;
    return data;
  },

  syncGhlLocations() {
    return invoke('ghl-proxy', { action: 'syncLocations' });
  },

  async listPartners() {
    const profile = await this.getMyProfile();
    if (profile?.role !== 'super_admin') {
      throw new Error('FORBIDDEN');
    }

    const { data, error } = await supabase
      .from('partners')
      .select('id, name, slug, status, plan_name, ghl_location_id, branding, created_at, owner_user_id')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { partners: data || [] };
  },

  createPartner(payload) {
    return invoke('platform-admin', { action: 'createPartner', payload });
  },

  updatePartner(payload) {
    return invoke('platform-admin', { action: 'updatePartner', payload });
  },

  listCatalog() {
    return invoke('partner-commerce', { action: 'listCatalog' });
  },

  async listCatalogProducts() {
    const profile = await this.getMyProfile();
    if (profile?.role !== 'super_admin') throw new Error('FORBIDDEN');

    const { data, error } = await supabase
      .from('catalog_products')
      .select('*')
      .order('name');

    if (error) throw error;
    return { products: data || [] };
  },

  async saveCatalogProduct(payload) {
    const profile = await this.getMyProfile();
    if (profile?.role !== 'super_admin') throw new Error('FORBIDDEN');

    const row = {
      name: payload.name,
      description: payload.description || null,
      wholesale_price: Number(payload.wholesalePrice),
      suggested_price: payload.suggestedPrice != null ? Number(payload.suggestedPrice) : null,
      currency: payload.currency || 'USD',
      billing_type: 'recurring',
      interval: payload.interval,
      stripe_product_id: payload.stripeProductId || null,
      stripe_price_id: payload.stripePriceId || null,
      active: payload.active !== false,
      metadata: payload.metadata || {},
    };

    if (payload.id) {
      const { data, error } = await supabase
        .from('catalog_products')
        .update(row)
        .eq('id', payload.id)
        .select()
        .single();
      if (error) throw error;
      return { product: data };
    }

    const { data, error } = await supabase
      .from('catalog_products')
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return { product: data };
  },

  savePartnerOffer(payload) {
    return invoke('partner-commerce', { action: 'saveOffer', payload });
  },

  generateCheckoutLink(payload) {
    return invoke('stripe-checkout', { action: 'createSession', payload });
  },

  listPartnerClients() {
    return invoke('partner-commerce', { action: 'listClients' });
  },

  async signInWithPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    try {
      await invoke('auth-register', { action: 'syncRole' });
    } catch {
      // syncRole is optional; ignore if edge function is unavailable
    }

    const profile = await this.getMyProfile();
    return { session: data.session, profile };
  },

  registerAccount(payload) {
    return invoke('auth-register', { action: 'register', payload });
  },

  createPartnerClient(payload) {
    return invoke('partner-commerce', { action: 'createClient', payload });
  },

  savePartnerBranding(payload) {
    return invoke('partner-commerce', { action: 'saveBranding', payload });
  },
};
