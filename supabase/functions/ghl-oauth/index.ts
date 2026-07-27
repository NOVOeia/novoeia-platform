import { corsHeaders, handleError, json, requireRole } from '../_shared/core.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    await requireRole(req, ['super_admin']);
    const { action } = await req.json();
    if (action !== 'authorize') throw new Error('UNKNOWN_ACTION');

    const clientId = Deno.env.get('GHL_CLIENT_ID');
    const redirectUri = Deno.env.get('GHL_REDIRECT_URI');
    const scopes = Deno.env.get('GHL_SCOPES');
    if (!clientId || !redirectUri || !scopes) throw new Error('GHL_OAUTH_NOT_CONFIGURED');

    const state = crypto.randomUUID();
    const url = new URL('https://marketplace.gohighlevel.com/oauth/chooselocation');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('scope', scopes);
    url.searchParams.set('state', state);

    return json({ authorizationUrl: url.toString(), state });
  } catch (error) {
    return handleError(error);
  }
});
