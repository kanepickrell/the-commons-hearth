// Domain types for CLM Central Texas Commons.
// Bilingual strings carry both languages on the data — the UI picks at render.

export type Bilingual = { en: string; es: string };

export type IconSlug =
  | 'la-milpa'
  | 'las-abejas'
  | 'la-gallina'
  | 'el-pan'
  | 'la-conserva'
  | 'la-cisterna'
  | 'la-azuela'
  | 'el-telar'
  | 'el-jabon'
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

export type WitnessPost = {
  id: string;
  workshopId: string;
  hostId: string;
  date: string;
  body: Bilingual;
  photoUrl?: string;
  iconSlug: IconSlug;
};

export type Locale = 'en' | 'es';
