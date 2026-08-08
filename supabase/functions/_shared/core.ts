import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function adminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );
}

export async function requireUser(req: Request) {
  const auth = req.headers.get('Authorization');
  if (!auth) throw new Error('UNAUTHORIZED');
  const supabase = adminClient();
  const token = auth.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error('UNAUTHORIZED');
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
  if (!profile) throw new Error('PROFILE_NOT_FOUND');
  return { user: data.user, profile, supabase };
}

export async function requireRole(req: Request, roles: string[]) {
  const context = await requireUser(req);
  if (!roles.includes(context.profile.role)) throw new Error('FORBIDDEN');
  return context;
}

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function handleError(error: unknown) {
  const message = formatErrorMessage(error);
  console.error('[edge-error]', message, error);
  const status = message === 'UNAUTHORIZED' ? 401 : message === 'FORBIDDEN' ? 403 : 400;
  return json({ error: message }, status);
}

export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  return 'UNKNOWN_ERROR';
}

export function ghlApiErrorMessage(payload: Record<string, unknown>, status: number, prefix = 'GHL'): string {
  const message = payload?.message;
  if (typeof message === 'string' && message.trim()) return message;
  if (message && typeof message === 'object') {
    return `${prefix}_${status}:${formatErrorMessage(message)}`;
  }

  const error = payload?.error;
  if (typeof error === 'string' && error.trim()) return error;
  if (Array.isArray(error)) return error.map((item) => formatErrorMessage(item)).join(', ');

  const keys = Object.keys(payload || {});
  if (keys.length) return `${prefix}_${status}:${formatErrorMessage(payload)}`;
  return `${prefix}_${status}`;
}

export async function ghlRequest(path: string, token: string, init: RequestInit = {}) {
  const response = await fetch(`https://services.leadconnectorhq.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Version: '2021-07-28',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) throw new Error(ghlApiErrorMessage(payload, response.status));
  return payload;
}

export type GhlTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  userType?: string;
  companyId?: string;
  locationId?: string;
  userId?: string;
};

export async function exchangeGhlCode(params: {
  code: string;
  userType: 'Company' | 'Location';
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<GhlTokenResponse> {
  const response = await fetch('https://services.leadconnectorhq.com/oauth/token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      Version: '2021-07-28',
    },
    body: new URLSearchParams({
      client_id: params.clientId,
      client_secret: params.clientSecret,
      grant_type: 'authorization_code',
      code: params.code,
      user_type: params.userType,
      redirect_uri: params.redirectUri,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload?.message || payload?.error_description
      || (Array.isArray(payload?.error) ? payload.error.join(', ') : payload?.error)
      || JSON.stringify(payload);
    throw new Error(`GHL_TOKEN_${response.status}:${detail}`);
  }
  return payload as GhlTokenResponse;
}

export async function loadGhlOAuthConfig(
  supabase: ReturnType<typeof adminClient>,
) {
  const { data } = await supabase
    .from('platform_integrations')
    .select('public_config, encrypted_secret')
    .eq('provider', 'ghl')
    .maybeSingle();

  const publicConfig = (data?.public_config || {}) as Record<string, string>;
  const secrets = data?.encrypted_secret
    ? JSON.parse(data.encrypted_secret as string)
    : {};

  const clientId = publicConfig.clientId || Deno.env.get('GHL_CLIENT_ID') || '';
  const clientSecret = secrets.clientSecret || Deno.env.get('GHL_CLIENT_SECRET') || '';
  const redirectUri = publicConfig.redirectUri || Deno.env.get('GHL_REDIRECT_URI') || '';

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('GHL_OAUTH_NOT_CONFIGURED');
  }

  return { clientId, clientSecret, redirectUri };
}

export async function loadStripeConfig(
  supabase: ReturnType<typeof adminClient>,
) {
  const { data } = await supabase
    .from('platform_integrations')
    .select('public_config, encrypted_secret')
    .eq('provider', 'stripe')
    .maybeSingle();

  const publicConfig = (data?.public_config || {}) as Record<string, string>;
  const secrets = data?.encrypted_secret
    ? JSON.parse(data.encrypted_secret as string)
    : {};

  const secretKey = secrets.secretKey || Deno.env.get('STRIPE_SECRET_KEY') || '';
  const webhookSecret = secrets.webhookSecret || Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
  const publishableKey = publicConfig.publishableKey
    || Deno.env.get('STRIPE_PUBLISHABLE_KEY')
    || Deno.env.get('VITE_STRIPE_PUBLISHABLE_KEY')
    || '';
  const priceMode = publicConfig.priceMode || 'test';

  return { secretKey, webhookSecret, publishableKey, priceMode };
}

function normalizeScopeList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return [...new Set(
    raw
      .replace(/,/g, ' ')
      .split(/\s+/)
      .map((scope) => scope.trim())
      .filter(Boolean),
  )];
}

export async function resolveGhlOAuthScopes(
  supabase: ReturnType<typeof adminClient>,
): Promise<string> {
  const { data } = await supabase
    .from('platform_integrations')
    .select('public_config')
    .eq('provider', 'ghl')
    .maybeSingle();

  const publicConfig = (data?.public_config || {}) as Record<string, unknown>;
  const dbScopes = normalizeScopeList(
    typeof publicConfig.scopes === 'string' ? publicConfig.scopes : null,
  );

  if (dbScopes.length > 0) {
    return dbScopes.join(' ');
  }

  const envScopes = normalizeScopeList(Deno.env.get('GHL_SCOPES'));
  if (envScopes.length > 0) {
    return envScopes.join(' ');
  }

  throw new Error('GHL_OAUTH_NOT_CONFIGURED');
}

function normalizeEmailAllowlist(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return [...new Set(
    raw
      .split(/[,;\n]+/)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  )];
}

export async function loadSuperAdminEmails(
  supabase: ReturnType<typeof adminClient>,
): Promise<string[]> {
  const { data } = await supabase
    .from('platform_integrations')
    .select('public_config')
    .eq('provider', 'security')
    .maybeSingle();

  const publicConfig = (data?.public_config || {}) as Record<string, unknown>;
  const dbEmails = normalizeEmailAllowlist(
    typeof publicConfig.superAdminEmails === 'string' ? publicConfig.superAdminEmails : null,
  );

  if (dbEmails.length > 0) {
    return dbEmails;
  }

  return normalizeEmailAllowlist(Deno.env.get('GHL_SUPER_ADMIN_EMAILS'));
}

export function resolveAppRoleWithAllowlist(
  email: string | null | undefined,
  userType: string | undefined,
  allowlist: string[],
) {
  if (email && allowlist.includes(email.toLowerCase())) return 'super_admin';
  if (userType === 'Company') return 'partner';
  return 'client';
}

export async function loadGhlPlatformConfig(
  supabase: ReturnType<typeof adminClient>,
) {
  const { data } = await supabase
    .from('platform_integrations')
    .select('public_config')
    .eq('provider', 'ghl')
    .maybeSingle();

  const config = (data?.public_config || {}) as Record<string, unknown>;
  const hasSaasEnabled = config.saasEnabled !== undefined && config.saasEnabled !== null;
  const hasSaasV2 = config.saasV2 !== undefined && config.saasV2 !== null;

  return {
    saasEnabled: hasSaasEnabled
      ? (config.saasEnabled === true || config.saasEnabled === 'true')
      : Deno.env.get('GHL_SAAS_ENABLED') === 'true',
    saasV2: hasSaasV2
      ? (config.saasV2 !== false && config.saasV2 !== 'false')
      : Deno.env.get('GHL_SAAS_V2') !== 'false',
    defaultTimezone: String(config.defaultTimezone || Deno.env.get('GHL_DEFAULT_TIMEZONE') || 'America/New_York'),
    defaultSaasPlanId: config.defaultSaasPlanId
      ? String(config.defaultSaasPlanId)
      : (Deno.env.get('GHL_DEFAULT_SAAS_PLAN_ID') || null),
    defaultSaasPriceId: config.defaultSaasPriceId
      ? String(config.defaultSaasPriceId)
      : (Deno.env.get('GHL_DEFAULT_SAAS_PRICE_ID') || null),
  };
}

export async function loadPlatformUrls(
  supabase: ReturnType<typeof adminClient>,
) {
  const { data } = await supabase
    .from('platform_integrations')
    .select('public_config')
    .eq('provider', 'webhooks')
    .maybeSingle();

  const publicConfig = (data?.public_config || {}) as Record<string, string>;
  const publicAppUrl = (publicConfig.publicAppUrl || Deno.env.get('PUBLIC_APP_URL') || '')
    .trim()
    .replace(/\/$/, '');
  const webhookBaseUrl = (publicConfig.baseUrl || '')
    .trim()
    .replace(/\/$/, '');

  return { publicAppUrl, webhookBaseUrl };
}

export async function refreshGhlAccessToken(refreshToken: string): Promise<GhlTokenResponse> {
  const supabase = adminClient();
  const { clientId, clientSecret } = await loadGhlOAuthConfig(supabase);

  const response = await fetch('https://services.leadconnectorhq.com/oauth/token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      Version: '2021-07-28',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload?.message || payload?.error_description
      || (Array.isArray(payload?.error) ? payload.error.join(', ') : payload?.error)
      || JSON.stringify(payload);
    throw new Error(`GHL_REFRESH_${response.status}:${detail}`);
  }
  return payload as GhlTokenResponse;
}

export async function fetchGhlUser(userId: string, token: string) {
  try {
    return await ghlRequest(`/users/${encodeURIComponent(userId)}`, token);
  } catch {
    return null;
  }
}

export async function resolveAppRole(
  supabase: ReturnType<typeof adminClient>,
  email: string | null | undefined,
  userType?: string,
) {
  const allowlist = await loadSuperAdminEmails(supabase);
  return resolveAppRoleWithAllowlist(email, userType, allowlist);
}
