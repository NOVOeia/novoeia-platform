import { adminClient, corsHeaders, handleError, json, loadSuperAdminEmails } from '../_shared/core.ts';
import { createPartnerAccount } from '../_shared/partner-account.ts';

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
      const allowlist = await loadSuperAdminEmails(supabase);

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
