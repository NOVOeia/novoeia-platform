import { corsHeaders, ghlRequest, handleError, json, requireRole } from '../_shared/core.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { supabase } = await requireRole(req, ['super_admin']);
    const { action } = await req.json();

    const { data: connection, error } = await supabase
      .from('ghl_connections')
      .select('*')
      .eq('connection_type', 'agency')
      .eq('status', 'active')
      .maybeSingle();
    if (error) throw error;
    if (!connection) throw new Error('GHL_AGENCY_NOT_CONNECTED');

    // Replace this with Vault/KMS decryption in production.
    const token = connection.encrypted_access_token;

    if (action === 'syncLocations') {
      const payload = await ghlRequest(`/locations/search?companyId=${encodeURIComponent(connection.company_id || '')}&limit=100`, token);
      const locations = payload.locations || [];
      for (const location of locations) {
        await supabase.from('partners')
          .update({ ghl_location_id: location.id, updated_at: new Date().toISOString() })
          .eq('slug', location.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
      }
      return json({ count: locations.length, locations });
    }

    throw new Error('UNKNOWN_ACTION');
  } catch (error) {
    return handleError(error);
  }
});
