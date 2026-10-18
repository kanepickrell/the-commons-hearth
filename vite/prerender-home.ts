// vite/prerender-home.ts
// Writes a static copy of the homepage's opening into index.html at build
// time, so the page says something before any JavaScript runs.
//
// Why this exists: the site is a Vite SPA. `index.html` shipped an empty
// <div id="root">, which means a search engine that doesn't execute
// JavaScript, a link unfurler, and any agent that fetches the URL all saw a
// blank document. The og: tags carried the only prose on the page.
//
// How it works: the markup goes INSIDE #root. React 18's createRoot() clears
// whatever it finds in its container before the first render, so the shell is
// the pre-hydration paint and then it's gone — there is no hydration contract
// to honour and no mismatch to warn about. It also means the homepage now
// paints its own heading immediately instead of a blank cream page.
//
// The words come from src/content/home.ts, the same module Home.tsx renders,
// so the two can't drift. Styling is inline rather than Tailwind: these class
// names would only ever appear in this file, which Tailwind's content globs
// don't scan, and a purged class would leave the flash unstyled.
//
// `apply: 'build'` keeps the shell out of the dev server, where index.html is
// served for every route and a flash of homepage copy on /vision would be
// noise. In production index.html is served for every route too — a non-JS
// crawler reading /vision gets the homepage's words. That is the known cost
// of a single-document SPA, and strictly more than the nothing it got before.
// Per-route prerendering needs real SSR (the app renders Leaflet, Supabase
// and localStorage on mount) or a second shell-free HTML entry routed by
// vercel.json; both are bigger changes than this one.

import type { Plugin } from 'vite';
import { homeCopy, pillars } from '../src/content/home';

const MARKER = '<!--prerender-home-->';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Inline styles chosen to echo the real hero closely enough that the swap to
// the React tree isn't a visible jump: cream page, mesquite ink, ocre heading.
const PAGE = 'max-width:680px;margin:0 auto;padding:4rem 1.5rem;font-family:Georgia,serif;color:#3E4F2F;';
const H1 = 'font-size:2rem;line-height:1.2;font-weight:500;color:#C68B3E;text-align:center;margin:0;';
const TAGLINE = 'text-align:center;font-style:italic;color:#4A5568;margin:1.25rem auto 0;max-width:34rem;';
const BODY = 'line-height:1.65;margin:2rem auto 0;max-width:34rem;';
const H2 = 'font-size:1.5rem;font-weight:500;margin:3rem 0 0;text-align:center;';
const LINKS = 'text-align:center;margin:2.5rem 0 0;';
const LINK = 'color:#3E4F2F;margin:0 0.75rem;';

/** The homepage's opening, as plain HTML. English: the document is lang="en". */
const shell = () => {
  const mission = pillars
    .map((p) => `<li style="margin:0 0 .75rem"><strong>${esc(p.name.en)}</strong> — ${esc(p.body.en)}</li>`)
    .join('');

  const roots = homeCopy.rootsLines
    .map((l) => `<li style="margin:0 0 .5rem"><strong>${esc(l.year)}</strong> — ${esc(l.text.en)}</li>`)
    .join('');

  return `<div style="${PAGE}">
<h1 style="${H1}">${esc(homeCopy.heading.en)}</h1>
<p style="${TAGLINE}">${esc(homeCopy.tagline.en)}</p>
<p style="${BODY}">${esc(homeCopy.lede.en)}</p>
<p style="${LINKS}"><a style="${LINK}" href="/workshops">${esc(homeCopy.ctaGathering.en)}</a><a style="${LINK}" href="/participate">${esc(homeCopy.ctaJoin.en)}</a></p>
<h2 style="${H2}">Why it matters</h2>
<p style="${BODY}">${esc(homeCopy.why.en)}</p>
<h2 style="${H2}">${esc(homeCopy.approachHeading.en)}</h2>
<p style="${BODY}">${esc(homeCopy.approach.en)}</p>
<h2 style="${H2}">Our Roots</h2>
<p style="${BODY}">${esc(homeCopy.roots.en)}</p>
<ul style="${BODY}list-style:none;padding:0">${roots}</ul>
<h2 style="${H2}">Our Mission</h2>
<ul style="${BODY}list-style:none;padding:0">${mission}</ul>
</div>`;
};

export const prerenderHome = (): Plugin => ({
  name: 'clm-prerender-home',
  apply: 'build',
  transformIndexHtml(html) {
    // Fail the build rather than ship the empty document this plugin exists
    // to prevent. If the marker is gone, someone edited index.html and the
    // prerender would otherwise go quietly missing.
    if (!html.includes(MARKER)) {
      throw new Error(
        `prerender-home: ${MARKER} is missing from index.html — put it back inside <div id="root">, or remove this plugin from vite.config.ts.`
      );
    }
    return html.replace(MARKER, shell());
  },
});
