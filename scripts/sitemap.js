const path = require('path');
const { promises: fs } = require('fs');
const mongodb = require('mongodb');

const {
  env: { MONGODB_URI: uri },
} = process;

const defaultLocale = 'it';

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

  const now = new Date();

  const urls = [
    // Home
    {
      it: '/it',
      en: '/en',
      de: '/de',
      pt: '/pt',
    },

    // Breviary
    {
      it: '/it/breviario',
      en: '/en/breviary',
      de: '/de/brevier',
      pt: '/pt/breviario',
    },

    // Songs list
    {
      it: '/it/canti',
      en: '/en/songs',
      de: '/de/lieder',
      pt: '/pt/cancoes',
    },

    // Prayers list
    {
      it: '/it/preghiere',
      en: '/en/prayers',
      de: '/de/gebete',
      pt: '/pt/oracoes',
    },

    // Magazines index
    {
      it: '/it/riviste',
      en: '/en/magazines',
      de: '/de/zeitschriften',
      pt: '/pt/revistas',
    },

    // Ancilla Domini list
    {
      it: '/it/riviste/ancilla-domini',
      en: '/en/magazines/ancilla-domini',
      de: '/de/zeitschriften/ancilla-domini',
      pt: '/pt/revistas/ancilla-domini',
    },

    // #sempreconnessi list
    {
      it: '/it/riviste/sempreconnessi',
      en: '/en/magazines/sempreconnessi',
      de: '/de/zeitschriften/sempreconnessi',
      pt: '/pt/revistas/sempreconnessi',
    },

    // Login
    {
      it: '/it/accesso',
      en: '/en/login',
      de: '/de/anmeldung',
      pt: '/pt/conecte-se',
    },

    // Settings
    {
      it: '/it/impostazioni',
      en: '/en/settings',
      de: '/de/einstellungen',
      pt: '/pt/configuracoes',
    },

    // Info
    {
      it: '/it/informazioni',
      en: '/en/info',
      de: '/de/informationen',
      pt: '/pt/informacoes',
    },

    // Songs details
    ...songs.map(({ language, category, number }) => ({
      it: `/it/canti/${language}/${category}/${number}`,
      en: `/en/songs/${language}/${category}/${number}`,
      de: `/de/lieder/${language}/${category}/${number}`,
      pt: `/pt/cancoes/${language}/${category}/${number}`,
    })),

    // Prayers details
    ...prayers.map(({ slug }) => ({
      it: `/it/preghiere/${slug}`,
      en: `/en/prayers/${slug}`,
      de: `/de/gebete/${slug}`,
      pt: `/pt/oracoes/${slug}`,
    })),

    // Holy Mass Liturgy
    ...Array.from({ length: 15 }).map((_, index) => {
      const date = addDays(now, index - 7);
      const dateString = [
        date.getFullYear(),
        (date.getMonth() + 1).toString().padStart(2, '0'),
        date.getDate().toString().padStart(2, '0'),
      ].join('/');

      return {
        it: `/it/santa-messa/${dateString}`,
        en: `/en/holy-mass/${dateString}`,
        de: `/de/heilige-messe/${dateString}`,
        pt: `/pt/santa-missa/${dateString}`,
      };
    }),

    // Magazines details
    ...magazines.map(({ type, code }) => ({
      it: `/it/riviste/${type}/${code}`,
      en: `/en/magazines/${type}/${code}`,
      de: `/de/zeitschriften/${type}/${code}`,
      pt: `/pt/revistas/${type}/${code}`,
    })),
  ];

  const sitemap = `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
      ${urls
        .map(
          (localizedPages) => `
            <url>
              <loc>${host}${localizedPages[defaultLocale]}</loc>
              <xhtml:link rel="alternate" hreflang="x-default" href="${host}${
            localizedPages[defaultLocale]
          }" />
              ${Object.entries(localizedPages)
                .map(
                  ([lang, path]) =>
                    `<xhtml:link rel="alternate" hreflang="${lang}" href="${host}${path}" />`,
                )
                .join('')}
              <changefreq>weekly</changefreq>
              <lastmod>${now.toISOString()}</lastmod>
            </url>
          `,
        )
        .join('')}
    </urlset>
  `
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><');

  const sitemapPath = path.resolve(__dirname, '../pwa/src/assets/sitemap.xml');

  await fs.writeFile(sitemapPath, sitemap);
};

run();
