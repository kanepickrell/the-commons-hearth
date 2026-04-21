// supabase/functions/send-rsvp-confirmation/index.ts
//
// Uses public.get_rsvp_for_email() RPC (SECURITY DEFINER) to fetch data,
// and public.log_email_send() RPC to log results. Both bypass RLS via
// SECURITY DEFINER so the function works regardless of how the Edge Functions
// runtime handles the new sb_secret_ API key format.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const SUPABASE_URL       = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY     = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL         = Deno.env.get('FROM_EMAIL')  ?? 'CLM Central Texas <onboarding@resend.dev>';
const REPLY_TO           = Deno.env.get('REPLY_TO')    ?? 'clmcentraltexas@gmail.com';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  },
});

type Lang = 'en' | 'es';

const CONTRIBUTION_LABELS: Record<string, Record<Lang, string>> = {
  time:      { en: 'my time',           es: 'mi tiempo' },
  skill:     { en: 'a skill to share',  es: 'una habilidad para compartir' },
  food:      { en: 'food',              es: 'comida' },
  tools:     { en: 'tools',             es: 'herramientas' },
  materials: { en: 'materials',         es: 'materiales' },
  other:     { en: 'something to share',es: 'algo para compartir' },
};

const T = {
  subject: (title: string, lang: Lang) =>
    lang === 'es'
      ? `Confirmación: ${title}`
      : `RSVP confirmed: ${title}`,
  greet: (name: string, lang: Lang) =>
    lang === 'es' ? `Hola ${name},` : `Hi ${name},`,
  confirmed: (lang: Lang) =>
    lang === 'es'
      ? 'Gracias por confirmar tu asistencia. Aquí están los detalles:'
      : "Thanks for confirming you'll be there. Here are the details:",
  when:      { en: 'When',          es: 'Cuándo' },
  where:     { en: 'Where',         es: 'Dónde' },
  host:      { en: 'Host',          es: 'Anfitrión' },
  bringing:  { en: "You're bringing", es: 'Traes' },
  note:      { en: 'Your note',     es: 'Tu nota' },
  closing: (lang: Lang) =>
    lang === 'es'
      ? 'Nos vemos pronto. Si no puedes asistir, responde a este correo y avísanos.'
      : "See you soon. If plans change, just reply to this email and let us know.",
  signoff: (lang: Lang) =>
    lang === 'es'
      ? 'En Cristo,\nCLM Central Texas'
      : 'In Christ,\nCLM Central Texas',
} as const;

function pad(n: number) { return n.toString().padStart(2, '0'); }

function toIcsDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) + 'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) + 'Z'
  );
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function buildIcs(args: {
  workshopId: string;
  title: string;
  description: string;
  location: string;
  start: string;
  durationHours?: number;
}): string {
  const { workshopId, title, description, location, start } = args;
  const durationH = args.durationHours ?? 2;
  const startUtc = new Date(start);
  const endUtc = new Date(startUtc.getTime() + durationH * 3600_000);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CLM Central Texas//Commons//EN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${workshopId}@clmcentraltexas`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(startUtc.toISOString())}`,
    `DTEND:${toIcsDate(endUtc.toISOString())}`,
    `SUMMARY:${icsEscape(title)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    `LOCATION:${icsEscape(location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

function renderHtml(args: {
  lang: Lang;
  attendeeName: string;
  workshopTitle: string;
  whenHuman: string;
  location: string;
  hostName: string;
  contributionLabel: string;
  contributionNote: string | null;
}): string {
  const { lang } = args;
  const noteBlock = args.contributionNote
    ? `<p style="margin:0 0 8px;"><strong>${T.note[lang]}:</strong> ${escapeHtml(args.contributionNote)}</p>`
    : '';

  return `<!doctype html>
<html lang="${lang}"><body style="font-family: Georgia, 'EB Garamond', serif; color:#3E4F2F; background:#EFE6D2; padding:32px; line-height:1.6;">
  <div style="max-width:560px; margin:0 auto; background:#F5EEDE; padding:32px; border:1px solid rgba(62,79,47,0.15);">
    <p style="letter-spacing:0.2em; font-size:11px; color:#C68B3E; margin:0 0 16px;">CLM CENTRAL TEXAS</p>
    <p style="margin:0 0 16px;">${T.greet(args.attendeeName, lang)}</p>
    <p style="margin:0 0 20px;">${T.confirmed(lang)}</p>

    <h1 style="font-size:24px; margin:0 0 20px; color:#3E4F2F; font-weight:500;">
      ${escapeHtml(args.workshopTitle)}
    </h1>

    <p style="margin:0 0 8px;"><strong>${T.when[lang]}:</strong> ${escapeHtml(args.whenHuman)}</p>
    <p style="margin:0 0 8px;"><strong>${T.where[lang]}:</strong> ${escapeHtml(args.location)}</p>
    <p style="margin:0 0 8px;"><strong>${T.host[lang]}:</strong> ${escapeHtml(args.hostName)}</p>
    <p style="margin:0 0 8px;"><strong>${T.bringing[lang]}:</strong> ${escapeHtml(args.contributionLabel)}</p>
    ${noteBlock}

    <p style="margin:24px 0 16px; color:#4A5568; font-style:italic;">${T.closing(lang)}</p>
    <p style="margin:0; white-space:pre-line;">${T.signoff(lang)}</p>
  </div>
</body></html>`;
}

function renderText(args: {
  lang: Lang;
  attendeeName: string;
  workshopTitle: string;
  whenHuman: string;
  location: string;
  hostName: string;
  contributionLabel: string;
  contributionNote: string | null;
}): string {
  const { lang } = args;
  const parts = [
    T.greet(args.attendeeName, lang),
    '',
    T.confirmed(lang),
    '',
    args.workshopTitle,
    '',
    `${T.when[lang]}: ${args.whenHuman}`,
    `${T.where[lang]}: ${args.location}`,
    `${T.host[lang]}: ${args.hostName}`,
    `${T.bringing[lang]}: ${args.contributionLabel}`,
  ];
  if (args.contributionNote) {
    parts.push(`${T.note[lang]}: ${args.contributionNote}`);
  }
  parts.push('', T.closing(lang), '', T.signoff(lang));
  return parts.join('\n');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function logEmail(args: {
  rsvp_id: string;
  recipient: string;
  subject: string;
  status: 'sent' | 'failed';
  error?: string;
}) {
  try {
    await admin.rpc('log_email_send', {
      p_rsvp_id: args.rsvp_id,
      p_recipient: args.recipient,
      p_subject: args.subject,
      p_status: args.status,
      p_error: args.error ?? null,
    });
  } catch (e) {
    console.error('email_log write failed:', e);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let rsvpId: string;
  try {
    const body = await req.json();
    rsvpId = body.rsvp_id;
    if (!rsvpId) throw new Error('missing rsvp_id');
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  console.log('Fetching RSVP via RPC:', rsvpId);

  const { data: rsvpData, error: rpcErr } = await admin.rpc('get_rsvp_for_email', {
    p_rsvp_id: rsvpId,
  });

  console.log('RPC error:', JSON.stringify(rpcErr, null, 2));
  console.log('RPC data present:', !!rsvpData);

  if (rpcErr || !rsvpData) {
    return new Response(
      JSON.stringify({ error: rpcErr?.message ?? 'rsvp not found', detail: rpcErr }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const rsvp = rsvpData as {
    id: string;
    contribution_type: string;
    contribution_note: string | null;
    attendee: { id: string; display_name: string | null; bio_language: Lang | null; email: string };
    workshop: {
      id: string; title: string; description: string | null;
      held_at: string; location_text: string | null; language: Lang | null;
      host: { id: string; display_name: string | null } | null;
    };
  };

  const recipient = rsvp.attendee.email;
  const lang: Lang = rsvp.attendee.bio_language ?? rsvp.workshop.language ?? 'en';
  const attendeeName      = rsvp.attendee.display_name ?? recipient.split('@')[0];
  const hostName          = rsvp.workshop.host?.display_name ?? '—';
  const location          = rsvp.workshop.location_text ?? '—';
  const contributionLabel = CONTRIBUTION_LABELS[rsvp.contribution_type]?.[lang] ?? rsvp.contribution_type;

  const whenDate = new Date(rsvp.workshop.held_at);
  const whenHuman = whenDate.toLocaleString(lang === 'es' ? 'es-MX' : 'en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  });

  const subject = T.subject(rsvp.workshop.title, lang);
  const html = renderHtml({
    lang, attendeeName, workshopTitle: rsvp.workshop.title, whenHuman,
    location, hostName, contributionLabel,
    contributionNote: rsvp.contribution_note,
  });
  const text = renderText({
    lang, attendeeName, workshopTitle: rsvp.workshop.title, whenHuman,
    location, hostName, contributionLabel,
    contributionNote: rsvp.contribution_note,
  });

  const ics = buildIcs({
    workshopId: rsvp.workshop.id,
    title: rsvp.workshop.title,
    description: rsvp.workshop.description ?? '',
    location,
    start: rsvp.workshop.held_at,
  });

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: recipient,
        reply_to: REPLY_TO,
        subject,
        html,
        text,
        attachments: [
          {
            filename: 'gathering.ics',
            content: btoa(ics),
          },
        ],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Resend failed:', errText);
      await logEmail({ rsvp_id: rsvpId, recipient, subject, status: 'failed', error: errText });
      return new Response(
        JSON.stringify({ error: 'resend_failed', detail: errText }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }

    await logEmail({ rsvp_id: rsvpId, recipient, subject, status: 'sent' });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Exception during Resend:', msg);
    await logEmail({ rsvp_id: rsvpId, recipient, subject, status: 'failed', error: msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
});