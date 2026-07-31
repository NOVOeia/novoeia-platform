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
  const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  console.error('[edge-error]', message, error);
  const status = message === 'UNAUTHORIZED' ? 401 : message === 'FORBIDDEN' ? 403 : 400;
  return json({ error: message }, status);
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
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || `GHL_${response.status}`);
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

export async function fetchGhlUser(userId: string, token: string) {
  try {
    return await ghlRequest(`/users/${encodeURIComponent(userId)}`, token);
  } catch {
    return null;
  }
}

export function resolveAppRole(email: string | null | undefined, userType?: string) {
  const allowlist = (Deno.env.get('GHL_SUPER_ADMIN_EMAILS') || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (email && allowlist.includes(email.toLowerCase())) return 'super_admin';
  if (userType === 'Company') return 'partner';
  return 'client';
}
