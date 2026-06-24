// supabase/functions/contact-notify/index.ts
//
// Public contact form -> emails the chapter inbox via Resend.
// Called by anonymous (non-logged-in) visitors from the footer ContactModal,
// so this function is configured with verify_jwt = false in config.toml.
// Spam defense is a honeypot field ("website"): real users never see it;
// bots fill it, and we silently accept-and-drop those submissions.
//
// reply_to is set to the sender's address, so a steward can just hit "Reply"
// in Gmail to answer them directly.

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL     = Deno.env.get('FROM_EMAIL')     ?? 'CLM Central Texas <onboarding@resend.dev>';
// Where contact messages land. Falls back to the chapter inbox used elsewhere.
const CONTACT_INBOX  = Deno.env.get('CONTACT_INBOX')  ?? Deno.env.get('REPLY_TO') ?? 'clmcentraltexas@gmail.com';

// CORS so the browser preflight (OPTIONS) succeeds when the public site
// calls this function via supabase.functions.invoke().
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const JSON_HEADERS = { ...CORS_HEADERS, 'Content-Type': 'application/json' };

type Lang = 'en' | 'es';
type Category = 'general' | 'parish' | 'chapter' | 'press';

const CATEGORY_LABELS: Record<Category, string> = {
  general: 'General question',
  parish:  'Parish partnership',
  chapter: 'Start a chapter',
  press:   'Press',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function isCategory(v: unknown): v is Category {
  return v === 'general' || v === 'parish' || v === 'chapter' || v === 'press';
}

function renderHtml(args: {
  name: string;
  email: string;
  category: Category;
  message: string;
  lang: Lang;
}): string {
  const messageHtml = escapeHtml(args.message).replace(/\n/g, '<br>');
  return `<!doctype html>
<html lang="en"><body style="font-family: Georgia, 'EB Garamond', serif; color:#3E4F2F; background:#EFE6D2; padding:32px; line-height:1.6;">
  <div style="max-width:560px; margin:0 auto; background:#F5EEDE; padding:32px; border:1px solid rgba(62,79,47,0.15);">
    <p style="letter-spacing:0.2em; font-size:11px; color:#C68B3E; margin:0 0 16px;">CLM CENTRAL TEXAS · CONTACT</p>
    <h1 style="font-size:22px; margin:0 0 20px; color:#3E4F2F; font-weight:500;">${escapeHtml(CATEGORY_LABELS[args.category])}</h1>
    <p style="margin:0 0 8px;"><strong>From:</strong> ${escapeHtml(args.name)}</p>
    <p style="margin:0 0 8px;"><strong>Email:</strong> ${escapeHtml(args.email)}</p>
    <p style="margin:0 0 8px;"><strong>Language:</strong> ${args.lang === 'es' ? 'Español' : 'English'}</p>
    <hr style="border:none; border-top:1px solid rgba(62,79,47,0.15); margin:20px 0;">
    <p style="margin:0; white-space:pre-line;">${messageHtml}</p>
    <p style="margin:24px 0 0; font-size:13px; color:#4A5568; font-style:italic;">Reply directly to this email to answer ${escapeHtml(args.name)}.</p>
  </div>
</body></html>`;
}

function renderText(args: {
  name: string; email: string; category: Category; message: string; lang: Lang;
}): string {
  return [
    `New contact message — ${CATEGORY_LABELS[args.category]}`,
    '',
    `From:  ${args.name}`,
    `Email: ${args.email}`,
    `Lang:  ${args.lang === 'es' ? 'Español' : 'English'}`,
    '',
    args.message,
    '',
    `Reply directly to this email to answer ${args.name}.`,
  ].join('\n');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'bad_request' }), { status: 400, headers: JSON_HEADERS });
  }

  // Honeypot: a real browser never fills "website" (it's visually hidden).
  // If it's present, accept silently so bots get a 200 and move on.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: JSON_HEADERS });
  }

  const name    = typeof body.name === 'string' ? body.name.trim() : '';
  const email   = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const category: Category = isCategory(body.category) ? body.category : 'general';
  const lang: Lang = body.lang === 'es' ? 'es' : 'en';

  // Validation — mirror the client, but never trust it.
  if (name.length < 1 || name.length > 100) {
    return new Response(JSON.stringify({ error: 'invalid_name' }), { status: 422, headers: JSON_HEADERS });
  }
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return new Response(JSON.stringify({ error: 'invalid_email' }), { status: 422, headers: JSON_HEADERS });
  }
  if (message.length < 1 || message.length > 5000) {
    return new Response(JSON.stringify({ error: 'invalid_message' }), { status: 422, headers: JSON_HEADERS });
  }

  const subject = `[Contact · ${CATEGORY_LABELS[category]}] ${name}`;
  const html = renderHtml({ name, email, category, message, lang });
  const text = renderText({ name, email, category, message, lang });

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: CONTACT_INBOX,
        reply_to: email,
        subject,
        html,
        text,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Resend failed:', errText);
      return new Response(
        JSON.stringify({ error: 'resend_failed', detail: errText }),
        { status: 502, headers: JSON_HEADERS },
      );
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: JSON_HEADERS });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Exception during Resend:', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: JSON_HEADERS });
  }
});