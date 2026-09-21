// src/components/chester/ChesterWidget.tsx
// Chester, the chapter's chat guide. A small launcher in the bottom-right of
// every page opens a panel where visitors can ask about gatherings, the
// mission, and the movement's roots in Catholic Social Teaching. Answers
// stream from the `chester` Edge Function (see lib/chester.ts).
//
// Conversation lives in sessionStorage — it survives page navigation within
// the tab and is gone when the tab closes.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useLocation } from 'react-router-dom';
import {
  askChester, ChesterError, getSessionId, loadHistory, saveHistory,
  type ChesterMessage,
} from '@/lib/chester';

const STARTERS = {
  en: [
    'When is the next gathering?',
    'What is the Catholic Land Movement?',
    'How do I join the chapter?',
    'What does Rerum Novarum say about owning land?',
  ],
  es: [
    '¿Cuándo es la próxima reunión?',
    '¿Qué es el Movimiento Católico de la Tierra?',
    '¿Cómo me uno al capítulo?',
    '¿Qué dice Rerum Novarum sobre la propiedad de la tierra?',
  ],
};

const ERRORS: Record<string, { en: string; es: string }> = {
  rate_limited: {
    en: 'You’ve sent a lot of messages this hour — give it a little while and try again.',
    es: 'Has enviado muchos mensajes esta hora — espera un poco e inténtalo de nuevo.',
  },
  daily_cap: {
    en: 'Chester has reached his limit for today. The contact form in the footer still works!',
    es: 'Chester llegó a su límite por hoy. ¡El formulario de contacto al pie de página sigue funcionando!',
  },
  not_configured: {
    en: 'Chester isn’t set up yet. Please use the contact form in the footer.',
    es: 'Chester aún no está configurado. Usa el formulario de contacto al pie de página.',
  },
  default: {
    en: 'Something went wrong on my end. Try again in a moment.',
    es: 'Algo salió mal de mi lado. Inténtalo de nuevo en un momento.',
  },
};

// Turn the few things Chester writes as markdown (relative links, bold,
// bullets) into elements. Deliberately tiny — no library, no HTML injection.
function renderText(text: string) {
  return text.split('\n').map((line, i) => {
    const bullet = /^\s*[-•]\s+/.test(line);
    const content = bullet ? line.replace(/^\s*[-•]\s+/, '') : line;
    const parts = content.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\/[a-z][a-z-]*(?:\/[\w-]+)?)/g);
    const nodes = parts.map((p, j) => {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(p);
      if (link) return <a key={j} href={link[2]} className="text-ocre underline">{link[1]}</a>;
      const bold = /^\*\*([^*]+)\*\*$/.exec(p);
      if (bold) return <strong key={j}>{bold[1]}</strong>;
      if (/^\/[a-z][a-z-]*(?:\/[\w-]+)?$/.test(p)) return <a key={j} href={p} className="text-ocre underline">{p}</a>;
      return p;
    });
    return bullet
      ? <li key={i} className="ml-4 list-disc">{nodes}</li>
      : <p key={i} className={line.trim() ? '' : 'h-2'}>{nodes}</p>;
  });
}

export const ChesterWidget = () => {
  const { locale, t } = useLocale();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChesterMessage[]>(() => loadHistory());
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Keep the admin page uncluttered.
  const hidden = pathname.startsWith('/stewardship') || pathname.startsWith('/mayordomo');

  useEffect(() => { saveHistory(messages); }, [messages]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setError(null);
    setInput('');
    const next: ChesterMessage[] = [...messages, { role: 'user', content: q }];
    setMessages([...next, { role: 'assistant', content: '' }]);
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await askChester(getSessionId(), locale, next, (chunk) => {
        setMessages((cur) => {
          const copy = cur.slice();
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { role: 'assistant', content: last.content + chunk };
          return copy;
        });
      }, controller.signal);
    } catch (e) {
      const code = e instanceof ChesterError ? e.code : 'default';
      setError(t(ERRORS[code] ?? ERRORS.default));
      // Drop the empty assistant bubble.
      setMessages((cur) => (cur[cur.length - 1]?.content === '' ? cur.slice(0, -1) : cur));
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }, [busy, messages, locale, t]);

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
  };

  if (hidden) return null;

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? t({ en: 'Close Chester', es: 'Cerrar Chester' }) : t({ en: 'Ask Chester', es: 'Pregúntale a Chester' })}
        className="fixed bottom-5 right-5 z-[90] flex items-center gap-2 rounded-full border border-mesquite/30 bg-cal px-4 py-2.5 font-heading text-sm text-mesquite shadow-lg transition hover:border-ocre hover:text-ocre"
      >
        <ChesterMark className="h-5 w-5" />
        <span>{open ? t({ en: 'Close', es: 'Cerrar' }) : t({ en: 'Ask Chester', es: 'Pregúntale a Chester' })}</span>
      </button>

      {open && (
        <section
          role="dialog"
          aria-label="Chester"
          className="fixed bottom-20 right-5 z-[90] flex h-[min(70vh,560px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-lg border border-mesquite/20 bg-cal shadow-xl"
        >
          <header className="flex items-center justify-between border-b border-mesquite/10 bg-cal/80 px-4 py-3">
            <div className="flex items-center gap-2">
              <ChesterMark className="h-6 w-6 text-mesquite" />
              <div>
                <p className="font-heading text-base leading-none text-mesquite">Chester</p>
                <p className="mt-0.5 font-serif text-[11px] italic text-mesquite/60">
                  {t({ en: 'The chapter’s guide', es: 'El guía del capítulo' })}
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={reset}
                className="font-serif text-xs italic text-mesquite/50 transition hover:text-mesquite"
              >
                {t({ en: 'start over', es: 'empezar de nuevo' })}
              </button>
            )}
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div>
                <p className="font-serif text-sm leading-relaxed text-mesquite">
                  {t({
                    en: 'Hello — I’m Chester. Ask me about the next gathering, how the chapter works, or what the Church teaches about land, work, and the family.',
                    es: 'Hola — soy Chester. Pregúntame sobre la próxima reunión, cómo funciona el capítulo, o lo que enseña la Iglesia sobre la tierra, el trabajo y la familia.',
                  })}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {STARTERS[locale].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-sm border border-mesquite/15 bg-cal/60 px-3 py-2 text-left font-serif text-sm text-mesquite/80 transition hover:border-ocre hover:text-mesquite"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[85%] rounded-lg rounded-br-sm bg-ocre/15 px-3 py-2 font-serif text-sm text-mesquite'
                      : 'max-w-[92%] space-y-1.5 rounded-lg rounded-bl-sm border border-mesquite/10 bg-cal/70 px-3 py-2 font-serif text-sm leading-relaxed text-mesquite'
                  }
                >
                  {m.role === 'assistant' && m.content === '' ? (
                    <span className="inline-block animate-pulse text-mesquite/50">…</span>
                  ) : m.role === 'assistant' ? (
                    renderText(m.content)
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}

            {error && (
              <p className="rounded-sm border border-rojo/30 bg-rojo/5 px-3 py-2 font-serif text-xs text-rojo">{error}</p>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-end gap-2 border-t border-mesquite/10 px-3 py-3"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 2000))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
              }}
              rows={1}
              placeholder={t({ en: 'Ask a question…', es: 'Haz una pregunta…' })}
              className="max-h-28 flex-1 resize-none rounded-sm border border-mesquite/20 bg-cal/50 px-3 py-2 font-serif text-sm text-mesquite focus:border-mesquite focus:bg-cal focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded-sm bg-ocre px-3 py-2 font-heading text-sm text-cal transition hover:bg-mesquite disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? '…' : t({ en: 'Send', es: 'Enviar' })}
            </button>
          </form>

          <p className="border-t border-mesquite/10 px-4 py-1.5 font-serif text-[10px] italic text-mesquite/45">
            {t({
              en: 'Chester is an AI guide and can make mistakes. For anything important, use the contact form.',
              es: 'Chester es un guía de IA y puede equivocarse. Para algo importante, usa el formulario de contacto.',
            })}
          </p>
        </section>
      )}
    </>
  );
};

// A sprouting seed — small, line-art, inherits currentColor like the craft icons.
const ChesterMark = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 21v-8" />
    <path d="M12 13c0-3.5 2.5-6 6-6-0 3.5-2.5 6-6 6z" />
    <path d="M12 13c0-3.5-2.5-6-6-6 0 3.5 2.5 6 6 6z" />
    <path d="M6 21h12" />
  </svg>
);
