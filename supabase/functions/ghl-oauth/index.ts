import {
  adminClient,
  corsHeaders,
  exchangeGhlCode,
  fetchGhlUser,
  handleError,
  json,
  requireRole,
  resolveAppRole,
} from '../_shared/core.ts';

function ghlEnv() {
  const clientId = Deno.env.get('GHL_CLIENT_ID');
  const clientSecret = Deno.env.get('GHL_CLIENT_SECRET');
  const redirectUri = Deno.env.get('GHL_REDIRECT_URI');
  const scopes = Deno.env.get('GHL_SCOPES');
  if (!clientId || !clientSecret || !redirectUri || !scopes) {
    throw new Error('GHL_OAUTH_NOT_CONFIGURED');
  }
  return { clientId, clientSecret, redirectUri, scopes };
}

async function exchangeWithFallback(code: string, preferred: 'Company' | 'Location') {
  const { clientId, clientSecret, redirectUri } = ghlEnv();
  const order: Array<'Company' | 'Location'> =
    preferred === 'Company' ? ['Company', 'Location'] : ['Location', 'Company'];

  const errors: string[] = [];
  for (const userType of order) {
    try {
      const tokens = await exchangeGhlCode({
        code,
        userType,
        clientId,
        clientSecret,
        redirectUri,
      });
      return { tokens, userType };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  throw new Error(errors.join(' | ') || 'GHL_TOKEN_EXCHANGE_FAILED');
}

async function ensureSupabaseUser(params: {
  supabase: ReturnType<typeof adminClient>;
  email: string;
  fullName: string | null;
  ghlUserId: string;
  suggestedRole: string;
  companyId?: string;
  locationId?: string;
}) {
  const { supabase, email, fullName, ghlUserId, suggestedRole, companyId, locationId } = params;

  const { data: byGhl } = await supabase
    .from('profiles')
    .select('*')
    .eq('ghl_user_id', ghlUserId)
    .maybeSingle();

  let userId = byGhl?.id as string | undefined;
  let existingProfile = byGhl || null;

  if (!userId) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        ghl_user_id: ghlUserId,
        role: suggestedRole,
        provider: 'ghl',
      },
    });

    if (!error && created?.user) {
      userId = created.user.id;
    } else {
      const { data: linkProbe, error: probeError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
      });
      if (probeError) throw error || probeError;
      userId = linkProbe.user?.id;
      if (!userId) throw new Error('USER_RESOLVE_FAILED');
    }
  }

  if (!existingProfile && userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    existingProfile = data;
  }

  const allowlist = (Deno.env.get('GHL_SUPER_ADMIN_EMAILS') || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  let finalRole = suggestedRole;
  if (email && allowlist.includes(email.toLowerCase())) {
    finalRole = 'super_admin';
  } else if (existingProfile?.role) {
    finalRole = existingProfile.role;
  }

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    role: finalRole,
    email,
    full_name: fullName || existingProfile?.full_name || null,
    phone: existingProfile?.phone || null,
    partner_id: existingProfile?.partner_id || null,
    ghl_user_id: ghlUserId,
    ghl_company_id: companyId || existingProfile?.ghl_company_id || null,
    ghl_location_id: locationId || existingProfile?.ghl_location_id || null,
    ghl_sync_status: 'linked',
  }, { onConflict: 'id' });
  if (profileError) throw new Error(`PROFILE_UPSERT:${profileError.message}`);

  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  if (linkError) throw new Error(`SESSION_LINK:${linkError.message}`);

  const tokenHash = linkData.properties?.hashed_token;
  if (!tokenHash) throw new Error('SESSION_TOKEN_MISSING');

  return { userId, role: finalRole, tokenHash, email };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    const action = body.action as string;
    const supabase = adminClient();

    if (action === 'authorize') {
      const purpose = (body.purpose || 'connect') as 'login' | 'connect';
      const userType = (body.userType || (purpose === 'connect' ? 'Company' : 'Location')) as
        | 'Company'
        | 'Location';

      let userId: string | null = null;
      if (purpose === 'connect') {
        const context = await requireRole(req, ['super_admin']);
        userId = context.user.id;
      }

      const { clientId, redirectUri, scopes } = ghlEnv();
      const state = crypto.randomUUID();

      await supabase.from('oauth_states').delete().lt('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());
      const { error } = await supabase.from('oauth_states').insert({
        state,
        purpose,
        user_type: userType,
        user_id: userId,
      });
      if (error) throw error;

      const url = new URL('https://marketplace.gohighlevel.com/oauth/chooselocation');
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('client_id', clientId);
      url.searchParams.set('scope', scopes);
      url.searchParams.set('state', state);

      return json({ authorizationUrl: url.toString(), state, purpose });
    }

    if (action === 'callback') {
      const code = body.code as string | undefined;
      const state = body.state as string | undefined;
      if (!code || !state) throw new Error('MISSING_CODE_OR_STATE');

      const { data: oauthState, error: stateError } = await supabase
        .from('oauth_states')
        .select('*')
        .eq('state', state)
        .maybeSingle();
      if (stateError) throw stateError;
      if (!oauthState) throw new Error('INVALID_OR_EXPIRED_STATE');

      const preferred = (oauthState.user_type || 'Company') as 'Company' | 'Location';
      let tokens;
      let userType: 'Company' | 'Location';
      try {
        ({ tokens, userType } = await exchangeWithFallback(code, preferred));
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'GHL_TOKEN_EXCHANGE_FAILED';
        throw new Error(msg.includes('GHL_TOKEN_') ? msg : `GHL_TOKEN_EXCHANGE_FAILED:${msg}`);
      }

      await supabase.from('oauth_states').delete().eq('state', state);

      if (!tokens.access_token) throw new Error('GHL_ACCESS_TOKEN_MISSING');

      const scopes = tokens.scope ? tokens.scope.split(' ').filter(Boolean) : [];
      const expiresAt = tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null;

      const connectionType = userType === 'Company' ? 'agency' : 'location';
      const { error: connError } = await supabase.from('ghl_connections').upsert({
        company_id: tokens.companyId || null,
        location_id: tokens.locationId || null,
        connection_type: connectionType,
        encrypted_access_token: tokens.access_token,
        encrypted_refresh_token: tokens.refresh_token || null,
        expires_at: expiresAt,
        scopes,
        status: 'active',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'connection_type,company_id,location_id' });
      if (connError) throw new Error(`GHL_CONNECTION_SAVE:${connError.message}`);

      const { error: integrationError } = await supabase.from('platform_integrations').upsert({
        provider: 'ghl',
        status: 'connected',
        public_config: {
          companyId: tokens.companyId || null,
          locationId: tokens.locationId || null,
          userType,
        },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'provider' });
      if (integrationError) throw new Error(`INTEGRATION_SAVE:${integrationError.message}`);

      if (oauthState.purpose === 'connect') {
        await supabase.from('audit_logs').insert({
          actor_user_id: oauthState.user_id,
          action: 'ghl.connected',
          entity_type: 'ghl_connection',
          metadata: { companyId: tokens.companyId, locationId: tokens.locationId, userType },
        });
        return json({
          purpose: 'connect',
          connected: true,
          companyId: tokens.companyId || null,
          locationId: tokens.locationId || null,
          userType,
        });
      }

      if (oauthState.purpose === 'login' && userType === 'Location') {
        throw new Error('CLIENTS_NO_PLATFORM_ACCESS');
      }

      if (!tokens.userId) throw new Error('GHL_USER_MISSING');

      const ghlUser = await fetchGhlUser(tokens.userId, tokens.access_token);
      const email =
        ghlUser?.email ||
        ghlUser?.user?.email ||
        `ghl_${tokens.userId}@users.novoeia.local`;
      const fullName =
        ghlUser?.name ||
        ghlUser?.user?.name ||
        [ghlUser?.firstName, ghlUser?.lastName].filter(Boolean).join(' ') ||
        'Usuario HighLevel';

      const suggestedRole = resolveAppRole(email, userType);
      const session = await ensureSupabaseUser({
        supabase,
        email,
        fullName,
        ghlUserId: tokens.userId,
        suggestedRole,
        companyId: tokens.companyId,
        locationId: tokens.locationId,
      });

      await supabase.from('audit_logs').insert({
        actor_user_id: session.userId,
        action: 'auth.ghl_login',
        entity_type: 'profile',
        entity_id: session.userId,
        metadata: { companyId: tokens.companyId, locationId: tokens.locationId, userType, role: session.role },
      });

      return json({
        purpose: 'login',
        email: session.email,
        role: session.role,
        tokenHash: session.tokenHash,
      });
    }

    throw new Error('UNKNOWN_ACTION');
  } catch (error) {
    return handleError(error);
  }
});
