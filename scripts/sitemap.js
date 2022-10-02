const path = require('path');
const { promises: fs } = require('fs');
const mongodb = require('mongodb');

const {
  env: { MONGODB_URI: uri },
} = process;

const [, , host = 'https://ancill.app'] = process.argv;

const addDays = (date, days) => {
  const newDate = new Date(date);

  newDate.setDate(newDate.getDate() + days);

  return newDate;
};

const breviaryTranslations = {
  invitatory: {
    it: 'invitatorio',
    en: 'invitatory',
    de: 'invitatorium',
    pt: 'invitatory',
  },
  matins: {
    it: 'ufficio',
    en: 'matins',
    de: 'lesehore',
    pt: 'matins',
  },
  lauds: {
    it: 'lodi',
    en: 'lauds',
    de: 'laudes',
    pt: 'lauds',
  },
  terce: {
    it: 'terza',
    en: 'terce',
    de: 'terz',
    pt: 'terce',
  },
  sext: {
    it: 'sesta',
    en: 'sext',
    de: 'sext',
    pt: 'sext',
  },
  none: {
    it: 'nona',
    en: 'none',
    de: 'non',
    pt: 'none',
  },
  vespers: {
    it: 'vespri',
    en: 'vespers',
    de: 'vesper',
    pt: 'vespers',
  },
  compline: {
    it: 'compieta',
    en: 'compline',
    de: 'komplet',
    pt: 'compline',
  },
};

const run = async () => {
  const client = await new mongodb.MongoClient(uri).connect();

  const db = client.db('Production');

  const [songs, prayers, magazines] = await Promise.all([
    db
      .collection('songs')
      .find(
        {},
        {
          projection: {
            _id: 0,
            language: 1,
            category: 1,
            number: 1,
          },
        },
      )
      .toArray(),
    db
      .collection('prayers')
      .find(
        {},
        {
          projection: {
            _id: 0,
            slug: 1,
          },
        },
      )
      .toArray(),
    db
      .collection('magazines')
      .find(
        {},
        {
          projection: {
            _id: 0,
            type: 1,
            code: 1,
          },
        },
      )
      .toArray(),
  ]);

  await client.close();

  const midday = new Date();
  midday.setHours(12, 0, 0, 0);

  const urls = [
    // Home
    '/it',
    '/en',
    '/de',
    '/pt',

    // Breviary
    '/it/breviario',
    '/en/breviary',
    '/de/brevier',
    '/pt/breviario',

    // Songs list
    '/it/canti',
    '/en/songs',
    '/de/lieder',
    '/pt/cancoes',

    // Prayers list
    '/it/preghiere',
    '/en/prayers',
    '/de/gebete',
    '/pt/oracoes',

    // Magazines index
    '/it/riviste',
    '/en/magazines',
    '/de/zeitschriften',
    '/pt/revistas',

    // Ancilla Domini list
    '/it/riviste/ancilla-domini',
    '/en/magazines/ancilla-domini',
    '/de/zeitschriften/ancilla-domini',
    '/pt/revistas/ancilla-domini',

    // #sempreconnessi list
    '/it/riviste/sempreconnessi',
    '/en/magazines/sempreconnessi',
    '/de/zeitschriften/sempreconnessi',
    '/pt/revistas/sempreconnessi',

    // Login
    '/it/accesso',
    '/en/login',
    '/de/anmeldung',
    '/pt/conecte-se',

    // Settings
    '/it/impostazioni',
    '/en/settings',
    '/de/einstellungen',
    '/pt/configuracoes',

    // Info
    '/it/informazioni',
    '/en/info',
    '/de/informationen',
    '/pt/informacoes',

    // Songs details
    ...songs.flatMap(({ language, category, number }) => [
      `/it/canti/${language}/${category}/${number}`,
      `/en/songs/${language}/${category}/${number}`,
      `/de/lieder/${language}/${category}/${number}`,
      `/pt/cancoes/${language}/${category}/${number}`,
    ]),

    // Prayers details
    ...prayers.flatMap(({ slug }) => [
      `/it/preghiere/${slug}`,
      `/en/prayers/${slug}`,
      `/de/gebete/${slug}`,
      `/pt/oracoes/${slug}`,
    ]),

    // Holy Mass Liturgy
    ...Array.from({ length: 15 }).flatMap((_, index) => {
      const date = addDays(midday, index - 7);
      const dateString = [
        date.getFullYear(),
        (date.getMonth() + 1).toString().padStart(2, '0'),
        date.getDate().toString().padStart(2, '0'),
      ].join('/');

      return [
        `/it/santa-messa/${dateString}`,
        `/en/holy-mass/${dateString}`,
        `/de/heilige-messe/${dateString}`,
        `/pt/santa-missa/${dateString}`,
      ];
    }),

    // Magazines details
    ...magazines.flatMap(({ type, code }) => [
      `/it/riviste/${type}/${code}`,
      `/en/magazines/${type}/${code}`,
      `/de/zeitschriften/${type}/${code}`,
      `/pt/revistas/${type}/${code}`,
    ]),
  ];

  const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.reduce(
    (urlsString, url) =>
      `${urlsString}<url><loc>${host}${url}</loc><changefreq>weekly</changefreq></url>`,
    '',
  )}</urlset>`;

  const sitemapPath = path.resolve(__dirname, '../pwa/src/assets/sitemap.xml');

  await fs.writeFile(sitemapPath, sitemap);
};

run();
