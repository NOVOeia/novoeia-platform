import { corsHeaders, handleError, json, requireRole } from '../_shared/core.ts';
import { createPartnerAccount } from '../_shared/partner-account.ts';
import { isEmailConfigReady, loadEmailConfig, sendPlatformEmail } from '../_shared/email.ts';
import {
  EMAIL_TEMPLATE_CATALOG,
  loadEmailTemplates,
  sendTemplatedEmail,
  trySendTemplatedEmail,
} from '../_shared/email-templates.ts';

function mergeSecrets(
  existingRaw: string | null | undefined,
  incoming: Record<string, unknown>,
) {
  const existing = existingRaw
    ? JSON.parse(existingRaw as string) as Record<string, unknown>
    : {};
  const merged = { ...existing };
  for (const [key, value] of Object.entries(incoming)) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      merged[key] = value;
    }
  }
  return merged;
}

function mergePublicConfig(
  existing: Record<string, unknown> | null | undefined,
  incoming: Record<string, unknown>,
) {
  const merged = { ...(existing || {}) };
  for (const [key, value] of Object.entries(incoming)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'boolean') {
      merged[key] = value;
      continue;
    }
    if (String(value).trim() !== '') {
      merged[key] = value;
    }
  }
  return merged;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { user, supabase } = await requireRole(req, ['super_admin']);
    const { action, payload = {}, provider } = await req.json();

    if (action === 'saveIntegrationSettings') {
      const groups = [
        ['ghl', {
          clientId: payload.ghlClientId,
          redirectUri: payload.ghlRedirectUri,
          scopes: payload.ghlScopes,
          saasEnabled: payload.ghlSaasEnabled === true,
          saasV2: payload.ghlSaasV2 !== false,
          defaultTimezone: payload.ghlDefaultTimezone,
          defaultSaasPlanId: payload.ghlDefaultSaasPlanId,
          defaultSaasPriceId: payload.ghlDefaultSaasPriceId,
        }, { clientSecret: payload.ghlClientSecret }],
        ['stripe', {
          publishableKey: payload.stripePublishableKey,
          priceMode: payload.stripePriceMode,
        }, { secretKey: payload.stripeSecretKey, webhookSecret: payload.stripeWebhookSecret }],
        ['webhooks', { baseUrl: payload.webhookBaseUrl, publicAppUrl: payload.publicAppUrl }, {}],
        ['security', { superAdminEmails: payload.superAdminEmails }, {}],
        ['email', {
          transport: payload.emailTransport || 'api',
          provider: payload.emailProvider || 'custom',
          apiProvider: payload.emailApiProvider || 'resend',
          smtpHost: payload.emailSmtpHost,
          smtpPort: payload.emailSmtpPort,
          smtpEncryption: payload.emailSmtpEncryption || 'starttls',
          smtpUser: payload.emailSmtpUser,
          fromEmail: payload.emailFromEmail,
          fromName: payload.emailFromName,
          replyTo: payload.emailReplyTo,
          mailgunDomain: payload.emailMailgunDomain,
          sesRegion: payload.emailSesRegion || 'us-east-1',
        }, {
          smtpPassword: payload.emailSmtpPassword,
          apiKey: payload.emailApiKey,
        }],
      ];

      const { data: existingRows } = await supabase
        .from('platform_integrations')
        .select('provider, public_config, encrypted_secret, status')
        .in('provider', groups.map(([name]) => name));

      const existingByProvider = Object.fromEntries(
        (existingRows || []).map((row) => [row.provider, row]),
      );

      for (const [name, publicConfig, secrets] of groups) {
        const existing = existingByProvider[name];
        const mergedPublic = mergePublicConfig(
          (existing?.public_config || {}) as Record<string, unknown>,
          publicConfig as Record<string, unknown>,
        );
        const mergedSecrets = mergeSecrets(existing?.encrypted_secret, secrets as Record<string, unknown>);
        const hasStripeSecret = Boolean(mergedSecrets.secretKey);
        const hasStripePublishable = Boolean(
          (mergedPublic as Record<string, unknown>).publishableKey,
        );
        const emailPublic = name === 'email' ? mergedPublic as Record<string, unknown> : null;
        const emailSecrets = name === 'email' ? mergedSecrets : null;
        const emailReady = emailPublic && emailSecrets
          ? isEmailConfigReady({
            transport: (emailPublic.transport === 'smtp' ? 'smtp' : 'api'),
            provider: String(emailPublic.provider || 'custom'),
            apiProvider: String(emailPublic.apiProvider || 'resend'),
            smtpHost: String(emailPublic.smtpHost || ''),
            smtpPort: Number(emailPublic.smtpPort || 587),
            smtpEncryption: (String(emailPublic.smtpEncryption || 'starttls') as 'starttls' | 'ssl' | 'none'),
            smtpUser: String(emailPublic.smtpUser || ''),
            smtpPassword: String(emailSecrets.smtpPassword || ''),
            apiKey: String(emailSecrets.apiKey || ''),
            fromEmail: String(emailPublic.fromEmail || ''),
            fromName: String(emailPublic.fromName || ''),
            replyTo: String(emailPublic.replyTo || ''),
            mailgunDomain: String(emailPublic.mailgunDomain || ''),
            sesRegion: String(emailPublic.sesRegion || 'us-east-1'),
          })
          : false;
        const nextStatus = name === 'stripe'
          ? ((hasStripeSecret && hasStripePublishable) ? 'connected' : (existing?.status || 'pending'))
          : name === 'email'
            ? (emailReady ? 'connected' : (existing?.status || 'pending'))
          : (existing?.status || 'pending');

        await supabase.from('platform_integrations').upsert({
          provider: name,
          public_config: mergedPublic,
          encrypted_secret: JSON.stringify(mergedSecrets),
          status: nextStatus,
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

    if (action === 'createPartnerAccount') {
      const email = String(payload.email || '').trim().toLowerCase();
      const password = String(payload.password || '');
      const companyName = String(payload.companyName || '').trim();
      const fullName = String(payload.fullName || '').trim();
      const phone = String(payload.phone || '').trim();

      if (!email || !password || password.length < 8) throw new Error('INVALID_CREDENTIALS');
      if (!companyName || !fullName) throw new Error('MISSING_REQUIRED_FIELDS');

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

      if (createError) {
        const alreadyRegistered = createError.message?.toLowerCase().includes('already');
        if (alreadyRegistered) throw new Error('EMAIL_ALREADY_REGISTERED');
        throw createError;
      }

      const userId = created?.user?.id;
      if (!userId) throw new Error('USER_CREATE_FAILED');

      const account = await createPartnerAccount({
        supabase,
        userId,
        email,
        fullName,
        phone,
        companyName,
        payload,
        options: {
          status: String(payload.status || 'active'),
          planName: String(payload.plan_name || 'partner'),
          actorUserId: user.id,
          auditAction: 'partner.created_by_admin',
        },
      });

      return json({ ok: true, ...account, partner: account.partner }, 201);
    }

    if (action === 'updatePartner') {
      const { id, ...changes } = payload;
      const { data, error } = await supabase.from('partners').update({ ...changes, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw error;
      return json({ partner: data });
    }

    if (action === 'getIntegrationSettings') {
      const { data, error } = await supabase
        .from('platform_integrations')
        .select('provider, public_config, encrypted_secret')
        .in('provider', ['ghl', 'stripe', 'webhooks', 'security', 'email']);
      if (error) throw error;

      const byProvider = Object.fromEntries((data || []).map((row) => [row.provider, row]));
      const ghlPublic = (byProvider.ghl?.public_config || {}) as Record<string, string | boolean>;
      const ghlSecret = byProvider.ghl?.encrypted_secret
        ? JSON.parse(byProvider.ghl.encrypted_secret as string)
        : {};
      const stripePublic = (byProvider.stripe?.public_config || {}) as Record<string, string>;
      const stripeSecret = byProvider.stripe?.encrypted_secret
        ? JSON.parse(byProvider.stripe.encrypted_secret as string)
        : {};
      const webhooksPublic = (byProvider.webhooks?.public_config || {}) as Record<string, string>;
      const securityPublic = (byProvider.security?.public_config || {}) as Record<string, string>;
      const emailPublic = (byProvider.email?.public_config || {}) as Record<string, string>;
      const emailSecret = byProvider.email?.encrypted_secret
        ? JSON.parse(byProvider.email.encrypted_secret as string)
        : {};

      return json({
        settings: {
          ghlClientId: ghlPublic.clientId || '',
          ghlRedirectUri: ghlPublic.redirectUri || '',
          ghlScopes: ghlPublic.scopes || '',
          ghlSaasEnabled: ghlPublic.saasEnabled === true || ghlPublic.saasEnabled === 'true',
          ghlSaasV2: ghlPublic.saasV2 !== false && ghlPublic.saasV2 !== 'false',
          ghlDefaultTimezone: ghlPublic.defaultTimezone || 'America/New_York',
          ghlDefaultSaasPlanId: ghlPublic.defaultSaasPlanId || '',
          ghlDefaultSaasPriceId: ghlPublic.defaultSaasPriceId || '',
          ghlCompanyId: ghlPublic.companyId || '',
          ghlLocationId: ghlPublic.locationId || '',
          ghlUserType: ghlPublic.userType || '',
          ghlConnectedAt: ghlPublic.connectedAt || '',
          ghlClientSecret: ghlSecret.clientSecret || '',
          stripePublishableKey: stripePublic.publishableKey || '',
          stripePriceMode: stripePublic.priceMode || 'test',
          stripeSecretKey: stripeSecret.secretKey || '',
          stripeWebhookSecret: stripeSecret.webhookSecret || '',
          webhookBaseUrl: webhooksPublic.baseUrl || '',
          publicAppUrl: webhooksPublic.publicAppUrl || '',
          superAdminEmails: securityPublic.superAdminEmails || '',
          emailTransport: emailPublic.transport || 'api',
          emailProvider: emailPublic.provider || 'custom',
          emailApiProvider: emailPublic.apiProvider || 'resend',
          emailSmtpHost: emailPublic.smtpHost || '',
          emailSmtpPort: emailPublic.smtpPort || '587',
          emailSmtpEncryption: emailPublic.smtpEncryption || 'starttls',
          emailSmtpUser: emailPublic.smtpUser || '',
          emailSmtpPassword: emailSecret.smtpPassword || '',
          emailApiKey: emailSecret.apiKey || '',
          emailFromEmail: emailPublic.fromEmail || '',
          emailFromName: emailPublic.fromName || '',
          emailReplyTo: emailPublic.replyTo || '',
          emailMailgunDomain: emailPublic.mailgunDomain || '',
          emailSesRegion: emailPublic.sesRegion || 'us-east-1',
        },
      });
    }

    if (action === 'sendTestEmail') {
      const to = String(payload.to || user.email || '').trim().toLowerCase();
      if (!to) throw new Error('TEST_EMAIL_REQUIRED');

      const config = await loadEmailConfig(supabase);
      if (!isEmailConfigReady(config)) throw new Error('EMAIL_NOT_CONFIGURED');

      await sendPlatformEmail(supabase, {
        to,
        subject: 'Prueba de correo — NOVO Platform',
        html: `
          <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#16181d">
            <h2 style="margin:0 0 12px">Correo de prueba</h2>
            <p>Tu configuración de envío en <strong>NOVO Platform</strong> funciona correctamente.</p>
            <p style="color:#737b8b;font-size:13px">
              Transporte: ${config.transport.toUpperCase()} · Proveedor: ${config.provider}
            </p>
          </div>
        `,
        text: 'Tu configuración de envío en NOVO Platform funciona correctamente.',
      });

      await supabase.from('audit_logs').insert({
        actor_user_id: user.id,
        action: 'email.test_sent',
        entity_type: 'platform',
        metadata: { to, transport: config.transport, provider: config.provider },
      });

      return json({ ok: true, to });
    }

    if (action === 'getEmailTemplates') {
      const templates = await loadEmailTemplates(supabase);
      return json({
        templates: EMAIL_TEMPLATE_CATALOG.map(meta => ({
          ...meta,
          ...templates[meta.id],
        })),
      });
    }

    if (action === 'saveEmailTemplates') {
      const incoming = (payload.templates || {}) as Record<string, unknown>;
      const { data: existing } = await supabase
        .from('platform_integrations')
        .select('public_config')
        .eq('provider', 'email_templates')
        .maybeSingle();

      const currentTemplates = ((existing?.public_config || {}) as { templates?: Record<string, unknown> }).templates || {};
      const mergedTemplates = { ...currentTemplates };

      for (const [id, value] of Object.entries(incoming)) {
        const tpl = value as Record<string, unknown>;
        mergedTemplates[id] = {
          ...(currentTemplates[id] as Record<string, unknown> || {}),
          ...(tpl.subject !== undefined ? { subject: String(tpl.subject) } : {}),
          ...(tpl.html !== undefined ? { html: String(tpl.html) } : {}),
          ...(tpl.enabled !== undefined ? { enabled: tpl.enabled === true } : {}),
        };
      }

      await supabase.from('platform_integrations').upsert({
        provider: 'email_templates',
        public_config: { templates: mergedTemplates },
        encrypted_secret: JSON.stringify({}),
        status: 'connected',
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'provider' });

      await supabase.from('audit_logs').insert({
        actor_user_id: user.id,
        action: 'email.templates_updated',
        entity_type: 'platform',
      });

      return json({ ok: true });
    }

    if (action === 'sendTemplateTestEmail') {
      const templateId = String(payload.templateId || '');
      const to = String(payload.to || user.email || '').trim().toLowerCase();
      if (!templateId) throw new Error('TEMPLATE_ID_REQUIRED');
      if (!to) throw new Error('TEST_EMAIL_REQUIRED');

      const sampleVariables: Record<string, string> = {
        fullName: 'Usuario Demo',
        email: to,
        companyName: 'Empresa Demo',
        clientName: 'Cliente Demo',
        clientEmail: 'cliente@ejemplo.com',
        productName: 'Plan Profesional',
        amount: '199.00',
        currency: 'USD',
        commission: '49.00',
        partnerName: 'Partner Demo',
        resetUrl: 'https://app.ejemplo.com/#reset-password?token=demo',
        expiresIn: '60 minutos',
      };

      await sendTemplatedEmail(supabase, templateId, { to, variables: sampleVariables });
      return json({ ok: true, to, templateId });
    }

    if (action === 'testIntegration') {
      const { data } = await supabase.from('platform_integrations').select('provider,status,public_config').eq('provider', provider).maybeSingle();
      return json({ connected: Boolean(data), integration: data });
    }

    if (action === 'reviewPartnerRegistration') {
      const partnerId = payload.partnerId as string | undefined;
      const decision = payload.decision as string | undefined;
      if (!partnerId || !['approve', 'reject'].includes(decision || '')) {
        throw new Error('INVALID_REVIEW');
      }

      const status = decision === 'approve' ? 'active' : 'inactive';
      const { data: partner, error } = await supabase
        .from('partners')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', partnerId)
        .select()
        .single();

      if (error) throw error;

      const { data: ownerProfile } = partner?.owner_user_id
        ? await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', partner.owner_user_id)
          .maybeSingle()
        : { data: null };

      const ownerEmail = ownerProfile?.email
        || (partner?.branding as Record<string, unknown> | undefined)?.contactEmail as string
        || null;

      if (ownerEmail) {
        const templateId = decision === 'approve' ? 'partner_approved' : 'partner_rejected';
        await trySendTemplatedEmail(supabase, templateId, {
          to: String(ownerEmail),
          variables: {
            fullName: ownerProfile?.full_name || partner?.name || 'Partner',
            email: String(ownerEmail),
            companyName: partner?.name || '',
          },
        });
      }

      await supabase.from('audit_logs').insert({
        actor_user_id: user.id,
        action: decision === 'approve' ? 'partner.approved' : 'partner.rejected',
        entity_type: 'partner',
        entity_id: partnerId,
        metadata: {
          note: payload.note || null,
          partnerName: partner?.name || null,
        },
      });

      return json({ partner, decision });
    }

    throw new Error('UNKNOWN_ACTION');
  } catch (error) {
    return handleError(error);
  }
});
