// src/lib/chesterAsk.ts
// One way for any page to hand Chester a question.
//
// The Witness page's figures were always meant to be interrogable — the
// prompts have been sitting in uiStrings.witness since the page was written
// ("Show me all the gatherings in", "Which members hosted in") and MonthPanel
// has threaded `onAskMetric`/`onAskAboutPost` through the whole time. The only
// missing piece was a way to reach the widget: ChesterWidget owns its open
// state locally and sits outside every page in Layout.
//
// A DOM event rather than a context provider, deliberately: the widget is
// mounted once in Layout, the callers are leaves far below it, and nothing
// needs to read the state back. A provider would mean threading a context
// through the whole tree to deliver one fire-and-forget message.

const EVENT = 'chester:ask';

/** Open Chester and ask this question. No-ops during SSR or in tests without a DOM. */
export const askChesterAbout = (question: string) => {
  const q = question.trim();
  if (!q || typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: q }));
};

/** Subscribe to questions sent by `askChesterAbout`. Returns an unsubscribe fn. */
export const onChesterAsk = (handler: (question: string) => void): (() => void) => {
  const listener = (e: Event) => {
    const detail = (e as CustomEvent<string>).detail;
    if (typeof detail === 'string' && detail) handler(detail);
  };
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
};
