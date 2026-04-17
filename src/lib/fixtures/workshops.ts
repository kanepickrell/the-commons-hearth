import type { Workshop } from '@/lib/types';

export const workshops: Workshop[] = [
  {
    id: 'w-001',
    hostId: 'm-002', // Thomas, beekeeper
    iconSlug: 'las-abejas',
    date: '2026-04-25T09:00:00-05:00',
    locationName: 'The Abernathy place, Helotes',
    locationLatLon: [29.5786, -98.6866],
    rsvpCount: 4,
    title: {
      en: 'Spring hive inspection — bring gloves',
      es: 'Revisión de colmena de primavera — traigan guantes',
    },
    description: {
      en: "Three hours at the hives. We'll check brood, look for the queen, and talk about splitting come May. Space for four learners. Kids welcome if they can stand still.",
      es: 'Tres horas en las colmenas. Revisaremos la cría, buscaremos a la reina, y hablaremos de dividirlas en mayo. Hay lugar para cuatro aprendices. Los niños son bienvenidos si pueden estarse quietos.',
    },
  },
  {
    id: 'w-002',
    hostId: 'm-004', // Jonathan, sourdough
    iconSlug: 'el-pan',
    date: '2026-05-02T10:00:00-05:00',
    locationName: 'Sacred Heart parish hall, New Braunfels',
    locationLatLon: [29.7030, -98.1245],
    rsvpCount: 6,
    title: {
      en: 'Sourdough starter from scratch — Saturday morning',
      es: 'Masa madre desde cero — sábado por la mañana',
    },
    description: {
      en: 'Bring a clean quart jar and a bag of good flour. You leave with a living starter and instructions for the first two weeks. Coffee and kolaches provided.',
      es: 'Traigan un frasco limpio de un litro y una bolsa de buena harina. Se van con una masa madre viva y las indicaciones para las primeras dos semanas. Habrá café y kolaches.',
      // REVIEW: "kolaches" is a Central Texas thing (Czech pastry, common in
      // New Braunfels-area parish halls). Spanish speakers in the region know
      // the word. Leaving untranslated is correct.
    },
  },
  {
    id: 'w-003',
    hostId: 'm-006', // Michael, rainwater
    iconSlug: 'la-cisterna',
    date: '2026-05-09T08:00:00-05:00',
    locationName: "The O'Brien homestead, south of San Antonio",
    locationLatLon: [29.3015, -98.4734],
    rsvpCount: 3,
    title: {
      en: 'Rainwater cistern install — a full workday',
      es: 'Instalación de cisterna de agua de lluvia — un día completo de trabajo',
    },
    description: {
      en: "I'm putting in a 2,500-gallon tank. Come help, learn the system, and eat at the end. Wear work clothes. Bring a shovel if you have one.",
      es: 'Voy a instalar un tanque de 2,500 galones. Vengan a ayudar, aprendan el sistema, y comemos al final. Vístanse para trabajar. Traigan pala si tienen.',
    },
  },
  {
    id: 'w-004',
    hostId: 'm-001', // María Elena, milpa
    iconSlug: 'la-milpa',
    date: '2026-05-15T07:00:00-05:00',
    locationName: 'The Vásquez garden, Boerne',
    locationLatLon: [29.8034, -98.7412],
    rsvpCount: 8,
    title: {
      en: 'Día de San Isidro — Blessing of the fields and a morning in the garden',
      es: 'Día de San Isidro — Bendición del campo y una mañana en la huerta',
    },
    description: {
      en: 'Our patronal feast. Father will come at 7 AM for the blessing of seed, soil, and tools. Then we plant the three-sisters bed together. Bring seeds you want blessed. Breakfast after.',
      es: 'Nuestra fiesta patronal. El padre llega a las 7 de la mañana para bendecir la semilla, la tierra, y las herramientas. Después sembramos juntos la milpa de las tres hermanas. Traigan las semillas que quieran bendecir. Desayunamos después.',
    },
  },
  {
    id: 'w-005',
    hostId: 'm-009', // Catherine, soap
    iconSlug: 'el-jabon',
    date: '2026-05-23T09:00:00-05:00',
    locationName: 'The Okonkwo kitchen, Fredericksburg',
    locationLatLon: [30.2752, -98.8720],
    rsvpCount: 5,
    title: {
      en: 'Hot-process soap making — you leave with two bars',
      es: 'Jabón de proceso en caliente — se van con dos barras',
    },
    description: {
      en: "A real soap-making session, not a craft demo. We'll work with lye safely, render a small batch, and you'll take home what you made. Bring an apron and closed-toe shoes.",
      es: 'Una sesión de jabón de verdad, no una demostración de manualidades. Trabajaremos con lejía con cuidado, haremos una hornada pequeña, y se llevan a casa lo que hagan. Traigan mandil y zapatos cerrados.',
      // REVIEW: "mandil" is the Tejano word for apron ("delantal" is more
      // neutral Spanish but "mandil" reads right in this register).
    },
  },
];
