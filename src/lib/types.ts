// Domain types for CLM Central Texas Commons.
// Bilingual strings carry both languages on the data — the UI picks at render.

export type Bilingual = { en: string; es: string };

export type IconSlug =
  | 'las-abejas'
  | 'la-gallina'
  | 'el-pan'
  | 'la-conserva'
  | 'la-cisterna'
  | 'la-azuela'
  | 'el-telar'
  | 'las-yerbas';

export type Member = {
  id: string;
  name: string;
  parish: string;
  parishLatLon: [number, number];
  offering: Bilingual;
  workingOn: Bilingual;
  wantsToLearn: Bilingual;
  iconSlug: IconSlug;
};

export type Workshop = {
  id: string;
  hostId: string;
  title: Bilingual;
  description: Bilingual;
  date: string;
  locationName: string;
  locationLatLon: [number, number];
  iconSlug: IconSlug;
  rsvpCount: number;
};

/**
 * A concrete, countable output of a gathering. The count is the number;
 * the unit is bilingual prose like "jars of jelly" / "frascos de jalea".
 * Both `fruit.count` and the `count` value referenced in prose should
 * agree — the Year Wheel will render the number on the rim.
 */
export type Fruit = {
  count: number;
  unit: Bilingual;
};

/**
 * A skill-replication edge: person B learned this skill from person A at
 * an earlier witness post, and taught it onward here. Presence of this
 * field on a post means "this gathering replicated a skill" — the single
 * most important event for a distributist chapter to record.
 */
export type Replicated = {
  fromMemberId: string;
  toMemberId: string;
  skill: Bilingual;
  learnedAtPostId: string;
};

export type WitnessPost = {
  id: string;
  workshopId: string;
  hostId: string;
  date: string;
  body: Bilingual;
  photoUrl?: string;
  iconSlug: IconSlug;
  fruit: Fruit;
  replicated?: Replicated;
  planned?: boolean;
};

export type Locale = 'en' | 'es';
