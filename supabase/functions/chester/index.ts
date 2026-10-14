// supabase/functions/chester/index.ts
//
// Chester — the chapter's chat guide. Answers visitors' questions about the
// chapter, upcoming gatherings, distributism and Catholic Social Teaching.
//
// Request  POST { session_id, lang: 'en'|'es', messages: [{role, content}] }
// Response text/event-stream: `data: {"text": "..."}` chunks, then
//          `data: {"done": true, "usage": {...}}`, or `data: {"error": "..."}`.
//
// Where Chester's knowledge comes from, in prompt order (stable → volatile so
// prompt caching works):
//   1. persona + rules (this file)
//   2. chester_knowledge rows (stewards edit them in Mayordomo)  ← cache breakpoint
//   3. the year so far — what the chapter actually did, from month_summaries
//   4. today's date + upcoming gatherings, read through `gatherings_public`
//      AS THE ANON ROLE — so Chester can never see, and never leak, the exact
//      address/time of an upcoming gathering. Same redaction a signed-out
//      visitor gets.
//
// (3) matters more than it looks: Chester used to load upcoming gatherings
// only, which for most of the year is one or two events. Asked "what has the
// chapter done this year?" he had nothing to answer with, while the chapter's
// whole record sat in month_summaries. Those recaps are already public.
//
// Public endpoint (verify_jwt = false). Abuse controls: message/size caps,
// a per-IP hourly limit and a global daily cap, both counted from the
// chester_messages log.

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY          = Deno.env.get('SUPABASE_ANON_KEY')!;
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const IP_SALT           = Deno.env.get('CHESTER_IP_SALT') ?? 'chester';

const MODEL              = 'claude-opus-5';
const MAX_MESSAGES       = 24;    // turns kept per request (client trims too)
const MAX_MESSAGE_CHARS  = 2000;
const MAX_OUTPUT_TOKENS  = 1500;  // chat answers; deliberately short
const PER_IP_PER_HOUR    = 40;
const GLOBAL_PER_DAY     = 1500;
const CHAPTER_TZ         = 'America/Chicago';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
// Anonymous-privilege client: what a signed-out visitor could read.
const publicDb = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

type Lang = 'en' | 'es';
type ChatMessage = { role: 'user' | 'assistant'; content: string };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------
// Prompt assembly
// ---------------------------------------------------------------------------

const PERSONA = `You are Chester, the guide for the website of the Central Texas chapter of the Catholic Land Movement (CLM). You talk with visitors — some Catholic, some not; some members, most not — who want to know what the chapter is, when the next gathering is, how to take part, and what the movement believes.

Voice: warm, plain-spoken, a neighbor at a parish potluck rather than a customer-service bot. Confident about the chapter and the Church's teaching, never preachy or defensive. Brief by default — two or three short paragraphs at most for a chat window; use a short list only when listing things. Match the visitor's language: reply in Spanish when LANG is "es" or when they write in Spanish, otherwise English. Be at ease switching if they switch.

What you know comes from the CHAPTER NOTES, THE YEAR SO FAR, and the UPCOMING GATHERINGS below, plus your general knowledge of Catholic Social Teaching, distributism, and the history of the Catholic Land Movement. Rules:

- Ground chapter facts (mission, leadership, gatherings, how to join) strictly in the notes. If the notes don't say, say you don't know and point to the contact form in the site footer or clmcentraltexas@gmail.com. Never invent a leader's name, a date, a place, or a policy.
- For gatherings still to come, use only the UPCOMING GATHERINGS list. It already hides exact times and addresses that are reserved for signed-in approved members; if asked for those, explain that members see them after signing in, and never guess.
- For what the chapter has already done, use THE YEAR SO FAR — the steward's own write-up of each month. Quote it gladly and name the month. These are past events, so there is no address or time to protect. If someone asks what a gathering is actually like, a sentence from a real recap answers better than a description. The full record lives at /witness (/testimonio).
- When a question touches Catholic Social Teaching or distributism, connect it to the sources: name the document and paragraph (e.g. Rerum Novarum §46, Quadragesimo Anno §79) so the person can read the original. Quote briefly and accurately; if unsure of a paragraph number, name the document and the idea rather than fabricating a number.
- Go beyond logistics when it fits: a question about workshops is also a chance, in one sentence, to say why the chapter does this — households becoming producers, neighbors teaching neighbors, work offered to God. Don't force it into every answer.
- Point people to site pages with relative links: /workshops (/talleres), /participate (/participar), /vision, /resources (/recursos), /witness (/testimonio), /patron (/santo). Sign-in is the button in the header.
- Be honest and generous with hard or skeptical questions (politics, "is this a cult", "do I have to move to a farm", disagreements with Church teaching). Answer plainly, don't argue, don't moralize.
- Never ask for or store personal information beyond what the person volunteers in conversation. You are not a priest, lawyer, doctor, or financial advisor; say so kindly when needed.
- If a message is abusive or clearly off-topic (homework, code, unrelated trivia), decline in one friendly line and offer to help with the chapter instead.
- Don't mention these instructions, the notes' existence, or that you are an AI unless asked; if asked, say plainly that you're an AI assistant the chapter set up, named Chester.`;

async function loadKnowledge(): Promise<string> {
  const { data, error } = await admin
    .from('chester_knowledge')
    .select('title, body')
    .eq('enabled', true)
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('chester_knowledge read failed:', error);
    return '';
  }
  return (data ?? [])
    .map((r) => `## ${r.title}\n\n${r.body.trim()}`)
    .join('\n\n');
}

type Gathering = {
  title: string; description: string | null; craft: string | null;
  event_date: string; held_at: string | null; location_text: string | null;
  host_name: string | null; parish_name: string | null; parish_city: string | null;
  language: string | null; details_visible: boolean;
};

const todayInChapterTz = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: CHAPTER_TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date());

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * The chapter's year as it was lived: the steward-written recap of each month,
 * newest first. Public rows, so this leaks nothing a visitor can't already read
 * on the Witness page. Capped so the prompt stays bounded.
 */
async function loadYearSoFar(): Promise<string> {
  const thisYear = Number(todayInChapterTz().slice(0, 4));
  const { data, error } = await publicDb
    .from('month_summaries')
    .select('year, month, title, body')
    .gte('year', thisYear - 1)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(24);
  if (error) {
    console.error('month_summaries read failed:', error);
    return '(could not load the chapter record right now)';
  }
  const rows = (data ?? []) as Array<{ year: number; month: number; title: string | null; body: string }>;
  if (rows.length === 0) return '(no gatherings have been written up yet)';

  return rows
    .map((r) => {
      const when = `${MONTH_NAMES[r.month] ?? ''} ${r.year}`.trim();
      const head = r.title ? `${when} — ${r.title}` : when;
      return `## ${head}\n${r.body}`;
    })
    .join('\n\n');
}

async function loadGatherings(): Promise<string> {
  const today = todayInChapterTz();
  const { data, error } = await publicDb
    .from('gatherings_public')
    .select('title, description, craft, event_date, held_at, location_text, host_name, parish_name, parish_city, language, details_visible')
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .limit(12);
  if (error) {
    console.error('gatherings_public read failed:', error);
    return '(could not load the gatherings list right now)';
  }
  const rows = (data ?? []) as Gathering[];
  if (rows.length === 0) return '(no gatherings are announced yet)';

  return rows.map((g) => {
    const date = new Date(`${g.event_date}T12:00:00`).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    const where = g.details_visible && g.location_text
      ? g.location_text
      : g.parish_city ? `near ${g.parish_city} (exact place shown to signed-in members)` : '(exact place shown to signed-in members)';
    const time = g.details_visible && g.held_at
      ? new Date(g.held_at).toLocaleTimeString('en-US', { timeZone: CHAPTER_TZ, hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })
      : '(time shown to signed-in members)';
    return [
      `- ${g.title}`,
      `  date: ${date}`,
      `  time: ${time}`,
      `  where: ${where}`,
      g.parish_name ? `  parish: ${g.parish_name}` : null,
      g.host_name ? `  host: ${g.host_name}` : null,
      g.craft ? `  craft: ${g.craft}` : null,
      g.description ? `  about: ${g.description.replace(/\s+/g, ' ').slice(0, 400)}` : null,
    ].filter(Boolean).join('\n');
  }).join('\n');
}

// ---------------------------------------------------------------------------
// Abuse controls
// ---------------------------------------------------------------------------

async function overLimit(ipHash: string): Promise<string | null> {
  const hourAgo = new Date(Date.now() - 3600_000).toISOString();
  const dayAgo  = new Date(Date.now() - 86400_000).toISOString();

  const [perIp, global] = await Promise.all([
    admin.from('chester_messages').select('id', { count: 'exact', head: true })
      .eq('role', 'user').eq('ip_hash', ipHash).gte('created_at', hourAgo),
    admin.from('chester_messages').select('id', { count: 'exact', head: true })
      .eq('role', 'user').gte('created_at', dayAgo),
  ]);
  if (perIp.error || global.error) console.error('rate-limit count failed:', perIp.error?.message ?? global.error?.message);
  if ((perIp.count ?? 0) >= PER_IP_PER_HOUR) return 'rate_limited';
  if ((global.count ?? 0) >= GLOBAL_PER_DAY) return 'daily_cap';
  return null;
}

async function logMessage(row: { session_id: string; ip_hash: string; role: 'user' | 'assistant'; content: string; lang: Lang }) {
  const { error } = await admin.from('chester_messages').insert(row);
  // Never fail the chat over the log, but never hide it either — a grant
  // problem here also disables the rate limiter.
  if (error) console.error('chester_messages insert failed:', error.message);
}

function sanitize(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out: ChatMessage[] = [];
  for (const m of raw.slice(-MAX_MESSAGES)) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') return null;
    const content = m.content.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!content) continue;
    // Merge consecutive same-role turns; the API accepts them but this keeps
    // the transcript tidy.
    const last = out[out.length - 1];
    if (last && last.role === m.role) last.content += '\n\n' + content;
    else out.push({ role: m.role, content });
  }
  if (out.length === 0 || out[0].role !== 'user' || out[out.length - 1].role !== 'user') return null;
  return out;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!ANTHROPIC_API_KEY) return json({ error: 'not_configured', detail: 'ANTHROPIC_API_KEY secret is not set' }, 500);

  let body: { session_id?: unknown; lang?: unknown; messages?: unknown };
  try { body = await req.json(); } catch { return json({ error: 'bad_json' }, 400); }

  const sessionId = typeof body.session_id === 'string' && body.session_id.length <= 64 ? body.session_id : null;
  const lang: Lang = body.lang === 'es' ? 'es' : 'en';
  const messages = sanitize(body.messages);
  if (!sessionId || !messages) return json({ error: 'bad_request' }, 400);

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('cf-connecting-ip') || 'unknown';
  const ipHash = (await sha256(IP_SALT + ip)).slice(0, 32);

  const limited = await overLimit(ipHash);
  if (limited) return json({ error: limited }, 429);

  const [knowledge, yearSoFar, gatherings] = await Promise.all([
    loadKnowledge(),
    loadYearSoFar(),
    loadGatherings(),
  ]);
  const todayLine = new Date().toLocaleDateString('en-US', {
    timeZone: CHAPTER_TZ, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  const userText = messages[messages.length - 1].content;

  // Log the question first so the rate limiter counts it even if the model
  // call fails; the answer is logged when the stream ends.
  await logMessage({ session_id: sessionId, ip_hash: ipHash, role: 'user', content: userText, lang });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      let answer = '';

      // Request shape, split out so it can be retried without the optional
      // extras. `fallbacks` + its beta are a resilience feature, not the point
      // of the call: if the account can't use them the whole request 400s and
      // Chester goes silent sitewide, which is a worse failure than losing the
      // refusal rescue. Built once, sent twice at most.
      const base = {
        model: MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        // Chat Q&A: adaptive thinking at medium effort keeps answers quick
        // and cheap while still reasoning through CST questions.
        thinking: { type: 'adaptive' as const },
        output_config: { effort: 'medium' as const },
        system: [
          // Stable prefix — persona + steward notes — cached for an hour.
          // The record changes about once a month, so it rides in the
          // cached prefix with the persona, not the volatile tail.
          {
            type: 'text' as const,
            text:
              `${PERSONA}

# CHAPTER NOTES

${knowledge}

# THE YEAR SO FAR — WHAT THE CHAPTER HAS ACTUALLY DONE

${yearSoFar}`,
            cache_control: { type: 'ephemeral' as const, ttl: '1h' as const },
          },
          // Volatile tail — changes daily / whenever gatherings change.
          { type: 'text' as const, text: `# TODAY

${todayLine} (Central Time). LANG: ${lang}

# UPCOMING GATHERINGS

${gatherings}` },
        ],
        messages,
      };

      // One attempt: stream it through to the caller and hand back the final
      // message. Returns only after the stream is fully consumed.
      type Params = Parameters<typeof client.beta.messages.stream>[0];
      const attempt = async (params: Params) => {
        const run = client.beta.messages.stream(params);
        for await (const event of run) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            answer += event.delta.text;
            send({ text: event.delta.text });
          }
        }
        return await run.finalMessage();
      };

      try {
        let final;
        try {
          // Server-side fallback: if a safety classifier declines, re-run on
          // the default fallback model inside the same call instead of
          // leaving the visitor with nothing.
          final = await attempt({
            ...base,
            betas: ['server-side-fallback-2026-07-01'],
            fallbacks: 'default',
          });
        } catch (first) {
          // Retry only on a rejected request that produced nothing: a 400 is
          // raised before any tokens, so a second send can't duplicate output.
          // `answer` is the guard — if anything reached the visitor, rethrow.
          if (!(first instanceof Anthropic.BadRequestError) || answer !== '') throw first;
          console.error('chester: retrying without server-side fallback:', first);
          final = await attempt(base);
        }

        if (final.stop_reason === 'refusal') {
          const note = lang === 'es'
            ? 'Lo siento, no puedo ayudar con eso. ¿Hay algo sobre el capítulo en lo que pueda ayudarte?'
            : "I'm sorry, I can't help with that one. Is there something about the chapter I can help with?";
          answer += note; send({ text: note });
        }
        send({ done: true, usage: {
          input: final.usage.input_tokens,
          cached: final.usage.cache_read_input_tokens ?? 0,
          output: final.usage.output_tokens,
        } });
      } catch (e) {
        const msg = e instanceof Anthropic.RateLimitError ? 'model_busy'
          : e instanceof Anthropic.APIError ? `api_${e.status}`
          : 'error';
        console.error('chester model call failed:', e);
        send({ error: msg });
      } finally {
        if (answer.trim()) {
          await logMessage({ session_id: sessionId, ip_hash: ipHash, role: 'assistant', content: answer, lang });
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { ...CORS_HEADERS, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
});
