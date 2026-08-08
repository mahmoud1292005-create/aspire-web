// Mailtrap's HTTP API instead of raw SMTP sockets - Cloudflare Workers'
// nodejs_compat layer doesn't reliably support the TCP socket connections
// nodemailer needs for SMTP, but fetch() works everywhere (Workers, Render,
// local Node), so this one implementation covers every environment.

const MAILTRAP_SEND_URL = 'https://send.api.mailtrap.io/api/send';

export function getFromAddress() {
  return process.env.SMTP_FROM || 'Aspire <noreply@aspire.local>';
}

function parseFromAddress(raw) {
  // "Name <email@example.com>" -> { name, email } ; plain "email@x.com" -> { email }
  const match = raw.match(/^(.*)<(.+)>$/);
  if (match) {
    const name = match[1].trim().replace(/^"|"$/g, '');
    return name ? { name, email: match[2].trim() } : { email: match[2].trim() };
  }
  return { email: raw.trim() };
}

export function isEmailConfigured() {
  // SMTP_PASS holds the Mailtrap API token (set via `wrangler secret put SMTP_PASS`).
  return Boolean(process.env.SMTP_PASS);
}

export async function sendEmail({ to, subject, html }) {
  const token = process.env.SMTP_PASS;
  if (!token) return { skipped: true };

  const res = await fetch(MAILTRAP_SEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: parseFromAddress(getFromAddress()),
      to: [{ email: to }],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Mailtrap API error ${res.status}: ${text}`);
  }

  return res.json();
}