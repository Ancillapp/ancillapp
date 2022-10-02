const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');

const {
  env: { REPORTER_BASE_URL: baseUrl, REPORTER_PROJECT_NAME: projectName },
} = process;

const now = new Date();

const configs = [
  {
    url: '/it',
    title: 'Home',
  },
  {
    url: '/it/breviario',
    title: 'Breviary index',
  },
  {
    url: '/it/canti',
    title: 'Songs',
  },
  {
    url: '/it/canti/it/kyrie/1',
    title: 'Song',
  },
  {
    url: '/it/preghiere',
    title: 'Prayers',
  },
  {
    url: '/it/preghiere/angelo-di-dio',
    title: 'Prayer',
  },
  {
    url: `/it/santa-messa/${now.getFullYear()}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`,
    title: 'Holy Mass Liturgy',
  },
  {
    url: '/it/riviste',
    title: 'Magazines',
  },
  {
    url: '/it/riviste/ancilla-domini/AD4-2019',
    title: 'Ancilla Domini',
  },
  {
    url: '/it/riviste/sempreconnessi/SC4-2022',
    title: '#sempreconnessi',
  },
  {
    url: '/it/accesso',
    title: 'Login',
  },
  {
    url: '/it/impostazioni',
    title: 'Settings',
  },
  {
    url: '/it/informazioni',
    title: 'Info',
  },
];

const auditPage = async (port, url) => {
  const {
    lhr: { categories },
  } = await lighthouse(url, { port });
  return categories;
};

module.exports = async () => {
  process.stdout.write('Starting Chrome...\n');
  const chrome = await puppeteer.launch();
  const { port } = new URL(chrome.wsEndpoint());

  const results = await configs.reduce(
    async (reportPromise, { url, title }) => {
      const report = await reportPromise;
      process.stdout.write(`Auditing ${title} (${baseUrl}${url})...\n`);
      const result = await auditPage(port, `${baseUrl}${url}`);
      return `${report}\n*${title}:*\n${Object.values(result).reduce(
        (currentReport, { title: auditTitle, score }) =>
          `${currentReport}*${auditTitle}:* \`${Math.floor(score * 100)}\`\n`,
        '',
      )}`;
    },
    Promise.resolve(`*🗼 Lighthouse report for ${projectName}:*\n`),
  );

  await chrome.close();

  return results;
};
