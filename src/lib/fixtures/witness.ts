import type { WitnessPost } from '@/lib/types';

// NOTE: workshopIds reference past workshops not present in the workshops
// fixture (the workshops array holds upcoming gatherings only). Witness
// posts are rendered as standalone entries in the demo. Past workshops can
// be seeded later if a click-through is wanted.

export const witnessPosts: WitnessPost[] = [
  {
    id: 'wt-001',
    workshopId: 'wk-past-001',
    hostId: 'm-005', // Rebecca
    iconSlug: 'la-conserva',
    date: '2026-03-28T00:00:00-05:00',
    body: {
      en: 'Four of us put up 32 quarts of jelly at the Halloran kitchen Saturday — mustang grape and wild plum.',
      es: 'Cuatro de nosotras enlatamos 32 cuartos de jalea en la cocina de los Halloran el sábado — de uva mustang y ciruela silvestre.',
    },
  },
  {
    id: 'wt-002',
    workshopId: 'wk-past-002',
    hostId: 'm-007', // Daniel
    iconSlug: 'la-azuela',
    date: '2026-03-21T00:00:00-05:00',
    body: {
      en: 'Built two chicken coops at the Weinreb shop Saturday. Clare and Paul took one home each.',
      es: 'Construimos dos gallineros en el taller de los Weinreb el sábado. Clare y Paul se llevaron uno cada uno.',
    },
  },
  {
    id: 'wt-003',
    workshopId: 'wk-past-003',
    hostId: 'm-003', // Clare
    iconSlug: 'la-gallina',
    date: '2026-03-14T00:00:00-05:00',
    body: {
      en: 'Three families learned to butcher a spent hen this morning. Nothing was wasted.',
      es: 'Tres familias aprendieron a destazar una gallina vieja esta mañana. Nada se desperdició.',
      // REVIEW: "destazar" is correct for butchering an animal. "gallina vieja"
      // for "spent hen" is a neutral rendering. A native might prefer
      // "gallina de desecho" (technical) or just "gallina que ya no pone"
      // (warmer). Your register call.
    },
  },
  {
    id: 'wt-004',
    workshopId: 'wk-past-004',
    hostId: 'm-008', // Susana
    iconSlug: 'el-telar',
    date: '2026-03-07T00:00:00-05:00',
    body: {
      en: 'Six of us mended by hand at Mission San José after the 10 AM Mass. Good conversation, better coffee.',
      es: 'Seis de nosotros remendamos a mano en Mission San José después de la Misa de las 10. Buena plática, mejor café.',
      // REVIEW: "plática" is Mexican Spanish for "conversation" — warmer and
      // more right for this register than the neutral "conversación."
    },
  },
  {
    id: 'wt-005',
    workshopId: 'wk-past-005',
    hostId: 'm-002', // Thomas
    iconSlug: 'las-abejas',
    date: '2026-02-28T00:00:00-05:00',
    body: {
      en: 'Pulled 60 pounds of honey at the Abernathy hives Saturday. Some will go on the altar for the blessing in May.',
      es: 'Cosechamos 60 libras de miel en las colmenas de los Abernathy el sábado. Un poco irá al altar para la bendición de mayo.',
    },
  },
  {
    id: 'wt-006',
    workshopId: 'wk-past-006',
    hostId: 'm-001', // María Elena
    iconSlug: 'las-yerbas',
    date: '2026-02-21T00:00:00-05:00',
    body: {
      en: 'Soil prep day in Boerne. Seven of us turned two new beds and talked through what each family is planting this year.',
      es: 'Día de preparar la tierra en Boerne. Entre siete volteamos dos camas nuevas y platicamos sobre lo que cada familia va a sembrar este año.',
      // REVIEW: "platicamos" — again, Mexican-register "conversation" verb.
      // Correct for this chapter.
    },
  },
];
