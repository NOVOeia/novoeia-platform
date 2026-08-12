import { adminClient } from './core.ts';
import { isEmailConfigReady, loadEmailConfig, sendPlatformEmail } from './email.ts';

type SupabaseAdmin = ReturnType<typeof adminClient>;

export const EMAIL_TEMPLATE_CATALOG = [
  {
    id: 'partner_welcome',
    name: 'Bienvenida partner',
    description: 'Se envía cuando un partner completa el registro (público o creado por admin).',
    trigger: 'partner.registered',
    variables: ['fullName', 'email', 'companyName', 'loginUrl', 'appName'],
  },
  {
    id: 'partner_approved',
    name: 'Partner aprobado',
    description: 'Se envía cuando Super Admin aprueba un registro pendiente.',
    trigger: 'partner.approved',
    variables: ['fullName', 'email', 'companyName', 'loginUrl', 'appName'],
  },
  {
    id: 'partner_rejected',
    name: 'Partner rechazado',
    description: 'Se envía cuando Super Admin rechaza un registro pendiente.',
    trigger: 'partner.rejected',
    variables: ['fullName', 'email', 'companyName', 'supportEmail', 'appName'],
  },
  {
    id: 'client_payment_success',
    name: 'Pago cliente confirmado',
    description: 'Se envía al cliente cuando Stripe confirma el checkout (subscription paid).',
    trigger: 'stripe.checkout_completed',
    variables: ['clientName', 'clientEmail', 'productName', 'amount', 'currency', 'partnerName', 'appName'],
  },
  {
    id: 'partner_sale_notification',
    name: 'Nueva venta (partner)',
    description: 'Notifica al partner owner cuando un cliente completa un pago.',
    trigger: 'stripe.checkout_completed',
    variables: ['partnerName', 'clientName', 'productName', 'amount', 'currency', 'commission', 'dashboardUrl', 'appName'],
  },
  {
    id: 'password_reset',
    name: 'Restablecer contraseña',
    description: 'Plantilla para flujos de recuperación de acceso (requiere enlace de reset).',
    trigger: 'auth.password_reset',
    variables: ['fullName', 'email', 'resetUrl', 'expiresIn', 'appName'],
  },
  {
    id: 'ghl_provision_success',
    name: 'Cliente provisionado en GHL',
    description: 'Se envía al cliente cuando su location GHL queda activa tras el pago.',
    trigger: 'ghl.client_provisioned',
    variables: ['clientName', 'clientEmail', 'productName', 'partnerName', 'appName'],
  },
] as const;

export type EmailTemplateId = typeof EMAIL_TEMPLATE_CATALOG[number]['id'];

function wrapHtml(body: string) {
  return `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#16181d;max-width:560px;margin:0 auto;padding:24px">
${body}
<p style="color:#737b8b;font-size:12px;margin-top:24px">— {{appName}}</p>
</div>`;
}

export const DEFAULT_EMAIL_TEMPLATES: Record<string, { subject: string; html: string; enabled: boolean }> = {
  partner_welcome: {
    subject: 'Bienvenido a {{appName}}, {{fullName}}',
    html: wrapHtml(`
<h2 style="margin:0 0 12px">Tu cuenta partner está lista</h2>
<p>Hola <strong>{{fullName}}</strong>,</p>
<p>Registramos <strong>{{companyName}}</strong> en {{appName}}. Ya puedes iniciar sesión y continuar con la configuración de tu panel.</p>
<p><a href="{{loginUrl}}" style="display:inline-block;background:#5b5df0;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600">Ir al panel partner</a></p>
<p style="color:#737b8b;font-size:13px">Correo de acceso: {{email}}</p>`),
    enabled: true,
  },
  partner_approved: {
    subject: '{{appName}} — tu partner fue aprobado',
    html: wrapHtml(`
<h2 style="margin:0 0 12px">¡Cuenta activada!</h2>
<p>Hola <strong>{{fullName}}</strong>,</p>
<p>Tu registro para <strong>{{companyName}}</strong> fue aprobado. Ya puedes operar con clientes, links de venta y checkout.</p>
<p><a href="{{loginUrl}}" style="display:inline-block;background:#5b5df0;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600">Entrar al panel</a></p>`),
    enabled: true,
  },
  partner_rejected: {
    subject: 'Actualización sobre tu registro en {{appName}}',
    html: wrapHtml(`
<h2 style="margin:0 0 12px">Registro no aprobado</h2>
<p>Hola <strong>{{fullName}}</strong>,</p>
<p>En este momento no pudimos activar el registro de <strong>{{companyName}}</strong>.</p>
<p>Si crees que es un error, escríbenos a <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>`),
    enabled: true,
  },
  client_payment_success: {
    subject: 'Pago confirmado — {{productName}}',
    html: wrapHtml(`
<h2 style="margin:0 0 12px">¡Gracias por tu pago!</h2>
<p>Hola <strong>{{clientName}}</strong>,</p>
<p>Confirmamos tu pago de <strong>{{amount}} {{currency}}</strong> por <strong>{{productName}}</strong>.</p>
<p>Tu partner <strong>{{partnerName}}</strong> dará seguimiento a la activación de tu servicio.</p>`),
    enabled: true,
  },
  partner_sale_notification: {
    subject: 'Nueva venta — {{clientName}}',
    html: wrapHtml(`
<h2 style="margin:0 0 12px">Nueva venta registrada</h2>
<p>Hola <strong>{{partnerName}}</strong>,</p>
<p><strong>{{clientName}}</strong> completó el pago de <strong>{{productName}}</strong> por <strong>{{amount}} {{currency}}</strong>.</p>
<p>Comisión estimada: <strong>{{commission}} {{currency}}</strong></p>
<p><a href="{{dashboardUrl}}" style="display:inline-block;background:#5b5df0;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600">Ver en mi panel</a></p>`),
    enabled: true,
  },
  password_reset: {
    subject: 'Restablece tu contraseña — {{appName}}',
    html: wrapHtml(`
<h2 style="margin:0 0 12px">Restablecer contraseña</h2>
<p>Hola <strong>{{fullName}}</strong>,</p>
<p>Recibimos una solicitud para restablecer la contraseña de <strong>{{email}}</strong>.</p>
<p><a href="{{resetUrl}}" style="display:inline-block;background:#5b5df0;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600">Crear nueva contraseña</a></p>
<p style="color:#737b8b;font-size:13px">El enlace expira en {{expiresIn}}. Si no solicitaste esto, ignora este correo.</p>`),
    enabled: true,
  },
  ghl_provision_success: {
    subject: 'Tu servicio está en activación — {{productName}}',
    html: wrapHtml(`
<h2 style="margin:0 0 12px">Provisionamiento iniciado</h2>
<p>Hola <strong>{{clientName}}</strong>,</p>
<p>Tu pago por <strong>{{productName}}</strong> fue procesado y estamos activando tu entorno con <strong>{{partnerName}}</strong>.</p>
<p>Te contactaremos en <strong>{{clientEmail}}</strong> cuando todo esté listo.</p>`),
    enabled: true,
  },
};

export function renderEmailTemplate(template: string, variables: Record<string, string> = {}) {
  const merged = { appName: 'NOVO Partners', ...variables };
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => merged[key] ?? '');
}

export function mergeEmailTemplates(stored: Record<string, Partial<{
  subject: string;
  html: string;
  enabled: boolean;
  custom?: boolean;
  name?: string;
  description?: string;
  trigger?: string;
  variables?: string[];
}>> = {}) {
  const merged: Record<string, {
    subject: string;
    html: string;
    enabled: boolean;
    custom?: boolean;
    name?: string;
    description?: string;
    trigger?: string;
    variables?: string[];
  }> = {};

  for (const item of EMAIL_TEMPLATE_CATALOG) {
    const defaults = DEFAULT_EMAIL_TEMPLATES[item.id] || { subject: '', html: '', enabled: false };
    const override = stored[item.id] || {};
    merged[item.id] = {
      subject: override.subject ?? defaults.subject,
      html: override.html ?? defaults.html,
      enabled: override.enabled !== undefined ? override.enabled : defaults.enabled,
    };
  }

  for (const [id, value] of Object.entries(stored)) {
    if (merged[id]) continue;
    if (!value || typeof value !== 'object') continue;
    const isCustom = value.custom === true || String(id).startsWith('custom_');
    if (!isCustom) continue;
    merged[id] = {
      subject: String(value.subject || ''),
      html: String(value.html || ''),
      enabled: value.enabled !== false,
      custom: true,
      name: String(value.name || id),
      description: String(value.description || 'Plantilla personalizada'),
      trigger: String(value.trigger || 'manual'),
      variables: Array.isArray(value.variables) ? value.variables.map(String) : ['fullName', 'email', 'appName'],
    };
  }

  return merged;
}

export function listEmailTemplatesForAdmin(
  stored: Record<string, Partial<{
    subject: string;
    html: string;
    enabled: boolean;
    custom?: boolean;
    name?: string;
    description?: string;
    trigger?: string;
    variables?: string[];
  }>> = {},
) {
  const merged = mergeEmailTemplates(stored);
  const system = EMAIL_TEMPLATE_CATALOG.map((meta) => ({
    ...meta,
    ...merged[meta.id],
    custom: false,
  }));

  const custom = Object.entries(merged)
    .filter(([id, value]) => value.custom === true || !EMAIL_TEMPLATE_CATALOG.some((item) => item.id === id))
    .filter(([id]) => !EMAIL_TEMPLATE_CATALOG.some((item) => item.id === id))
    .map(([id, value]) => ({
      id,
      name: value.name || id,
      description: value.description || 'Plantilla personalizada',
      trigger: value.trigger || 'manual',
      variables: value.variables || ['fullName', 'email', 'appName'],
      subject: value.subject,
      html: value.html,
      enabled: value.enabled,
      custom: true,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));

  return [...system, ...custom];
}

export async function loadEmailTemplates(supabase: SupabaseAdmin) {
  const { data } = await supabase
    .from('platform_integrations')
    .select('public_config')
    .eq('provider', 'email_templates')
    .maybeSingle();

  const stored = ((data?.public_config || {}) as { templates?: Record<string, unknown> }).templates || {};
  return mergeEmailTemplates(stored as Record<string, Partial<{
    subject: string;
    html: string;
    enabled: boolean;
    custom?: boolean;
    name?: string;
    description?: string;
    trigger?: string;
    variables?: string[];
  }>>);
}

export async function loadStoredEmailTemplateConfig(supabase: SupabaseAdmin) {
  const { data } = await supabase
    .from('platform_integrations')
    .select('public_config')
    .eq('provider', 'email_templates')
    .maybeSingle();
  return ((data?.public_config || {}) as { templates?: Record<string, unknown> }).templates || {};
}

export async function loadPlatformAppUrl(supabase: SupabaseAdmin) {
  const { data } = await supabase
    .from('platform_integrations')
    .select('public_config')
    .eq('provider', 'webhooks')
    .maybeSingle();
  const publicConfig = (data?.public_config || {}) as Record<string, string>;
  return (publicConfig.publicAppUrl || Deno.env.get('PUBLIC_APP_URL') || '').trim().replace(/\/$/, '');
}

function isLocalAppUrl(url: string) {
  try {
    const host = new URL(url).hostname;
    return host === 'localhost' || host === '127.0.0.1';
  } catch {
    return false;
  }
}

function normalizeAppOrigin(value = '') {
  const raw = String(value || '').trim().replace(/\/$/, '');
  if (!raw) return '';
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return '';
  }
}

/** Vite local default for this app (not CRA/Next :3000). */
const LOCAL_VITE_ORIGIN = 'http://localhost:5173';
const PRODUCTION_APP_ORIGIN = 'https://partners.novoeia.com';

function preferViteLocalOrigin(url: string) {
  const normalized = normalizeAppOrigin(url);
  if (!normalized || !isLocalAppUrl(normalized)) return normalized;
  try {
    const parsed = new URL(normalized);
    // Legacy defaults (CRA / Supabase Site URL) → Vite.
    if (parsed.port === '3000' || parsed.port === '') {
      return LOCAL_VITE_ORIGIN;
    }
    // Keep explicit Vite / other local ports (5173, 4173, etc.).
    if (parsed.hostname === '127.0.0.1') {
      return `http://localhost:${parsed.port || '5173'}`;
    }
    return normalized;
  } catch {
    return LOCAL_VITE_ORIGIN;
  }
}

/**
 * Prefer the browser origin for public app links (reset, sales links, etc.).
 * Local Vite (:5173) and https://partners.novoeia.com are the known hosts.
 */
export function resolvePublicAppUrl(configured = '', requested = '') {
  const configuredUrl = normalizeAppOrigin(configured);
  const requestedUrl = normalizeAppOrigin(requested);

  // Local request always stays local (map legacy :3000 → :5173).
  if (requestedUrl && isLocalAppUrl(requestedUrl)) {
    return preferViteLocalOrigin(requestedUrl);
  }

  // Production host from the browser.
  if (requestedUrl === PRODUCTION_APP_ORIGIN) {
    return PRODUCTION_APP_ORIGIN;
  }

  // Super Admin public URL when it is a real non-local host.
  if (configuredUrl && !isLocalAppUrl(configuredUrl)) {
    return configuredUrl;
  }

  // Stale localhost config (often :3000) → Vite.
  if (configuredUrl && isLocalAppUrl(configuredUrl)) {
    return preferViteLocalOrigin(configuredUrl);
  }

  return PRODUCTION_APP_ORIGIN;
}

/** @deprecated Prefer resolvePublicAppUrl */
export function resolvePasswordResetAppUrl(configured = '', requested = '') {
  return resolvePublicAppUrl(configured, requested);
}

export async function sendTemplatedEmail(
  supabase: SupabaseAdmin,
  templateId: EmailTemplateId | string,
  params: {
    to: string;
    variables?: Record<string, string>;
    /** En pruebas permite enviar aunque la plantilla esté desactivada */
    force?: boolean;
  },
) {
  const to = String(params.to || '').trim().toLowerCase();
  if (!to) return { skipped: true, reason: 'missing_recipient' };

  const emailConfig = await loadEmailConfig(supabase);
  if (!isEmailConfigReady(emailConfig)) return { skipped: true, reason: 'email_not_configured' };

  const templates = await loadEmailTemplates(supabase);
  const template = templates[String(templateId)];
  if (!template) return { skipped: true, reason: 'template_not_found' };
  if (!template.enabled && !params.force) return { skipped: true, reason: 'template_disabled' };

  const appUrl = await loadPlatformAppUrl(supabase);
  const variables = {
    loginUrl: appUrl ? `${appUrl}/#login` : '#',
    dashboardUrl: appUrl ? `${appUrl}/#partner-dashboard/dashboard` : '#',
    supportEmail: emailConfig.replyTo || emailConfig.fromEmail,
    appName: 'NOVO Partners',
    ...(params.variables || {}),
  };

  await sendPlatformEmail(supabase, {
    to,
    subject: renderEmailTemplate(template.subject, variables),
    html: renderEmailTemplate(template.html, variables),
    text: renderEmailTemplate(template.subject, variables),
  });

  return { ok: true, templateId, to };
}

/** Envía sin lanzar error — para hooks de negocio */
export async function trySendTemplatedEmail(
  supabase: SupabaseAdmin,
  templateId: EmailTemplateId | string,
  params: { to: string; variables?: Record<string, string> },
) {
  try {
    return await sendTemplatedEmail(supabase, templateId, params);
  } catch (error) {
    console.error('[email-template]', templateId, error);
    return { skipped: true, reason: 'send_failed', error: error instanceof Error ? error.message : String(error) };
  }
}

export const PARTNER_CLIENT_EMAIL_CATALOG = [
  {
    id: 'client_payment_success',
    name: 'Pago confirmado',
    description: 'Se envía al cliente cuando Stripe confirma el checkout.',
    trigger: 'stripe.checkout_completed',
    variables: ['clientName', 'clientEmail', 'productName', 'amount', 'currency', 'partnerName', 'supportEmail'],
  },
  {
    id: 'ghl_provision_success',
    name: 'Servicio en activación',
    description: 'Se envía al cliente cuando su entorno GHL queda en provisionamiento tras el pago.',
    trigger: 'ghl.client_provisioned',
    variables: ['clientName', 'clientEmail', 'productName', 'partnerName', 'supportEmail'],
  },
] as const;

export type PartnerClientTemplateId = typeof PARTNER_CLIENT_EMAIL_CATALOG[number]['id'];

function wrapPartnerClientHtml(body: string) {
  return `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#16181d;max-width:560px;margin:0 auto;padding:24px">
${body}
<p style="color:#737b8b;font-size:12px;margin-top:24px">— {{partnerName}}</p>
</div>`;
}

export const PARTNER_CLIENT_DEFAULT_TEMPLATES: Record<string, { subject: string; html: string; enabled: boolean }> = {
  client_payment_success: {
    subject: 'Pago confirmado — {{productName}}',
    html: wrapPartnerClientHtml(`
<h2 style="margin:0 0 12px">¡Gracias por tu pago!</h2>
<p>Hola <strong>{{clientName}}</strong>,</p>
<p>Confirmamos tu pago de <strong>{{amount}} {{currency}}</strong> por <strong>{{productName}}</strong>.</p>
<p>En breve daremos seguimiento a la activación de tu servicio. Si tienes preguntas, responde a este correo.</p>
<p style="color:#737b8b;font-size:13px">Equipo de {{partnerName}}</p>`),
    enabled: true,
  },
  ghl_provision_success: {
    subject: 'Tu servicio está en activación — {{productName}}',
    html: wrapPartnerClientHtml(`
<h2 style="margin:0 0 12px">Estamos activando tu servicio</h2>
<p>Hola <strong>{{clientName}}</strong>,</p>
<p>Tu pago por <strong>{{productName}}</strong> fue procesado y ya estamos preparando tu entorno.</p>
<p>Te contactaremos en <strong>{{clientEmail}}</strong> cuando todo esté listo. Ante cualquier duda, responde a este correo.</p>
<p style="color:#737b8b;font-size:13px">Equipo de {{partnerName}}</p>`),
    enabled: true,
  },
};

export type PartnerEmailSettings = {
  fromName?: string;
  replyTo?: string;
};

export function mergePartnerClientTemplates(
  stored: Record<string, Partial<{ subject: string; html: string; enabled: boolean }>> = {},
  platformTemplates: Record<string, Partial<{ subject: string; html: string; enabled: boolean }>> = {},
) {
  const merged: Record<string, { subject: string; html: string; enabled: boolean }> = {};
  for (const item of PARTNER_CLIENT_EMAIL_CATALOG) {
    const defaults = PARTNER_CLIENT_DEFAULT_TEMPLATES[item.id] || { subject: '', html: '', enabled: false };
    const platform = platformTemplates[item.id] || {};
    const override = stored[item.id] || {};
    merged[item.id] = {
      subject: override.subject ?? platform.subject ?? defaults.subject,
      html: override.html ?? platform.html ?? defaults.html,
      enabled: override.enabled !== undefined
        ? override.enabled
        : (platform.enabled !== undefined ? platform.enabled : defaults.enabled),
    };
  }
  return merged;
}

export async function loadPartnerEmailContext(supabase: SupabaseAdmin, partnerId: string) {
  const { data, error } = await supabase
    .from('partners')
    .select('id, name, branding')
    .eq('id', partnerId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const branding = (data.branding || {}) as Record<string, unknown>;
  const brand = (branding.brand || {}) as Record<string, string>;
  const emailSettings = (branding.emailSettings || brand.emailSettings || {}) as PartnerEmailSettings;
  const storedTemplates = (branding.emailTemplates || brand.emailTemplates || {}) as Record<string, Partial<{ subject: string; html: string; enabled: boolean }>>;
  const platformTemplates = await loadEmailTemplates(supabase);
  const templates = mergePartnerClientTemplates(storedTemplates, platformTemplates);

  const partnerName = String(brand.businessName || branding.name || data.name || 'Tu partner').trim();
  const replyTo = String(emailSettings.replyTo || brand.contactEmail || '').trim().toLowerCase();
  const fromName = String(emailSettings.fromName || partnerName).trim();

  return {
    partnerId: String(data.id),
    partnerName,
    fromName,
    replyTo,
    templates,
  };
}

export async function sendPartnerClientTemplatedEmail(
  supabase: SupabaseAdmin,
  partnerId: string,
  templateId: PartnerClientTemplateId | string,
  params: {
    to: string;
    variables?: Record<string, string>;
  },
) {
  const to = String(params.to || '').trim().toLowerCase();
  if (!to) return { skipped: true, reason: 'missing_recipient' };

  const emailConfig = await loadEmailConfig(supabase);
  if (!isEmailConfigReady(emailConfig)) return { skipped: true, reason: 'email_not_configured' };

  const context = await loadPartnerEmailContext(supabase, partnerId);
  if (!context) return { skipped: true, reason: 'partner_not_found' };

  const template = context.templates[String(templateId)];
  if (!template?.enabled) return { skipped: true, reason: 'template_disabled' };

  const variables = {
    partnerName: context.partnerName,
    supportEmail: context.replyTo || emailConfig.replyTo || emailConfig.fromEmail,
    appName: context.partnerName,
    ...(params.variables || {}),
  };

  await sendPlatformEmail(supabase, {
    to,
    subject: renderEmailTemplate(template.subject, variables),
    html: renderEmailTemplate(template.html, variables),
    text: renderEmailTemplate(template.subject, variables),
    fromName: context.fromName,
    replyTo: context.replyTo || undefined,
  });

  return { ok: true, templateId, to, partnerId };
}

export async function trySendPartnerClientTemplatedEmail(
  supabase: SupabaseAdmin,
  partnerId: string,
  templateId: PartnerClientTemplateId | string,
  params: { to: string; variables?: Record<string, string> },
) {
  try {
    return await sendPartnerClientTemplatedEmail(supabase, partnerId, templateId, params);
  } catch (error) {
    console.error('[partner-email-template]', partnerId, templateId, error);
    return { skipped: true, reason: 'send_failed', error: error instanceof Error ? error.message : String(error) };
  }
}
