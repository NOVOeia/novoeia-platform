import { corsHeaders, formatErrorMessage, ghlRequest, handleError, json, requireRole } from '../_shared/core.ts';
import { provisionPartnerClientInGhl, loadActiveAgencyConnection } from '../_shared/ghl-provision.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = await req.json();
    const action = body.action as string | undefined;
    const { supabase, user } = await requireRole(req, ['super_admin']);

    if (action === 'provisionClient') {
      const clientId = body.clientId as string | undefined;
      if (!clientId) throw new Error('CLIENT_ID_REQUIRED');

      try {
        const result = await provisionPartnerClientInGhl(supabase, {
          clientId,
          offerId: body.offerId || null,
          catalogProductId: body.catalogProductId || null,
          stripeCustomerId: body.stripeCustomerId || null,
        });

        await supabase.from('audit_logs').insert({
          actor_user_id: user.id,
          action: result.skipped ? 'ghl.client_provision_skipped' : 'ghl.client_provisioned_manual',
          entity_type: 'partner_client',
          entity_id: clientId,
          metadata: result,
        });

        return json(result);
      } catch (error) {
        const message = formatErrorMessage(error);
        console.error('[ghl-provision-manual]', message, error);

        await supabase
          .from('partner_clients')
          .update({ ghl_sync_status: 'failed' })
          .eq('id', clientId);

        await supabase.from('audit_logs').insert({
          actor_user_id: user.id,
          action: 'ghl.provision_failed',
          entity_type: 'partner_client',
          entity_id: clientId,
          metadata: {
            source: 'manual_retry',
            offerId: body.offerId || null,
            error: message,
          },
        });

        throw error;
      }
    }

    const connection = await loadActiveAgencyConnection(supabase);
    if (!connection) throw new Error('GHL_AGENCY_NOT_CONNECTED');

    const token = connection.encrypted_access_token;

    if (action === 'syncLocations') {
      const payload = await ghlRequest(
        `/locations/search?companyId=${encodeURIComponent(connection.company_id || '')}&limit=100`,
        token,
      );
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
