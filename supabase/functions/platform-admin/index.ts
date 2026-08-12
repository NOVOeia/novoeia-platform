import { corsHeaders, handleError, json, requireRole } from '../_shared/core.ts';
import { createPartnerAccount } from '../_shared/partner-account.ts';
import { isEmailConfigReady, loadEmailConfig, sendPlatformEmail } from '../_shared/email.ts';
import {
  EMAIL_TEMPLATE_CATALOG,
  loadPlatformAppUrl,
  loadStoredEmailTemplateConfig,
  listEmailTemplatesForAdmin,
  resolvePasswordResetAppUrl,
  forceActionLinkRedirect,
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
      const id = payload.id as string | undefined;
      if (!id) throw new Error('MISSING_REQUIRED_FIELDS');

      const patch: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (payload.name != null) patch.name = String(payload.name).trim();
      if (payload.slug != null) patch.slug = String(payload.slug).trim().toLowerCase();
      if (payload.plan_name != null) patch.plan_name = payload.plan_name;
      if (payload.status != null) {
        const status = String(payload.status);
        if (!['pending', 'active', 'inactive'].includes(status)) {
          throw new Error('INVALID_PARTNER_STATUS');
        }
        patch.status = status;
      }
      if (payload.ghl_location_id !== undefined) {
        patch.ghl_location_id = payload.ghl_location_id || null;
      }

      const { data, error } = await supabase
        .from('partners')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        actor_user_id: user.id,
        action: 'partner.updated',
        entity_type: 'partner',
        entity_id: id,
        metadata: { patch },
      });

      return json({ partner: data });
    }

    if (action === 'sendPartnerPasswordReset') {
      const partnerId = String(payload.partnerId || '').trim();
      if (!partnerId) throw new Error('PARTNER_REQUIRED');

      const { data: partner, error: partnerError } = await supabase
        .from('partners')
        .select('id, name, owner_user_id, branding')
        .eq('id', partnerId)
        .maybeSingle();
      if (partnerError) throw partnerError;
      if (!partner) throw new Error('PARTNER_NOT_FOUND');

      let email = '';
      let fullName = partner.name || 'Partner';

      if (partner.owner_user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', partner.owner_user_id)
          .maybeSingle();
        email = String(profile?.email || '').trim().toLowerCase();
        fullName = profile?.full_name || fullName;
      }

      if (!email) {
        const branding = (partner.branding || {}) as Record<string, unknown>;
        const brand = (branding.brand || {}) as Record<string, unknown>;
        email = String(
          branding.contactEmail
          || brand.supportEmail
          || '',
        ).trim().toLowerCase();
      }

      if (!email || !email.includes('@')) {
        throw new Error('PARTNER_OWNER_EMAIL_MISSING');
      }

      const configuredAppUrl = await loadPlatformAppUrl(supabase);
      const requestOrigin = req.headers.get('origin') || req.headers.get('referer') || '';
      const appUrl = resolvePasswordResetAppUrl(
        configuredAppUrl || 'https://partners.novoeia.com',
        payload.appUrl || requestOrigin || 'https://partners.novoeia.com',
      );
      if (!appUrl) throw new Error('PUBLIC_APP_URL_NOT_CONFIGURED');

      const emailConfig = await loadEmailConfig(supabase);
      if (!isEmailConfigReady(emailConfig)) throw new Error('EMAIL_NOT_CONFIGURED');

      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
          redirectTo: `${appUrl}/`,
        },
      });

      if (linkError || !linkData?.properties?.action_link) {
        console.error('[platform-admin] partner password reset link', linkError);
        throw new Error('PASSWORD_RESET_LINK_FAILED');
      }

      const resetUrl = forceActionLinkRedirect(
        String(linkData.properties.action_link),
        appUrl,
      );

      await sendTemplatedEmail(supabase, 'password_reset', {
        to: email,
        force: true,
        variables: {
          fullName: String(fullName),
          email,
          resetUrl,
          expiresIn: '60 minutos',
        },
      });

      await supabase.from('audit_logs').insert({
        actor_user_id: user.id,
        action: 'partner.password_reset_sent',
        entity_type: 'partner',
        entity_id: partnerId,
        metadata: {
          email,
          ownerUserId: partner.owner_user_id || null,
        },
      });

      return json({ ok: true, to: email, partnerId });
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
      const stored = await loadStoredEmailTemplateConfig(supabase);
      return json({
        templates: listEmailTemplatesForAdmin(stored as Record<string, Partial<{
          subject: string;
          html: string;
          enabled: boolean;
          custom?: boolean;
          name?: string;
          description?: string;
          trigger?: string;
          variables?: string[];
        }>>),
      });
    }

    if (action === 'saveEmailTemplates') {
      const incoming = (payload.templates || {}) as Record<string, unknown>;
      const currentTemplates = await loadStoredEmailTemplateConfig(supabase) as Record<string, Record<string, unknown>>;
      const mergedTemplates: Record<string, Record<string, unknown>> = { ...currentTemplates };
      const systemIds = new Set(EMAIL_TEMPLATE_CATALOG.map((item) => item.id));

      for (const [id, value] of Object.entries(incoming)) {
        const tpl = value as Record<string, unknown>;
        const existing = (currentTemplates[id] || {}) as Record<string, unknown>;
        const isCustom = tpl.custom === true || existing.custom === true || String(id).startsWith('custom_') || !systemIds.has(id as typeof EMAIL_TEMPLATE_CATALOG[number]['id']);

        mergedTemplates[id] = {
          ...existing,
          ...(tpl.subject !== undefined ? { subject: String(tpl.subject) } : {}),
          ...(tpl.html !== undefined ? { html: String(tpl.html) } : {}),
          ...(tpl.enabled !== undefined ? { enabled: tpl.enabled === true } : {}),
        };

        if (isCustom) {
          mergedTemplates[id].custom = true;
          if (tpl.name !== undefined) mergedTemplates[id].name = String(tpl.name).trim() || id;
          if (tpl.description !== undefined) mergedTemplates[id].description = String(tpl.description);
          if (tpl.trigger !== undefined) mergedTemplates[id].trigger = String(tpl.trigger || 'manual');
          if (tpl.variables !== undefined) {
            mergedTemplates[id].variables = Array.isArray(tpl.variables)
              ? tpl.variables.map(String)
              : (existing.variables || ['fullName', 'email', 'appName']);
          }
          if (!mergedTemplates[id].name) mergedTemplates[id].name = existing.name || id;
        }
      }

      if (Array.isArray(payload.deleteIds)) {
        for (const rawId of payload.deleteIds) {
          const id = String(rawId || '');
          if (!id || systemIds.has(id as typeof EMAIL_TEMPLATE_CATALOG[number]['id'])) continue;
          delete mergedTemplates[id];
        }
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

      return json({
        ok: true,
        templates: listEmailTemplatesForAdmin(mergedTemplates as Record<string, Partial<{
          subject: string;
          html: string;
          enabled: boolean;
          custom?: boolean;
          name?: string;
          description?: string;
          trigger?: string;
          variables?: string[];
        }>>),
      });
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

      const result = await sendTemplatedEmail(supabase, templateId, {
        to,
        variables: sampleVariables,
        force: true,
      });
      if (result?.skipped) {
        const reasonMap: Record<string, string> = {
          email_not_configured: 'EMAIL_NOT_CONFIGURED',
          template_disabled: 'TEMPLATE_DISABLED',
          template_not_found: 'TEMPLATE_NOT_FOUND',
          missing_recipient: 'TEST_EMAIL_REQUIRED',
        };
        throw new Error(reasonMap[String(result.reason)] || String(result.reason || 'EMAIL_SEND_SKIPPED'));
      }

      await supabase.from('audit_logs').insert({
        actor_user_id: user.id,
        action: 'email.template_test_sent',
        entity_type: 'email_template',
        entity_id: templateId,
        metadata: { to, templateId },
      });

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

    if (action === 'listPaymentProfiles') {
      let query = supabase
        .from('partner_payment_profiles')
        .select(`
          *,
          partners:partner_id ( id, name, slug, status )
        `)
        .order('updated_at', { ascending: false });

      if (payload.status) {
        query = query.eq('status', payload.status);
      }
      if (payload.partnerId) {
        query = query.eq('partner_id', payload.partnerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return json({ profiles: data || [] });
    }

    if (action === 'reviewPaymentProfile') {
      const profileId = payload.profileId as string | undefined;
      const decision = payload.decision as string | undefined;
      const allowed = ['approved', 'rejected', 'needs_changes'];
      if (!profileId || !allowed.includes(decision || '')) {
        throw new Error('INVALID_PAYMENT_PROFILE_REVIEW');
      }

      const { data: profile, error } = await supabase
        .from('partner_payment_profiles')
        .update({
          status: decision,
          review_notes: payload.notes ? String(payload.notes) : null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId)
        .select(`
          *,
          partners:partner_id ( id, name, slug )
        `)
        .single();
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        actor_user_id: user.id,
        action: `partner.payment_profile_${decision}`,
        entity_type: 'partner_payment_profile',
        entity_id: profileId,
        metadata: {
          partnerId: profile.partner_id,
          notes: payload.notes || null,
        },
      });

      return json({ profile, decision });
    }

    if (action === 'listSupportTickets') {
      let query = supabase
        .from('support_tickets')
        .select(`
          id, partner_id, subject, priority, status, last_message_at, last_message_by,
          created_at, updated_at, resolved_at, closed_at, created_by,
          partners:partner_id ( id, name, slug )
        `)
        .order('last_message_at', { ascending: false });
      if (payload.status) query = query.eq('status', payload.status);
      if (payload.partnerId) query = query.eq('partner_id', payload.partnerId);
      if (payload.priority) query = query.eq('priority', payload.priority);
      const { data, error } = await query;
      if (error) throw error;
      return json({ tickets: data || [] });
    }

    if (action === 'getSupportTicket') {
      const ticketId = String(payload.ticketId || '').trim();
      if (!ticketId) throw new Error('SUPPORT_TICKET_REQUIRED');

      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .select(`
          *,
          partners:partner_id ( id, name, slug )
        `)
        .eq('id', ticketId)
        .single();
      if (ticketError) throw ticketError;

      const { data: messages, error: messagesError } = await supabase
        .from('support_ticket_messages')
        .select('id, ticket_id, author_user_id, author_role, body, created_at')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      if (messagesError) throw messagesError;

      return json({ ticket, messages: messages || [] });
    }

    if (action === 'replySupportTicket') {
      const ticketId = String(payload.ticketId || '').trim();
      const body = String(payload.message || payload.body || '').trim();
      if (!ticketId || !body) throw new Error('SUPPORT_TICKET_FIELDS_REQUIRED');

      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();
      if (ticketError) throw ticketError;
      if (ticket.status === 'closed') throw new Error('SUPPORT_TICKET_CLOSED');

      const now = new Date().toISOString();
      const { data: message, error: messageError } = await supabase
        .from('support_ticket_messages')
        .insert({
          ticket_id: ticketId,
          author_user_id: user.id,
          author_role: 'super_admin',
          body,
          created_at: now,
        })
        .select('*')
        .single();
      if (messageError) throw messageError;

      const requestedStatus = payload.status ? String(payload.status) : 'waiting_partner';
      const allowed = ['open', 'in_progress', 'waiting_partner', 'resolved', 'closed'];
      const nextStatus = allowed.includes(requestedStatus) ? requestedStatus : 'waiting_partner';

      const { data: updated, error: updateError } = await supabase
        .from('support_tickets')
        .update({
          status: nextStatus,
          last_message_at: now,
          last_message_by: 'super_admin',
          updated_at: now,
          resolved_at: nextStatus === 'resolved' ? now : null,
          closed_at: nextStatus === 'closed' ? now : null,
        })
        .eq('id', ticketId)
        .select(`
          *,
          partners:partner_id ( id, name, slug )
        `)
        .single();
      if (updateError) throw updateError;

      await supabase.from('platform_notifications').insert({
        partner_id: ticket.partner_id,
        recipient_role: 'partner',
        type: 'support_ticket_reply',
        title: 'Respuesta de soporte NOVO',
        body: ticket.subject,
        metadata: { ticketId, status: nextStatus },
      });

      await supabase.from('audit_logs').insert({
        actor_user_id: user.id,
        action: 'support.ticket_replied',
        entity_type: 'support_ticket',
        entity_id: ticketId,
        metadata: { status: nextStatus },
      });

      return json({ ticket: updated, message });
    }

    if (action === 'updateSupportTicketStatus') {
      const ticketId = String(payload.ticketId || '').trim();
      const status = String(payload.status || '').trim();
      const allowed = ['open', 'in_progress', 'waiting_partner', 'resolved', 'closed'];
      if (!ticketId || !allowed.includes(status)) throw new Error('INVALID_SUPPORT_TICKET_STATUS');

      const now = new Date().toISOString();
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .update({
          status,
          updated_at: now,
          resolved_at: status === 'resolved' ? now : null,
          closed_at: status === 'closed' ? now : null,
        })
        .eq('id', ticketId)
        .select(`
          *,
          partners:partner_id ( id, name, slug )
        `)
        .single();
      if (error) throw error;

      await supabase.from('platform_notifications').insert({
        partner_id: ticket.partner_id,
        recipient_role: 'partner',
        type: 'support_ticket_status',
        title: 'Actualización de tu ticket',
        body: `${ticket.subject} → ${status}`,
        metadata: { ticketId, status },
      });

      await supabase.from('audit_logs').insert({
        actor_user_id: user.id,
        action: 'support.ticket_status_updated',
        entity_type: 'support_ticket',
        entity_id: ticketId,
        metadata: { status },
      });

      return json({ ticket });
    }

    throw new Error('UNKNOWN_ACTION');
  } catch (error) {
    return handleError(error);
  }
});
