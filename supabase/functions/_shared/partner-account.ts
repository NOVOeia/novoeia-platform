import { adminClient } from './core.ts';
import { trySendTemplatedEmail } from './email-templates.ts';

type SupabaseAdmin = ReturnType<typeof adminClient>;

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'partner';
}

export async function uniquePartnerSlug(
  supabase: SupabaseAdmin,
  base: string,
  preferred?: string | null,
) {
  const normalizedPreferred = preferred ? slugify(preferred) : '';
  if (normalizedPreferred) {
    const { data } = await supabase
      .from('partners')
      .select('id')
      .eq('slug', normalizedPreferred)
      .maybeSingle();
    if (!data) return normalizedPreferred;
  }

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

export async function createPartnerAccount(params: {
  supabase: SupabaseAdmin;
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  companyName: string;
  payload: Record<string, unknown>;
  options?: {
    status?: string;
    planName?: string;
    slug?: string | null;
    actorUserId?: string | null;
    auditAction?: string;
  };
}) {
  const { supabase, userId, email, fullName, phone, companyName, payload, options = {} } = params;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, partner_id, role')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.partner_id) {
    throw new Error('EMAIL_ALREADY_REGISTERED');
  }

  const onboarding = (payload.onboarding || null) as Record<string, unknown> | null;
  const slug = await uniquePartnerSlug(supabase, companyName, options.slug);
  const status = options.status || String(payload.status || 'pending');
  const planName = options.planName || String(payload.plan_name || 'Partner');

  const { data: partner, error: partnerError } = await supabase.from('partners').insert({
    owner_user_id: userId,
    name: companyName,
    slug,
    status,
    plan_name: planName,
    contact_email: email,
    contact_phone: phone || null,
    branding: {
      primaryColor: payload.primaryColor || '#5b5df0',
      contactEmail: email,
      contactPhone: phone || null,
      onboarding,
      prices: {
        basic: Number(payload.basicPrice) || null,
        pro: Number(payload.proPrice) || null,
      },
    },
  }).select().single();
  if (partnerError) throw new Error(`PARTNER_CREATE:${partnerError.message}`);

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    role: 'partner',
    email,
    full_name: fullName,
    phone: phone || null,
    partner_id: partner.id,
  }, { onConflict: 'id' });
  if (profileError) throw new Error(`PROFILE_CREATE:${profileError.message}`);

  await supabase.from('audit_logs').insert({
    actor_user_id: options.actorUserId || userId,
    action: options.auditAction || (profile?.id ? 'partner.registration_recovered' : 'partner.registered'),
    entity_type: 'partner',
    entity_id: partner.id,
    metadata: { email, companyName, source: options.auditAction?.includes('admin') ? 'super_admin' : 'self_service' },
  });

  await trySendTemplatedEmail(supabase, 'partner_welcome', {
    to: email,
    variables: {
      fullName,
      email,
      companyName,
    },
  });

  return { role: 'partner', email, partnerId: partner.id, partner, slug };
}
