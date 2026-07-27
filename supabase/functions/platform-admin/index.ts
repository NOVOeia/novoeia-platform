import { corsHeaders, handleError, json, requireRole } from '../_shared/core.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { user, supabase } = await requireRole(req, ['super_admin']);
    const { action, payload = {}, provider } = await req.json();

    if (action === 'saveIntegrationSettings') {
      const groups = [
        ['ghl', { clientId: payload.ghlClientId, redirectUri: payload.ghlRedirectUri, scopes: payload.ghlScopes }, { clientSecret: payload.ghlClientSecret }],
        ['stripe', { priceMode: payload.stripePriceMode }, { secretKey: payload.stripeSecretKey, webhookSecret: payload.stripeWebhookSecret }],
        ['supabase', {}, { serviceRoleKey: payload.supabaseServiceRoleKey }],
        ['mcp', { oidcIssuer: payload.oidcIssuer, oidcClientId: payload.oidcClientId, mcpEndpoint: payload.mcpEndpoint }, { oidcClientSecret: payload.oidcClientSecret }],
        ['webhooks', { baseUrl: payload.webhookBaseUrl }, {}],
      ];

      for (const [name, publicConfig, secrets] of groups) {
        await supabase.from('platform_integrations').upsert({
          provider: name,
          public_config: publicConfig,
          encrypted_secret: JSON.stringify(secrets),
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'provider' });
      }

      await supabase.from('audit_logs').insert({ actor_user_id: user.id, action: 'integrations.updated', entity_type: 'platform' });
      return json({ ok: true });
    }

    if (action === 'listPartners') {
      const { data, error } = await supabase.from('partners').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return json({ partners: data });
    }

    if (action === 'createPartner') {
      const { data, error } = await supabase.from('partners').insert(payload).select().single();
      if (error) throw error;
      return json({ partner: data }, 201);
    }

    if (action === 'updatePartner') {
      const { id, ...changes } = payload;
      const { data, error } = await supabase.from('partners').update({ ...changes, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw error;
      return json({ partner: data });
    }

    if (action === 'testIntegration') {
      const { data } = await supabase.from('platform_integrations').select('provider,status,public_config').eq('provider', provider).maybeSingle();
      return json({ connected: Boolean(data), integration: data });
    }

    throw new Error('UNKNOWN_ACTION');
  } catch (error) {
    return handleError(error);
  }
});
