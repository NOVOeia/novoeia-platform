import { adminClient, ghlRequest, refreshGhlAccessToken } from './core.ts';

type SupabaseAdmin = ReturnType<typeof adminClient>;

export type GhlProvisionResult = {
  locationId: string | null;
  saasEnabled: boolean;
  skipped?: boolean;
  reason?: string;
};

type AgencyConnection = {
  id: string;
  company_id: string | null;
  encrypted_access_token: string;
  encrypted_refresh_token: string | null;
  expires_at: string | null;
};

type PartnerClientRow = {
  id: string;
  partner_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company_name?: string | null;
  ghl_location_id: string | null;
  ghl_sync_status: string | null;
  country?: string | null;
  city?: string | null;
};

async function ghlSaasRequest(path: string, token: string, init: RequestInit = {}) {
  const response = await fetch(`https://services.leadconnectorhq.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Version: '2021-04-15',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || `GHL_SAAS_${response.status}`);
  }
  return payload;
}

async function loadAgencyConnection(supabase: SupabaseAdmin): Promise<AgencyConnection | null> {
  const { data, error } = await supabase
    .from('ghl_connections')
    .select('id, company_id, encrypted_access_token, encrypted_refresh_token, expires_at')
    .eq('connection_type', 'agency')
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw error;
  return data as AgencyConnection | null;
}

async function resolveAgencyToken(
  supabase: SupabaseAdmin,
  connection: AgencyConnection,
): Promise<{ token: string; companyId: string }> {
  if (!connection.company_id) throw new Error('GHL_AGENCY_COMPANY_ID_MISSING');

  let token = connection.encrypted_access_token;
  const expiresAt = connection.expires_at ? Date.parse(connection.expires_at) : NaN;
  const shouldRefresh = Number.isFinite(expiresAt) && expiresAt <= Date.now() + 60_000;

  if (shouldRefresh && connection.encrypted_refresh_token) {
    const refreshed = await refreshGhlAccessToken(connection.encrypted_refresh_token);
    token = refreshed.access_token;

    await supabase
      .from('ghl_connections')
      .update({
        encrypted_access_token: refreshed.access_token,
        encrypted_refresh_token: refreshed.refresh_token || connection.encrypted_refresh_token,
        expires_at: refreshed.expires_in
          ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
          : connection.expires_at,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection.id);
  }

  return { token, companyId: connection.company_id };
}

function extractLocationId(payload: Record<string, unknown>): string | null {
  const location = payload.location as Record<string, unknown> | undefined;
  const candidate = location?.id || payload.id || payload.locationId;
  return candidate ? String(candidate) : null;
}

async function loadSaasConfig(
  supabase: SupabaseAdmin,
  offerId: string | null,
  catalogProductId: string | null,
) {
  let saasPlanId = Deno.env.get('GHL_DEFAULT_SAAS_PLAN_ID') || null;
  let priceId = Deno.env.get('GHL_DEFAULT_SAAS_PRICE_ID') || null;

  if (offerId) {
    const { data: offer } = await supabase
      .from('partner_offers')
      .select('ghl_price_id, product_id, catalog_products:product_id ( ghl_product_id, metadata )')
      .eq('id', offerId)
      .maybeSingle();

    if (offer?.ghl_price_id) priceId = String(offer.ghl_price_id);
    const product = offer?.catalog_products as Record<string, unknown> | null;
    const metadata = (product?.metadata || {}) as Record<string, unknown>;
    if (product?.ghl_product_id) saasPlanId = String(product.ghl_product_id);
    if (metadata.ghl_saas_plan_id) saasPlanId = String(metadata.ghl_saas_plan_id);
    if (metadata.ghl_saas_price_id) priceId = String(metadata.ghl_saas_price_id);
  } else if (catalogProductId) {
    const { data: product } = await supabase
      .from('catalog_products')
      .select('ghl_product_id, metadata')
      .eq('id', catalogProductId)
      .maybeSingle();

    const metadata = (product?.metadata || {}) as Record<string, unknown>;
    if (product?.ghl_product_id) saasPlanId = String(product.ghl_product_id);
    if (metadata.ghl_saas_plan_id) saasPlanId = String(metadata.ghl_saas_plan_id);
    if (metadata.ghl_saas_price_id) priceId = String(metadata.ghl_saas_price_id);
  }

  return { saasPlanId, priceId };
}

async function createGhlLocation(
  token: string,
  companyId: string,
  client: PartnerClientRow,
): Promise<string> {
  const locationName = String(client.company_name || client.name || client.email || 'NOVO Client').trim();
  const body: Record<string, unknown> = {
    name: locationName,
    companyId,
    timezone: Deno.env.get('GHL_DEFAULT_TIMEZONE') || 'America/New_York',
  };

  if (client.email) body.email = client.email;
  if (client.phone) body.phone = client.phone;
  if (client.city) body.city = client.city;
  if (client.country) body.country = client.country;

  const payload = await ghlRequest('/locations/', token, {
    method: 'POST',
    body: JSON.stringify(body),
  }) as Record<string, unknown>;

  const locationId = extractLocationId(payload);
  if (!locationId) throw new Error('GHL_LOCATION_ID_MISSING');
  return locationId;
}

async function enableGhlSaas(params: {
  token: string;
  companyId: string;
  locationId: string;
  clientEmail: string | null;
  stripeCustomerId: string | null;
  saasPlanId: string | null;
  priceId: string | null;
}) {
  const isV2 = Deno.env.get('GHL_SAAS_V2') !== 'false';
  const body: Record<string, unknown> = {
    companyId: params.companyId,
    isSaaSV2: isV2,
  };

  if (isV2) {
    if (params.saasPlanId) body.saasPlanId = params.saasPlanId;
    if (params.priceId) body.priceId = params.priceId;
  } else {
    if (params.clientEmail) body.email = params.clientEmail;
    if (params.stripeCustomerId) body.stripeCustomerId = params.stripeCustomerId;
    if (params.saasPlanId) body.saasPlanId = params.saasPlanId;
    if (params.priceId) body.priceId = params.priceId;
  }

  await ghlSaasRequest(
    `/saas-api/public-api/enable-saas/${encodeURIComponent(params.locationId)}`,
    params.token,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
}

export async function provisionPartnerClientInGhl(
  supabase: SupabaseAdmin,
  params: {
    clientId: string;
    offerId?: string | null;
    catalogProductId?: string | null;
    stripeCustomerId?: string | null;
  },
): Promise<GhlProvisionResult> {
  const { data: client, error: clientError } = await supabase
    .from('partner_clients')
    .select('id, partner_id, name, email, phone, company_name, ghl_location_id, ghl_sync_status, country, city')
    .eq('id', params.clientId)
    .maybeSingle();

  if (clientError) throw clientError;
  if (!client) throw new Error('CLIENT_NOT_FOUND');

  const row = client as PartnerClientRow;
  if (row.ghl_location_id) {
    return {
      locationId: row.ghl_location_id,
      saasEnabled: false,
      skipped: true,
      reason: 'already_provisioned',
    };
  }

  const connection = await loadAgencyConnection(supabase);
  if (!connection) {
    await supabase
      .from('partner_clients')
      .update({ ghl_sync_status: 'pending_agency' })
      .eq('id', params.clientId);

    return {
      locationId: null,
      saasEnabled: false,
      skipped: true,
      reason: 'agency_not_connected',
    };
  }

  const { token, companyId } = await resolveAgencyToken(supabase, connection);
  const locationId = await createGhlLocation(token, companyId, row);

  let saasEnabled = false;
  const shouldEnableSaas = Deno.env.get('GHL_SAAS_ENABLED') === 'true';

  if (shouldEnableSaas) {
    const { saasPlanId, priceId } = await loadSaasConfig(
      supabase,
      params.offerId || null,
      params.catalogProductId || null,
    );

    if (saasPlanId || priceId || params.stripeCustomerId) {
      await enableGhlSaas({
        token,
        companyId,
        locationId,
        clientEmail: row.email,
        stripeCustomerId: params.stripeCustomerId || null,
        saasPlanId,
        priceId,
      });
      saasEnabled = true;
    }
  }

  await supabase
    .from('partner_clients')
    .update({
      ghl_location_id: locationId,
      ghl_sync_status: 'provisioned',
      status: 'active',
    })
    .eq('id', params.clientId);

  return { locationId, saasEnabled };
}
