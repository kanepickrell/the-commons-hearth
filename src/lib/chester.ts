// src/lib/chester.ts
// Client for the `chester` Edge Function. Streams the answer as it's written.
//
// Uses fetch rather than supabase.functions.invoke because invoke buffers the
// whole body; we want text to appear as Claude writes it.

import type { Locale } from '@/lib/types';

export type ChesterMessage = { role: 'user' | 'assistant'; content: string };

export type ChesterUsage = { input: number; cached: number; output: number };

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chester`;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export class ChesterError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

/**
 * Send the conversation (ending in the visitor's newest message) and stream
 * the reply. `onText` fires per chunk; resolves with usage when done.
 */
export async function askChester(
  sessionId: string,
  lang: Locale,
  messages: ChesterMessage[],
  onText: (chunk: string) => void,
  signal?: AbortSignal
): Promise<ChesterUsage | null> {
  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({ session_id: sessionId, lang, messages }),
    signal,
  });

  if (!res.ok) {
    let code = `http_${res.status}`;
    try {
      const j = await res.json();
      if (typeof j?.error === 'string') code = j.error;
    } catch {
      /* not json */
    }
    throw new ChesterError(code);
  }
  if (!res.body) throw new ChesterError('no_body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let usage: ChesterUsage | null = null;

  // SSE: events separated by a blank line, each `data: <json>`.
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const raw = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 2);
      if (!raw.startsWith('data:')) continue;
      const payload = JSON.parse(raw.slice(5).trim()) as {
        text?: string; done?: boolean; usage?: ChesterUsage; error?: string;
      };
      if (payload.error) throw new ChesterError(payload.error);
      if (payload.text) onText(payload.text);
      if (payload.done) usage = payload.usage ?? null;
    }
  }
  return usage;
}

const SESSION_KEY = 'chester-session';
const HISTORY_KEY = 'chester-history';

export function getSessionId(): string {
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function loadHistory(): ChesterMessage[] {
  try {
    const raw = window.sessionStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ChesterMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(msgs: ChesterMessage[]) {
  try {
    window.sessionStorage.setItem(HISTORY_KEY, JSON.stringify(msgs.slice(-40)));
  } catch {
    /* ignore */
  }
}
