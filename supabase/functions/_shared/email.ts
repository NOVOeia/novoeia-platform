import { adminClient } from './core.ts';

type SupabaseAdmin = ReturnType<typeof adminClient>;

export type EmailTransport = 'smtp' | 'api';

export type EmailConfig = {
  transport: EmailTransport;
  provider: string;
  apiProvider: string;
  smtpHost: string;
  smtpPort: number;
  smtpEncryption: 'starttls' | 'ssl' | 'none';
  smtpUser: string;
  smtpPassword: string;
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyTo: string;
  mailgunDomain: string;
  sesRegion: string;
};

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

export async function loadEmailConfig(
  supabase: SupabaseAdmin,
): Promise<EmailConfig> {
  const { data } = await supabase
    .from('platform_integrations')
    .select('public_config, encrypted_secret')
    .eq('provider', 'email')
    .maybeSingle();

  const publicConfig = (data?.public_config || {}) as Record<string, unknown>;
  const secrets = data?.encrypted_secret
    ? JSON.parse(data.encrypted_secret as string) as Record<string, unknown>
    : {};

  const hasDbTransport = publicConfig.transport === 'smtp' || publicConfig.transport === 'api';

  return {
    transport: hasDbTransport
      ? publicConfig.transport as EmailTransport
      : (Deno.env.get('EMAIL_TRANSPORT') === 'api' ? 'api' : 'smtp'),
    provider: readString(publicConfig.provider, Deno.env.get('EMAIL_PROVIDER') || 'custom'),
    apiProvider: readString(publicConfig.apiProvider, Deno.env.get('EMAIL_API_PROVIDER') || 'resend'),
    smtpHost: readString(publicConfig.smtpHost, Deno.env.get('SMTP_HOST') || ''),
    smtpPort: Number(publicConfig.smtpPort || Deno.env.get('SMTP_PORT') || 587),
    smtpEncryption: (readString(publicConfig.smtpEncryption, Deno.env.get('SMTP_ENCRYPTION') || 'starttls') as EmailConfig['smtpEncryption']) || 'starttls',
    smtpUser: readString(publicConfig.smtpUser, Deno.env.get('SMTP_USER') || ''),
    smtpPassword: readString(secrets.smtpPassword, Deno.env.get('SMTP_PASSWORD') || ''),
    apiKey: readString(secrets.apiKey, Deno.env.get('EMAIL_API_KEY') || ''),
    fromEmail: readString(publicConfig.fromEmail, Deno.env.get('SMTP_FROM_EMAIL') || Deno.env.get('EMAIL_FROM') || ''),
    fromName: readString(publicConfig.fromName, Deno.env.get('EMAIL_FROM_NAME') || 'NOVO'),
    replyTo: readString(publicConfig.replyTo, Deno.env.get('EMAIL_REPLY_TO') || ''),
    mailgunDomain: readString(publicConfig.mailgunDomain, Deno.env.get('MAILGUN_DOMAIN') || ''),
    sesRegion: readString(publicConfig.sesRegion, Deno.env.get('AWS_SES_REGION') || 'us-east-1'),
  };
}

export function isEmailConfigReady(config: EmailConfig): boolean {
  if (!config.fromEmail) return false;
  if (config.transport === 'api') return Boolean(config.apiKey);
  return Boolean(config.smtpHost && config.smtpUser && config.smtpPassword);
}

function formatFrom(config: EmailConfig) {
  return config.fromName
    ? `${config.fromName} <${config.fromEmail}>`
    : config.fromEmail;
}

async function sendViaResend(config: EmailConfig, params: { to: string; subject: string; html: string; text?: string }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: formatFrom(config),
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
      reply_to: config.replyTo || undefined,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || `RESEND_${response.status}`);
  }
  return payload;
}

async function sendViaSendGrid(config: EmailConfig, params: { to: string; subject: string; html: string; text?: string }) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: params.to }] }],
      from: { email: config.fromEmail, name: config.fromName || undefined },
      reply_to: config.replyTo ? { email: config.replyTo } : undefined,
      subject: params.subject,
      content: [
        ...(params.text ? [{ type: 'text/plain', value: params.text }] : []),
        { type: 'text/html', value: params.html },
      ],
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || `SENDGRID_${response.status}`);
  }
  return { ok: true };
}

async function sendViaMailgun(config: EmailConfig, params: { to: string; subject: string; html: string; text?: string }) {
  if (!config.mailgunDomain) throw new Error('MAILGUN_DOMAIN_REQUIRED');
  const body = new URLSearchParams({
    from: formatFrom(config),
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
  if (params.text) body.set('text', params.text);
  if (config.replyTo) body.set('h:Reply-To', config.replyTo);

  const response = await fetch(`https://api.mailgun.net/v3/${config.mailgunDomain}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`api:${config.apiKey}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || `MAILGUN_${response.status}`);
  }
  return payload;
}

async function sendViaPostmark(config: EmailConfig, params: { to: string; subject: string; html: string; text?: string }) {
  const response = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      'X-Postmark-Server-Token': config.apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      From: formatFrom(config),
      To: params.to,
      Subject: params.subject,
      HtmlBody: params.html,
      TextBody: params.text,
      ReplyTo: config.replyTo || undefined,
      MessageStream: 'outbound',
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.Message || `POSTMARK_${response.status}`);
  }
  return payload;
}

function encodeBase64(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}

async function readSmtpResponse(conn: Deno.Conn | Deno.TlsConn) {
  const buffer = new Uint8Array(4096);
  const bytesRead = await conn.read(buffer);
  if (bytesRead === null) throw new Error('SMTP_CONNECTION_CLOSED');
  return new TextDecoder().decode(buffer.subarray(0, bytesRead));
}

async function writeSmtp(conn: Deno.Conn | Deno.TlsConn, command: string) {
  await conn.write(new TextEncoder().encode(`${command}\r\n`));
}

function resolveSmtpEncryption(config: EmailConfig): EmailConfig['smtpEncryption'] {
  const port = config.smtpPort || 587;
  // Puerto 465 exige TLS implícito; STARTTLS ahí suele fallar en silencio o colgar.
  if (port === 465 && config.smtpEncryption !== 'none') return 'ssl';
  if (port === 587 && config.smtpEncryption === 'ssl') return 'starttls';
  return config.smtpEncryption || 'starttls';
}

async function sendViaSmtp(config: EmailConfig, params: { to: string; subject: string; html: string; text?: string }) {
  const port = config.smtpPort || 587;
  const encryption = resolveSmtpEncryption(config);
  let conn: Deno.Conn | Deno.TlsConn = encryption === 'ssl'
    ? await Deno.connectTls({ hostname: config.smtpHost, port })
    : await Deno.connect({ hostname: config.smtpHost, port });

  try {
    await readSmtpResponse(conn);
    await writeSmtp(conn, `EHLO novo-platform`);
    const ehlo = await readSmtpResponse(conn);

    if (encryption === 'starttls' && ehlo.toUpperCase().includes('STARTTLS')) {
      await writeSmtp(conn, 'STARTTLS');
      await readSmtpResponse(conn);
      conn = await Deno.startTls(conn as Deno.Conn, { hostname: config.smtpHost });
      await writeSmtp(conn, 'EHLO novo-platform');
      await readSmtpResponse(conn);
    }

    await writeSmtp(conn, 'AUTH LOGIN');
    await readSmtpResponse(conn);
    await writeSmtp(conn, encodeBase64(config.smtpUser));
    await readSmtpResponse(conn);
    await writeSmtp(conn, encodeBase64(config.smtpPassword));
    const authResponse = await readSmtpResponse(conn);
    if (!authResponse.startsWith('235')) throw new Error(`SMTP_AUTH_FAILED:${authResponse.trim()}`);

    await writeSmtp(conn, `MAIL FROM:<${config.fromEmail}>`);
    await readSmtpResponse(conn);
    await writeSmtp(conn, `RCPT TO:<${params.to}>`);
    await readSmtpResponse(conn);
    await writeSmtp(conn, 'DATA');
    await readSmtpResponse(conn);

    const message = [
      `From: ${formatFrom(config)}`,
      `To: ${params.to}`,
      ...(config.replyTo ? [`Reply-To: ${config.replyTo}`] : []),
      `Subject: ${params.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      params.html,
    ].join('\r\n');

    await conn.write(new TextEncoder().encode(`${message}\r\n.\r\n`));
    const dataResponse = await readSmtpResponse(conn);
    if (!dataResponse.startsWith('250')) throw new Error(`SMTP_SEND_FAILED:${dataResponse.trim()}`);

    await writeSmtp(conn, 'QUIT');
    await readSmtpResponse(conn);
    return { ok: true };
  } finally {
    try { conn.close(); } catch { /* ignore */ }
  }
}

export async function sendPlatformEmail(
  supabase: SupabaseAdmin,
  params: { to: string; subject: string; html: string; text?: string; fromName?: string; replyTo?: string },
) {
  const config = await loadEmailConfig(supabase);
  if (!isEmailConfigReady(config)) throw new Error('EMAIL_NOT_CONFIGURED');

  const effectiveConfig: EmailConfig = {
    ...config,
    fromName: String(params.fromName || config.fromName || '').trim() || config.fromName,
    replyTo: String(params.replyTo || config.replyTo || '').trim() || config.replyTo,
  };

  if (config.transport === 'api') {
    switch (config.apiProvider) {
      case 'sendgrid':
        return sendViaSendGrid(effectiveConfig, params);
      case 'mailgun':
        return sendViaMailgun(effectiveConfig, params);
      case 'postmark':
        return sendViaPostmark(effectiveConfig, params);
      case 'resend':
      default:
        return sendViaResend(effectiveConfig, params);
    }
  }

  return sendViaSmtp(effectiveConfig, params);
}
