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
];

function wrapHtml(body) {
  return `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#16181d;max-width:560px;margin:0 auto;padding:24px">
${body}
<p style="color:#737b8b;font-size:12px;margin-top:24px">— {{appName}}</p>
</div>`;
}

export const DEFAULT_EMAIL_TEMPLATES = {
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
    enabled: false,
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

export function renderEmailTemplate(template, variables = {}) {
  const merged = { appName: 'NOVO Partners', ...variables };
  return String(template || '').replace(/\{\{(\w+)\}\}/g, (_, key) => merged[key] ?? '');
}

export function mergeEmailTemplates(stored = {}) {
  const merged = {};
  for (const item of EMAIL_TEMPLATE_CATALOG) {
    const defaults = DEFAULT_EMAIL_TEMPLATES[item.id] || { subject: '', html: '', enabled: false };
    const override = stored[item.id] || {};
    merged[item.id] = {
      subject: override.subject ?? defaults.subject,
      html: override.html ?? defaults.html,
      enabled: override.enabled !== undefined ? override.enabled : defaults.enabled,
    };
  }
  return merged;
}

export function listEmailTemplatesForAdmin(stored = {}) {
  const merged = mergeEmailTemplates(stored);
  return EMAIL_TEMPLATE_CATALOG.map(meta => ({
    ...meta,
    ...merged[meta.id],
  }));
}
