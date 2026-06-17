import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY   = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL       = Deno.env.get('FROM_EMAIL') ?? 'CLM Central Texas <onboarding@resend.dev>';
const REPLY_TO         = Deno.env.get('REPLY_TO')   ?? 'clmcentraltexas@gmail.com';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } },
});

type Lang = 'en' | 'es';
type Event = 'submitted' | 'approved' | 'rejected';

type Gathering = {
  workshop_id: string;
  title: string;
  held_at: string;
  location_text: string | null;
  language: Lang | null;
  status: string;
  host_name: string | null;
  host_email: string | null;
  admin_emails: string[];
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

function render(g: Gathering, event: Event): { subject: string; html: string; text: string } {
  const lang: Lang = g.language ?? 'en';
  const es = lang === 'es';
  const when = new Date(g.held_at).toLocaleString(es ? 'es-MX' : 'en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  });
  const title = escapeHtml(g.title);
  const where = g.location_text ? escapeHtml(g.location_text) : '—';

  if (event === 'submitted') {
    return {
      subject: `New gathering pending approval: ${g.title}`,
      html: shell(
        `<p style="margin:0 0 16px;">A new gathering has been submitted${g.host_name ? ` by ${escapeHtml(g.host_name)}` : ''} and is awaiting approval.</p>
         <h1 style="font-size:24px; margin:0 0 16px; color:#3E4F2F; font-weight:500;">${title}</h1>
         <p style="margin:0 0 8px;"><strong>When:</strong> ${escapeHtml(when)}</p>
         <p style="margin:0 0 8px;"><strong>Where:</strong> ${where}</p>
         <p style="margin:24px 0 0; color:#4A5568; font-style:italic;">Review it on the Stewardship page.</p>`, lang),
      text: `A new gathering has been submitted${g.host_name ? ` by ${g.host_name}` : ''} and is awaiting approval.\n\n${g.title}\nWhen: ${when}\nWhere: ${g.location_text ?? '—'}\n\nReview it on the Stewardship page.`,
    };
  }

  if (event === 'approved') {
    const lead = es
      ? '¡Buenas noticias! Tu reunión fue aprobada y ya está abierta para confirmaciones.'
      : 'Good news — your gathering was approved and is now open for RSVPs.';
    return {
      subject: es ? `Tu reunión fue aprobada: ${g.title}` : `Your gathering was approved: ${g.title}`,
      html: shell(
        `<p style="margin:0 0 16px;">${lead}</p>
         <h1 style="font-size:24px; margin:0 0 16px; color:#3E4F2F; font-weight:500;">${title}</h1>
         <p style="margin:0 0 8px;"><strong>${es ? 'Cuándo' : 'When'}:</strong> ${escapeHtml(when)}</p>
         <p style="margin:0 0 8px;"><strong>${es ? 'Dónde' : 'Where'}:</strong> ${where}</p>`, lang),
      text: `${lead}\n\n${g.title}\n${es ? 'Cuándo' : 'When'}: ${when}\n${es ? 'Dónde' : 'Where'}: ${g.location_text ?? '—'}`,
    };
  }

  // rejected
  const subject = es ? `Sobre tu reunión: ${g.title}` : `About your gathering: ${g.title}`;
  const html = es
    ? `<p style="margin:0 0 8px;">Tu reunión "<strong>${title}</strong>" no fue aprobada esta vez. Si tienes preguntas, contacta a un mayordomo.</p>`
    : `<p style="margin:0 0 8px;">Your gathering "<strong>${title}</strong>" wasn't approved this time. If you have questions, reach out to a steward.</p>`;
  const text = es
    ? `Tu reunión "${g.title}" no fue aprobada esta vez. Si tienes preguntas, contacta a un mayordomo.`
    : `Your gathering "${g.title}" wasn't approved this time. If you have questions, reach out to a steward.`;
  return { subject, html: shell(html, lang), text };
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
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  let workshopId: string;
  let event: Event;
  try {
    const body = await req.json();
    workshopId = body.workshop_id;
    event = body.event;
    if (!workshopId || !event) throw new Error('missing workshop_id or event');
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const { data, error } = await admin.rpc('get_gathering_for_email', { p_workshop_id: workshopId });
  if (error || !data) {
    return new Response(JSON.stringify({ error: error?.message ?? 'gathering not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } });
  }
  const g = data as Gathering;

  const recipients = event === 'submitted'
    ? (g.admin_emails ?? []).filter(Boolean)
    : (g.host_email ? [g.host_email] : []);

  if (recipients.length === 0) {
    return new Response(JSON.stringify({ skipped: 'no recipients' }), { status: 200 });
  }

  const { subject, html, text } = render(g, event);
  const kind = `gathering_${event}`;
  const results: Record<string, string> = {};

  for (const to of recipients) {
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM_EMAIL, to, reply_to: REPLY_TO, subject, html, text }),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        await logEmail(kind, to, subject, 'failed', errText);
        results[to] = 'failed';
      } else {
        await logEmail(kind, to, subject, 'sent');
        results[to] = 'sent';
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await logEmail(kind, to, subject, 'failed', msg);
      results[to] = 'failed';
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
});