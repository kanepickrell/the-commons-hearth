import { describe, it, expect, vi, afterEach } from 'vitest';

vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');

import { askChester, ChesterError } from '@/lib/chester';

const sse = (events: unknown[]) => {
  const enc = new TextEncoder();
  // Split one event across two chunks to prove buffering works.
  const text = events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('');
  const cut = Math.floor(text.length / 2);
  return new ReadableStream<Uint8Array>({
    start(c) { c.enqueue(enc.encode(text.slice(0, cut))); c.enqueue(enc.encode(text.slice(cut))); c.close(); },
  });
};

afterEach(() => vi.unstubAllGlobals());

describe('askChester', () => {
  it('streams text chunks and returns usage', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(sse([
      { text: 'Hello ' }, { text: 'neighbor.' }, { done: true, usage: { input: 10, cached: 8, output: 3 } },
    ]), { status: 200 })));
    const chunks: string[] = [];
    const usage = await askChester('s1', 'en', [{ role: 'user', content: 'hi' }], (t) => chunks.push(t));
    expect(chunks.join('')).toBe('Hello neighbor.');
    expect(usage).toEqual({ input: 10, cached: 8, output: 3 });
    const [, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toMatchObject({ session_id: 's1', lang: 'en' });
  });

  it('surfaces HTTP error codes from the function body', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'rate_limited' }), { status: 429 })));
    await expect(askChester('s1', 'es', [{ role: 'user', content: 'hola' }], () => {}))
      .rejects.toMatchObject({ code: 'rate_limited' });
  });

  it('surfaces in-stream errors', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(sse([{ text: 'partial' }, { error: 'model_busy' }]), { status: 200 })));
    const err = await askChester('s1', 'en', [{ role: 'user', content: 'hi' }], () => {}).catch((e) => e);
    expect(err).toBeInstanceOf(ChesterError);
    expect(err.code).toBe('model_busy');
  });
});
