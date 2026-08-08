export const EMAIL_TRANSPORT_OPTIONS = [
  {
    id: 'api',
    label: 'API HTTP (recomendado)',
    hint: 'Ideal para Supabase Edge Functions. Más fiable que SMTP en serverless.',
  },
  {
    id: 'smtp',
    label: 'SMTP',
    hint: 'Estándar universal (587 STARTTLS o 465 SSL). Compatible con casi cualquier proveedor.',
  },
];

export const EMAIL_ENCRYPTION_OPTIONS = [
  { id: 'starttls', label: 'STARTTLS (puerto 587) — recomendado' },
  { id: 'ssl', label: 'SSL/TLS (puerto 465)' },
  { id: 'none', label: 'Sin cifrado (puerto 25 — no recomendado)' },
];

export const EMAIL_API_PROVIDERS = [
  { id: 'resend', label: 'Resend' },
  { id: 'sendgrid', label: 'SendGrid' },
  { id: 'mailgun', label: 'Mailgun' },
  { id: 'postmark', label: 'Postmark' },
];

/** Presets: autocompletan host/puerto/cifrado o API según proveedor */
export const EMAIL_PROVIDER_PRESETS = {
  custom: {
    label: 'Personalizado',
    transport: 'smtp',
    smtpHost: '',
    smtpPort: '587',
    smtpEncryption: 'starttls',
    apiProvider: 'resend',
  },
  resend: {
    label: 'Resend',
    transport: 'api',
    apiProvider: 'resend',
    smtpHost: 'smtp.resend.com',
    smtpPort: '587',
    smtpEncryption: 'starttls',
  },
  sendgrid: {
    label: 'SendGrid',
    transport: 'api',
    apiProvider: 'sendgrid',
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: '587',
    smtpEncryption: 'starttls',
  },
  mailgun: {
    label: 'Mailgun',
    transport: 'api',
    apiProvider: 'mailgun',
    smtpHost: 'smtp.mailgun.org',
    smtpPort: '587',
    smtpEncryption: 'starttls',
  },
  postmark: {
    label: 'Postmark',
    transport: 'api',
    apiProvider: 'postmark',
    smtpHost: 'smtp.postmarkapp.com',
    smtpPort: '587',
    smtpEncryption: 'starttls',
  },
  ses: {
    label: 'Amazon SES',
    transport: 'smtp',
    apiProvider: 'ses',
    smtpHost: 'email-smtp.us-east-1.amazonaws.com',
    smtpPort: '587',
    smtpEncryption: 'starttls',
    sesRegion: 'us-east-1',
  },
  brevo: {
    label: 'Brevo (Sendinblue)',
    transport: 'smtp',
    apiProvider: 'sendgrid',
    smtpHost: 'smtp-relay.brevo.com',
    smtpPort: '587',
    smtpEncryption: 'starttls',
  },
  gmail: {
    label: 'Gmail / Google Workspace',
    transport: 'smtp',
    apiProvider: 'resend',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpEncryption: 'starttls',
  },
  outlook: {
    label: 'Outlook / Microsoft 365',
    transport: 'smtp',
    apiProvider: 'resend',
    smtpHost: 'smtp.office365.com',
    smtpPort: '587',
    smtpEncryption: 'starttls',
  },
};

export const EMAIL_PROVIDER_LIST = Object.entries(EMAIL_PROVIDER_PRESETS).map(([id, preset]) => ({
  id,
  ...preset,
}));
