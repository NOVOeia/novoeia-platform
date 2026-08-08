/** Plantillas que el partner puede personalizar — correos que reciben sus clientes. */
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
];

function wrapPartnerHtml(body) {
  return `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#16181d;max-width:560px;margin:0 auto;padding:24px">
${body}
<p style="color:#737b8b;font-size:12px;margin-top:24px">— {{partnerName}}</p>
</div>`;
}

export const PARTNER_CLIENT_DEFAULT_TEMPLATES = {
  client_payment_success: {
    subject: 'Pago confirmado — {{productName}}',
    html: wrapPartnerHtml(`
<h2 style="margin:0 0 12px">¡Gracias por tu pago!</h2>
<p>Hola <strong>{{clientName}}</strong>,</p>
<p>Confirmamos tu pago de <strong>{{amount}} {{currency}}</strong> por <strong>{{productName}}</strong>.</p>
<p>En breve daremos seguimiento a la activación de tu servicio. Si tienes preguntas, responde a este correo.</p>
<p style="color:#737b8b;font-size:13px">Equipo de {{partnerName}}</p>`),
    enabled: true,
  },
  ghl_provision_success: {
    subject: 'Tu servicio está en activación — {{productName}}',
    html: wrapPartnerHtml(`
<h2 style="margin:0 0 12px">Estamos activando tu servicio</h2>
<p>Hola <strong>{{clientName}}</strong>,</p>
<p>Tu pago por <strong>{{productName}}</strong> fue procesado y ya estamos preparando tu entorno.</p>
<p>Te contactaremos en <strong>{{clientEmail}}</strong> cuando todo esté listo. Ante cualquier duda, responde a este correo.</p>
<p style="color:#737b8b;font-size:13px">Equipo de {{partnerName}}</p>`),
    enabled: true,
  },
};

export function renderPartnerEmailTemplate(template, variables = {}) {
  const merged = { partnerName: 'Tu agencia', supportEmail: 'soporte@ejemplo.com', ...variables };
  return String(template || '').replace(/\{\{(\w+)\}\}/g, (_, key) => merged[key] ?? '');
}

export function mergePartnerClientTemplates(stored = {}, platformTemplates = {}) {
  const merged = {};
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

export function listPartnerClientTemplatesForUi(stored = {}, platformTemplates = {}) {
  const merged = mergePartnerClientTemplates(stored, platformTemplates);
  return PARTNER_CLIENT_EMAIL_CATALOG.map(meta => ({
    ...meta,
    ...merged[meta.id],
  }));
}
