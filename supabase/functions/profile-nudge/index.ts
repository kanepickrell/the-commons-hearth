// supabase/functions/profile-nudge/index.ts
//
// Daily follow-up to approved members whose profile has no parish or no bio:
// "you're in, but your neighbors can't find you yet." Run by pg_cron (see
// supabase/sql/2026-11-05_profile_nudge.sql); profiles_needing_nudge() decides
// who is due, and each send is logged to email_log as kind 'profile_nudge',
// which is how the RPC knows to stop after two.
//
// Not called from the browser. verify_jwt is OFF and the caller must send
// x-nudge-secret matching NUDGE_SECRET, so the cron job doesn't depend on
// which API key format the project uses.
//
// Body (all optional):
//   { "dry_run": true }        list who would be emailed, send nothing
//   { "only": "a@b.com" }      send only to this member, skipping the two-day
//                              wait (testing); still incomplete + max two
//
// Secrets: RESEND_API_KEY, NUDGE_SECRET, FROM_EMAIL, REPLY_TO, SITE_URL,
// NUDGE_BCC (optional; a copy of every nudge, invisible to the member).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY   = Deno.env.get('RESEND_API_KEY')!;
const NUDGE_SECRET     = Deno.env.get('NUDGE_SECRET') ?? '';
const FROM_EMAIL       = Deno.env.get('FROM_EMAIL') ?? 'CLM Central Texas <onboarding@resend.dev>';
const REPLY_TO         = Deno.env.get('REPLY_TO')   ?? 'clmcentraltexas@gmail.com';
const SITE_URL         = (Deno.env.get('SITE_URL')  ?? 'https://www.centraltexasclm.org').replace(/\/$/, '');
const NUDGE_BCC        = Deno.env.get('NUDGE_BCC')  ?? '';

// Resend's default limit is 2 requests/second, and the free plan's daily cap
// is 100 — a backlog drains over a few days rather than in one burst.
const MAX_PER_RUN = 20;
const SEND_GAP_MS = 600;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } },
});

const JSON_HEADERS = { 'Content-Type': 'application/json' };

type Lang = 'en' | 'es';

type Candidate = {
  profile_id: string;
  email: string;
  display_name: string | null;
  language: string | null;
  missing_parish: boolean;
  missing_bio: boolean;
  nudges_sent: number;
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

// One language's worth of copy. A member we have no language for gets English
// with the Spanish underneath, rather than a guess.
function copy(c: Candidate, lang: Lang) {
  const es = lang === 'es';
  const name = c.display_name?.trim() || (es ? 'vecino' : 'neighbor');
  const link = `${SITE_URL}${es ? '/bienvenido' : '/welcome'}`;

  const asks: string[] = [];
  if (c.missing_parish) {
    asks.push(es
      ? 'Tu parroquia, para que podamos conectar nuestras comunidades'
      : 'Your parish, so we can connect our communities together');
  }
  if (c.missing_bio) {
    asks.push(es
      ? 'Unas líneas en tu biografía para que el capítulo pueda conocerte'
      : 'A few lines in your bio so our chapter can get to know you');
  }

  return {
    greet: es ? `Hola ${name},` : `Hi ${name},`,
    lead: es
      ? 'Ya eres parte del capítulo, pero tu perfil todavía está incompleto. Nos falta:'
      : "You're part of the chapter, but your profile isn't finished yet. We're missing:",
    asks,
    after: es
      ? 'Toma dos minutos. Inicia sesión con este mismo correo y te llevaremos directo a las preguntas.'
      : 'It takes two minutes. Sign in with this same email address and it will take you straight to the questions.',
    cta: es ? 'Completar mi perfil' : 'Finish my profile',
    link,
    closing: es
      ? 'Si tienes preguntas, responde a este correo.'
      : 'If you have any questions, just reply to this email.',
    signoff: es ? 'En Cristo,\nCLM Central Texas' : 'In Christ,\nCLM Central Texas',
  };
}

function section(k: ReturnType<typeof copy>): { html: string; text: string } {
  const html =
    `<p style="margin:0 0 16px;">${escapeHtml(k.greet)}</p>
     <p style="margin:0 0 8px;">${escapeHtml(k.lead)}</p>
     <ul style="margin:0 0 16px; padding-left:20px;">
       ${k.asks.map((a) => `<li style="margin:0 0 4px;">${escapeHtml(a)}</li>`).join('')}
     </ul>
     <p style="margin:0 0 20px;">${escapeHtml(k.after)}</p>
     <p style="margin:0 0 8px;">
       <a href="${k.link}" style="display:inline-block; background:#C68B3E; color:#F5EEDE; text-decoration:none; padding:12px 24px; font-weight:500;">${escapeHtml(k.cta)}</a>
     </p>
     <p style="margin:4px 0 0; font-size:13px; color:#4A5568;">${escapeHtml(k.link)}</p>
     <p style="margin:24px 0 16px; color:#4A5568; font-style:italic;">${escapeHtml(k.closing)}</p>
     <p style="margin:0; white-space:pre-line;">${escapeHtml(k.signoff)}</p>`;
  const text = [k.greet, '', k.lead, ...k.asks.map((a) => `  - ${a}`), '', k.after, '',
                `${k.cta}: ${k.link}`, '', k.closing, '', k.signoff].join('\n');
  return { html, text };
}

function render(c: Candidate): { subject: string; html: string; text: string } {
  const known: Lang | null = c.language === 'es' ? 'es' : c.language === 'en' ? 'en' : null;
  const langs: Lang[] = known ? [known] : ['en', 'es'];
  const parts = langs.map((l) => section(copy(c, l)));

  const rule = '<hr style="border:none; border-top:1px solid rgba(62,79,47,0.15); margin:32px 0;">';
  const subjects = {
    en: 'Almost there! Finish your community profile.',
    es: '¡Ya casi! Completa tu perfil comunitario.',
  };

  return {
    subject: known ? subjects[known] : `${subjects.en} · ${subjects.es}`,
    html: shell(parts.map((p) => p.html).join(rule), langs[0]),
    text: parts.map((p) => p.text).join('\n\n----\n\n'),
  };
}

// The log is what caps each member at two nudges, so a write that fails
// matters more here than in the other functions: an unlogged send looks like
// no send, and the member would be emailed again tomorrow. Report it, and the
// caller stops the run.
async function logEmail(recipient: string, subject: string, status: 'sent' | 'failed', error?: string): Promise<boolean> {
  try {
    const { error: rpcErr } = await admin.rpc('log_gathering_email', {
      p_kind: 'profile_nudge',
      p_recipient: recipient,
      p_subject: subject,
      p_status: status,
      p_error: error ?? null,
    });
    if (rpcErr) throw rpcErr;
    return true;
  } catch (e) {
    console.error('email_log write failed:', e);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  if (!NUDGE_SECRET || req.headers.get('x-nudge-secret') !== NUDGE_SECRET) {
    return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: JSON_HEADERS });
  }

  let dryRun = false;
  let only: string | null = null;
  try {
    const body = await req.json();
    dryRun = body?.dry_run === true;
    only = typeof body?.only === 'string' ? body.only : null;
  } catch {
    // An empty body is the normal cron call.
  }

  const { data, error } = await admin.rpc('profiles_needing_nudge', { p_limit: MAX_PER_RUN, p_email: only });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: JSON_HEADERS });
  }
  const due = (data ?? []) as Candidate[];

  if (dryRun) {
    return new Response(JSON.stringify({
      dry_run: true,
      count: due.length,
      due: due.map(({ email, display_name, language, missing_parish, missing_bio, nudges_sent }) =>
        ({ email, display_name, language, missing_parish, missing_bio, nudges_sent })),
    }), { status: 200, headers: JSON_HEADERS });
  }

  const results: Record<string, string> = {};
  for (const [i, c] of due.entries()) {
    if (i > 0) await new Promise((r) => setTimeout(r, SEND_GAP_MS));
    const { subject, html, text } = render(c);
    let sent = false;
    let logged: boolean;
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: c.email,
          ...(NUDGE_BCC ? { bcc: NUDGE_BCC } : {}),
          reply_to: REPLY_TO,
          subject, html, text,
        }),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        logged = await logEmail(c.email, subject, 'failed', errText);
        results[c.email] = 'failed';
      } else {
        sent = true;
        logged = await logEmail(c.email, subject, 'sent');
        results[c.email] = 'sent';
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logged = await logEmail(c.email, subject, 'failed', msg);
      results[c.email] = 'failed';
    }
    if (!logged) {
      return new Response(JSON.stringify({
        error: 'email_log write failed; stopped so no one is emailed twice',
        unlogged: c.email, unlogged_was_sent: sent, results,
      }), { status: 500, headers: JSON_HEADERS });
    }
  }

  return new Response(JSON.stringify({ ok: true, count: due.length, results }), {
    status: 200, headers: JSON_HEADERS,
  });
});
