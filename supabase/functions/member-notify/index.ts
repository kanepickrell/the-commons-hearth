import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY   = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL       = Deno.env.get('FROM_EMAIL') ?? 'CLM Central Texas <onboarding@resend.dev>';
const REPLY_TO         = Deno.env.get('REPLY_TO')   ?? 'clmcentraltexas@gmail.com';
const DISCORD_INVITE   = Deno.env.get('DISCORD_INVITE_URL') ?? '';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } },
});

// CORS so the browser preflight (OPTIONS) succeeds when the admin panel at
// the deployed origin calls this function via supabase.functions.invoke().
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const JSON_HEADERS = { ...CORS_HEADERS, 'Content-Type': 'application/json' };

type Lang = 'en' | 'es';

type Member = {
  profile_id: string;
  display_name: string | null;
  language: Lang | null;
  email: string | null;
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function shell(inner: string, lang: Lang): string {
  return `<!doctype html><html lang="${lang}"><body style="font-family: Georgia, 'EB Garamond', serif; color:#3E4F2F; background:#EFE6D2; padding:32px; line-height:1.6;">
  <div style="max-width:560px; margin:0 auto; background:#F5EEDE; padding:32px; border:1px solid rgba(62,79,47,0.15);">
    <p style="letter-spacing:0.2em; font-size:11px; color:#C68B3E; margin:0 0 16px;">CLM CENTRAL TEXAS</p>
    ${inner}
  </div></body></html>`;
}

function render(m: Member): { subject: string; html: string; text: string } {
  const lang: Lang = m.language ?? 'en';
  const es = lang === 'es';
  const name = escapeHtml(m.display_name ?? (es ? 'vecino' : 'neighbor'));

  const greet = es ? `Hola ${name},` : `Hi ${name},`;
  const lead  = es
    ? 'Tu perfil fue aprobado. Bienvenido al capítulo — ya puedes confirmar tu asistencia a las reuniones y ofrecer las tuyas.'
    : 'Your profile has been approved. Welcome to the chapter — you can now RSVP to gatherings and host your own.';
  const discordLead = es
    ? 'Únete a nuestro Discord para seguir la conversación entre reuniones:'
    : 'Join our Discord to keep the conversation going between gatherings:';
  const discordCta = es ? 'Entrar al Discord' : 'Join the Discord';
  const closing = es
    ? 'Nos vemos pronto. Si tienes preguntas, responde a este correo.'
    : 'See you soon. If you have any questions, just reply to this email.';
  const signoff = es ? 'En Cristo,\nCLM Central Texas' : 'In Christ,\nCLM Central Texas';

  const discordBlock = DISCORD_INVITE
    ? `<p style="margin:24px 0 12px;">${discordLead}</p>
       <p style="margin:0 0 8px;">
         <a href="${DISCORD_INVITE}" style="display:inline-block; background:#C68B3E; color:#F5EEDE; text-decoration:none; padding:12px 24px; font-weight:500;">${discordCta}</a>
       </p>
       <p style="margin:4px 0 0; font-size:13px; color:#4A5568;">${escapeHtml(DISCORD_INVITE)}</p>`
    : '';

  const html = shell(
    `<p style="margin:0 0 16px;">${greet}</p>
     <p style="margin:0 0 8px;">${lead}</p>
     ${discordBlock}
     <p style="margin:24px 0 16px; color:#4A5568; font-style:italic;">${closing}</p>
     <p style="margin:0; white-space:pre-line;">${signoff}</p>`, lang);

  const textLines = [greet, '', lead];
  if (DISCORD_INVITE) textLines.push('', discordLead, DISCORD_INVITE);
  textLines.push('', closing, '', signoff);

  return {
    subject: es ? '¡Bienvenido al capítulo!' : 'Welcome to the chapter!',
    html,
    text: textLines.join('\n'),
  };
}

async function logEmail(kind: string, recipient: string, subject: string, status: 'sent' | 'failed', error?: string) {
  try {
    await admin.rpc('log_gathering_email', {
      p_kind: kind,
      p_recipient: recipient,
      p_subject: subject,
      p_status: status,
      p_error: error ?? null,
    });
  } catch (e) {
    console.error('email_log write failed:', e);
  }
}

Deno.serve(async (req: Request) => {
  // Browser preflight — must succeed or the real POST is never sent.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  }

  let profileId: string;
  try {
    const body = await req.json();
    profileId = body.profile_id;
    if (!profileId) throw new Error('missing profile_id');
  } catch {
    return new Response('Bad request', { status: 400, headers: CORS_HEADERS });
  }

  const { data, error } = await admin.rpc('get_member_for_email', { p_profile_id: profileId });
  if (error || !data) {
    return new Response(JSON.stringify({ error: error?.message ?? 'member not found' }),
      { status: 404, headers: JSON_HEADERS });
  }
  const m = data as Member;

  if (!m.email) {
    return new Response(JSON.stringify({ skipped: 'no email' }), { status: 200, headers: JSON_HEADERS });
  }

  const { subject, html, text } = render(m);

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to: m.email, reply_to: REPLY_TO, subject, html, text }),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      await logEmail('member_approved', m.email, subject, 'failed', errText);
      return new Response(JSON.stringify({ error: 'resend_failed', detail: errText }),
        { status: 502, headers: JSON_HEADERS });
    }
    await logEmail('member_approved', m.email, subject, 'sent');
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: JSON_HEADERS });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await logEmail('member_approved', m.email, subject, 'failed', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: JSON_HEADERS });
  }
});