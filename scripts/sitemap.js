const path = require('path');
const { promises: fs } = require('fs');
const mongodb = require('mongodb');

const {
  env: { MONGODB_URI: uri },
} = process;

const [, , host = 'https://ancill.app'] = process.argv;

const run = async () => {
  const client = await new mongodb.MongoClient(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }).connect();

  const db = client.db('Main');

  const [songs, prayers, ancillas] = await Promise.all([
    db
      .collection('songs')
      .find(
        {},
        {
          projection: {
            _id: 0,
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
      .collection('ancillas')
      .find(
        {},
        {
          projection: {
            _id: 0,
            code: 1,
          },
        },
      )
      .toArray(),
  ]);

  await client.close();

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

    // Ancillas list
    '/it/ancilla-domini',
    '/en/ancilla-domini',
    '/de/ancilla-domini',
    '/pt/ancilla-domini',

    // Holy Mass
    '/it/santa-messa',
    '/en/holy-mass',
    '/de/heilige-messe',
    '/pt/santa-messa',

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
    ...songs.reduce(
      (songsUrls, { number }) => [
        ...songsUrls,
        `/it/canti/${number}`,
        `/en/songs/${number}`,
        `/de/lieder/${number}`,
        `/pt/cancoes/${number}`,
      ],
      [],
    ),

    // Prayers details
    ...prayers.reduce(
      (prayersUrls, { slug }) => [
        ...prayersUrls,
        `/it/preghiere/${slug}`,
        `/en/prayers/${slug}`,
        `/de/gebete/${slug}`,
        `/pt/oracoes/${slug}`,
      ],
      [],
    ),

    // Ancillas details
    ...ancillas.reduce(
      (ancillasUrls, { code }) => [
        ...ancillasUrls,
        `/it/ancilla-domini/${code}`,
        `/en/ancilla-domini/${code}`,
        `/de/ancilla-domini/${code}`,
        `/pt/ancilla-domini/${code}`,
      ],
      [],
    ),

    // TODO: add breviary pages
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
