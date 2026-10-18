// src/content/history.ts
// Where the Catholic Land Movement came from, in documents.
//
// This is the long version. The homepage carries four dated lines under "Our
// Roots" and sends anyone who wants more here; /vision carries the 2025
// letter alone. Depth lives on one page so the short pages stay short.
//
// Two rules this file keeps:
//
//   1. Every `quote` is verbatim from the linked source. Nothing here is
//      paraphrased inside quotation marks. Where a quote could not be
//      verified against the document itself, there is no quote.
//   2. `kind` is honest about what the link is. 'document' means the link
//      goes to the thing itself — the encyclical, the journal, the letter.
//      'context' means it goes to something ABOUT the thing, because the
//      thing isn't freely readable online. McNabb's book is the case that
//      forced the distinction; without it the page would imply a primary
//      source it can't actually hand over.
//
// Pius XII (1946), Mater et Magistra (1961) and Laudato Si' (2015) are
// teaching the work rests on, not blessings of the movement — each was
// addressed elsewhere, and the copy says so rather than letting proximity
// to 1933 and 2025 imply otherwise.

import { VATICAN_LETTER } from '../lib/links';
import type { Bilingual } from '../lib/types';

export type HistoryMoment = {
  key: string;
  year: string;
  /** What happened, in four or five words. */
  title: Bilingual;
  /** The citation: who, where, when. */
  source: Bilingual;
  /** Verbatim from the source. Omitted rather than guessed. */
  quote?: string;
  /** Why it belongs in this chapter's story. */
  why: Bilingual;
  href: string;
  linkLabel: Bilingual;
  kind: 'document' | 'context';
  image?: { src: string; alt: Bilingual };
};

export const history: HistoryMoment[] = [
  {
    key: 'rerum-novarum-1891',
    year: '1891',
    title: { en: 'The call to ownership', es: 'El llamado a la propiedad' },
    source: { en: 'Leo XIII, Rerum Novarum, §46', es: 'León XIII, Rerum Novarum, §46' },
    quote:
      'The law, therefore, should favor ownership, and its policy should be to induce as many as possible of the people to become owners.',
    why: {
      en: 'The sentence the whole movement grew out of. Not charity for the poor but property in their hands — the conviction that a family with something of its own to work is the ground of a just society.',
      es: 'La frase de la que creció todo el movimiento. No caridad para los pobres, sino propiedad en sus manos: la convicción de que una familia con algo propio que trabajar es el cimiento de una sociedad justa.',
    },
    href: 'https://www.vatican.va/content/leo-xiii/en/encyclicals/documents/hf_l-xiii_enc_15051891_rerum-novarum.html',
    linkLabel: { en: 'Rerum Novarum', es: 'Rerum Novarum' },
    kind: 'document',
  },
  {
    key: 'mcnabb-1925',
    year: '1925',
    title: { en: 'The movement finds its voice', es: 'El movimiento encuentra su voz' },
    source: {
      en: 'Fr. Vincent McNabb OP, The Church and the Land',
      es: 'P. Vincent McNabb OP, The Church and the Land',
    },
    why: {
      en: 'An English Dominican preached that the Church’s social teaching could not be lived in the industrial city alone, and that Catholics would have to go back to the land to live it. His book gave the associations their argument four years before the first one was founded.',
      es: 'Un dominico inglés predicó que la doctrina social de la Iglesia no podía vivirse sólo en la ciudad industrial, y que los católicos tendrían que volver a la tierra para vivirla. Su libro dio a las asociaciones su argumento cuatro años antes de que se fundara la primera.',
    },
    href: 'https://en.wikipedia.org/wiki/Vincent_McNabb',
    linkLabel: { en: 'Who Vincent McNabb was', es: 'Quién fue Vincent McNabb' },
    // The book is in print but not freely readable online, so this link is
    // about the man rather than the work. Saying so is the point of `kind`.
    kind: 'context',
  },
  {
    key: 'glasgow-1929',
    year: '1929',
    title: { en: 'The first association', es: 'La primera asociación' },
    source: {
      en: 'Glasgow, Scotland — the Scottish Catholic Land Association',
      es: 'Glasgow, Escocia — la Asociación Católica Escocesa de la Tierra',
    },
    why: {
      en: 'Catholics in Glasgow formed the first Catholic Land Association, to buy land, train townsmen to farm it, and help families settle on it. Associations followed in the North, the Midlands and the South of England, and a training farm opened in 1931.',
      es: 'Unos católicos en Glasgow formaron la primera Asociación Católica de la Tierra, para comprar tierra, enseñar a los habitantes de la ciudad a trabajarla, y ayudar a las familias a asentarse en ella. Siguieron asociaciones en el norte, el centro y el sur de Inglaterra, y en 1931 abrió una granja-escuela.',
    },
    href: 'https://collected.jcu.edu/the_cross_and_the_plough/',
    linkLabel: { en: 'The movement’s own journal', es: 'La revista del propio movimiento' },
    kind: 'context',
  },
  {
    key: 'pacelli-1933',
    year: '1933',
    title: { en: 'The blessing given', es: 'La bendición concedida' },
    source: {
      en: 'Cardinal Pacelli, Secretary of State, 1 July 1933 — printed in The Cross and the Plough, Vol. 2 No. 4 (1936)',
      es: 'El cardenal Pacelli, Secretario de Estado, 1 de julio de 1933 — publicado en The Cross and the Plough, vol. 2 núm. 4 (1936)',
    },
    quote: 'imparts his Apostolic Blessing to all who are engaged in helping',
    why: {
      en: 'Writing for Pius XI, the future Pius XII blessed the five Catholic Land Associations of Great Britain and prayed that their work of restoring country life be blessed by God. The same issue lists the Archbishops of Westminster, Liverpool and Birmingham as presidents and patron of those associations: the bishops were not bystanders to this work.',
      es: 'Escribiendo en nombre de Pío XI, el futuro Pío XII bendijo a las cinco Asociaciones Católicas de la Tierra de Gran Bretaña y pidió a Dios que bendijera su labor de restaurar la vida del campo. El mismo número nombra a los arzobispos de Westminster, Liverpool y Birmingham como presidentes y patrono de esas asociaciones: los obispos no fueron espectadores de esta obra.',
    },
    href: 'https://collected.jcu.edu/the_cross_and_the_plough/1/',
    linkLabel: { en: 'The Cross and the Plough, 1936', es: 'The Cross and the Plough, 1936' },
    kind: 'document',
  },
  {
    key: 'blackfriars-1936',
    year: '1936',
    title: { en: 'The approval affirmed', es: 'La aprobación confirmada' },
    source: {
      en: 'Editorial, Blackfriars, Vol. 17 No. 194, May 1936',
      es: 'Editorial, Blackfriars, vol. 17 núm. 194, mayo de 1936',
    },
    quote: 'the Holy Father’s approval of the work of the Land Movement',
    why: {
      en: 'A Dominican journal records that approval independently. It also notes the Archbishop of Westminster’s clarification that the bishops’ decision that year implied no disapproval of the movement — only that an appeal for money was inexpedient.',
      es: 'Una revista dominica registra esa aprobación de forma independiente. También recoge la aclaración del arzobispo de Westminster: la decisión de los obispos aquel año no implicaba desaprobación del movimiento, sino sólo que una colecta de fondos era inoportuna.',
    },
    href: 'https://www.cambridge.org/core/journals/blackfriars/article/editorial/0138EA20F62FE2A774DE6132472C1021',
    linkLabel: { en: 'Blackfriars, May 1936', es: 'Blackfriars, mayo de 1936' },
    kind: 'document',
  },
  {
    key: 'pius-xii-1946',
    year: '1946',
    title: { en: 'The teaching beneath it', es: 'La enseñanza que lo sostiene' },
    source: {
      en: 'Pius XII, to the National Confederation of Farm Owner-Operators, 15 November 1946',
      es: 'Pío XII, a la Confederación Nacional de Cultivadores Directos, 15 de noviembre de 1946',
    },
    quote: 'a class of farmers socially sound and religiously firm',
    why: {
      en: 'Not a blessing on the Land Movement — this was addressed to an Italian farmers’ confederation — but the teaching the movement rests on: that the moral recovery of a whole people depends on a farming class sound in society and firm in faith.',
      es: 'No es una bendición al Movimiento de la Tierra — fue dirigida a una confederación de agricultores italianos — sino la enseñanza en que el movimiento se apoya: que la recuperación moral de todo un pueblo depende de una clase campesina sana en lo social y firme en la fe.',
    },
    href: 'https://www.ewtn.com/catholicism/library/pope-speaks-on-rural-life-9050',
    linkLabel: { en: 'The Pope Speaks on Rural Life', es: 'El Papa habla de la vida rural' },
    kind: 'document',
  },
  {
    key: 'mater-et-magistra-1961',
    year: '1961',
    title: { en: 'The family farm named', es: 'La granja familiar, nombrada' },
    source: { en: 'John XXIII, Mater et Magistra, §142', es: 'Juan XXIII, Mater et Magistra, §142' },
    quote: 'We are bound above all to consider as an ideal the kind of farm which is owned and managed by the family.',
    why: {
      en: 'Seventy years after Rerum Novarum, the Church names the thing itself: not merely property, but the family farm, held and worked by the household that lives on it. Addressed to the whole Church rather than to the movement — and all the stronger for it.',
      es: 'Setenta años después de Rerum Novarum, la Iglesia nombra la cosa misma: no sólo la propiedad, sino la granja familiar, poseída y trabajada por el hogar que vive en ella. Dirigida a toda la Iglesia y no al movimiento — y por eso más fuerte aún.',
    },
    href: 'https://www.vatican.va/content/john-xxiii/en/encyclicals/documents/hf_j-xxiii_enc_15051961_mater.html',
    linkLabel: { en: 'Mater et Magistra', es: 'Mater et Magistra' },
    kind: 'document',
  },
  {
    key: 'laudato-si-2015',
    year: '2015',
    title: { en: 'The small holding defended', es: 'La pequeña parcela, defendida' },
    source: { en: 'Francis, Laudato Si’, §129', es: 'Francisco, Laudato Si’, §129' },
    quote: 'small-scale food production systems which feed the greater part of the world’s peoples',
    why: {
      en: 'The same argument in the language of our own century: that the small holding is not a relic to be consolidated away but the thing most of the world is actually fed by, and worth defending on those grounds.',
      es: 'El mismo argumento en el lenguaje de nuestro siglo: que la pequeña parcela no es una reliquia que haya que absorber, sino aquello con lo que de hecho se alimenta la mayor parte del mundo, y que vale la pena defender por esa razón.',
    },
    href: 'https://www.vatican.va/content/francesco/en/encyclicals/documents/papa-francesco_20150524_enciclica-laudato-si.html',
    linkLabel: { en: 'Laudato Si’', es: 'Laudato Si’' },
    kind: 'document',
  },
  {
    key: 'leo-xiv-2025',
    year: '2025',
    title: { en: 'The same blessing, renewed', es: 'La misma bendición, renovada' },
    source: {
      en: 'The Holy See, Secretariat of State, 18 November 2025',
      es: 'La Santa Sede, Secretaría de Estado, 18 de noviembre de 2025',
    },
    quote: 'Pope Leo XIV extends that same blessing to the members of the Catholic Land Movement',
    why: {
      en: 'Recalling the Apostolic Blessing granted by Pius XI in 1933, Pope Leo XIV extends it to those who carry the same apostolic work forward in our time. That is the line this chapter stands in.',
      es: 'Recordando la Bendición Apostólica concedida por Pío XI en 1933, el Papa León XIV la extiende a quienes llevan adelante la misma obra apostólica en nuestro tiempo. Esa es la línea en la que está este capítulo.',
    },
    href: VATICAN_LETTER,
    linkLabel: { en: 'Open the letter', es: 'Abre la carta' },
    kind: 'document',
    image: {
      src: VATICAN_LETTER,
      alt: {
        en: 'Letter from the Secretariat of State of the Holy See, dated 18 November 2025, conveying Pope Leo XIV’s Apostolic Blessing to the Catholic Land Movement.',
        es: 'Carta de la Secretaría de Estado de la Santa Sede, fechada el 18 de noviembre de 2025, que transmite la Bendición Apostólica del Papa León XIV al Movimiento Católico de la Tierra.',
      },
    },
  },
];

/** The single entry /vision shows: the blessing that names us today. */
export const currentBlessing = history[history.length - 1];
