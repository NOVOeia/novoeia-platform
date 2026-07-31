import { adminClient, corsHeaders, handleError, json } from '../_shared/core.ts';

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'partner';
}

async function uniquePartnerSlug(supabase: ReturnType<typeof adminClient>, base: string) {
  let slug = slugify(base);
  let attempt = 0;
  while (attempt < 20) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt + 1}`;
    const { data } = await supabase.from('partners').select('id').eq('slug', candidate).maybeSingle();
    if (!data) return candidate;
    attempt += 1;
  }
  return `${slug}-${crypto.randomUUID().slice(0, 8)}`;
}

async function verifyPassword(email: string, password: string) {
  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!url || !anonKey) return false;

  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  return response.ok;
}

async function findUserIdByEmail(supabase: ReturnType<typeof adminClient>, email: string) {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  if (error) return null;
  return data.user?.id || null;
}

async function createPartnerAccount(params: {
  supabase: ReturnType<typeof adminClient>;
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  companyName: string;
  payload: Record<string, unknown>;
}) {
  const { supabase, userId, email, fullName, phone, companyName, payload } = params;
  const role = 'partner';

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, partner_id, role')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.partner_id) {
    throw new Error('EMAIL_ALREADY_REGISTERED');
  }

  const slug = await uniquePartnerSlug(supabase, companyName);
  const { data: partner, error: partnerError } = await supabase.from('partners').insert({
    owner_user_id: userId,
    name: companyName,
    slug,
    status: 'pending',
    plan_name: 'Partner',
    branding: {
      primaryColor: payload.primaryColor || '#1e90ff',
      contactEmail: email,
      contactPhone: phone || null,
      prices: {
        basic: Number(payload.basicPrice) || null,
        pro: Number(payload.proPrice) || null,
      },
    },
  }).select().single();
  if (partnerError) throw new Error(`PARTNER_CREATE:${partnerError.message}`);

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    role,
    email,
    full_name: fullName,
    partner_id: partner.id,
  }, { onConflict: 'id' });
  if (profileError) throw new Error(`PROFILE_CREATE:${profileError.message}`);

  await supabase.from('audit_logs').insert({
    actor_user_id: userId,
    action: profile?.id ? 'partner.registration_recovered' : 'partner.registered',
    entity_type: 'partner',
    entity_id: partner.id,
    metadata: { email, companyName },
  });

  return { role, email, partnerId: partner.id };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { action, payload = {} } = await req.json();

    if (action === 'syncRole') {
      const auth = req.headers.get('Authorization');
      if (!auth) throw new Error('UNAUTHORIZED');
      const supabase = adminClient();
      const token = auth.replace('Bearer ', '');
      const { data: authData, error: authError } = await supabase.auth.getUser(token);
      if (authError || !authData.user) throw new Error('UNAUTHORIZED');

      const email = String(authData.user.email || '').trim().toLowerCase();
      const allowlist = (Deno.env.get('GHL_SUPER_ADMIN_EMAILS') || '')
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);

      if (!email || !allowlist.includes(email)) {
        return json({ ok: true, promoted: false });
      }

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        role: 'super_admin',
        email,
      }, { onConflict: 'id' });
      if (profileError) throw new Error(`PROFILE_SYNC:${profileError.message}`);

      return json({ ok: true, promoted: true, role: 'super_admin' });
    }

    if (action !== 'register') throw new Error('UNKNOWN_ACTION');
    if (payload.type !== 'partner') throw new Error('PARTNER_REGISTRATION_ONLY');

    const email = String(payload.email || '').trim().toLowerCase();
    const password = String(payload.password || '');
    const companyName = String(payload.companyName || '').trim();
    const fullName = String(payload.fullName || '').trim();
    const phone = String(payload.phone || '').trim();

    if (!email || !password || password.length < 8) throw new Error('INVALID_CREDENTIALS');
    if (!companyName || !fullName) throw new Error('MISSING_REQUIRED_FIELDS');

    const supabase = adminClient();

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'partner',
        company_name: companyName,
        phone,
      },
    });

    let userId = created?.user?.id as string | undefined;

    if (createError) {
      const alreadyRegistered = createError.message?.toLowerCase().includes('already');
      if (!alreadyRegistered) throw createError;

      userId = await findUserIdByEmail(supabase, email) || undefined;
      if (!userId) throw new Error('EMAIL_ALREADY_REGISTERED');

      const passwordOk = await verifyPassword(email, password);
      if (!passwordOk) throw new Error('EMAIL_ALREADY_REGISTERED');

      const recovered = await createPartnerAccount({
        supabase,
        userId,
        email,
        fullName,
        phone,
        companyName,
        payload,
      });

      return json({
        ok: true,
        recovered: true,
        ...recovered,
        message: 'Registro completado. Tu cuenta partner quedó activa.',
      }, 200);
    }

    if (!userId) throw new Error('USER_CREATE_FAILED');

    const account = await createPartnerAccount({
      supabase,
      userId,
      email,
      fullName,
      phone,
      companyName,
      payload,
    });

    return json({
      ok: true,
      ...account,
      message: 'Cuenta creada. Podrás iniciar sesión con correo/contraseña o HighLevel.',
    }, 201);
  } catch (error) {
    return handleError(error);
  }
});
