const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const {
  env: { REPORTER_BASE_URL: baseUrl, REPORTER_PROJECT_NAME: projectName },
} = process;

const configs = [
  {
    url: '/home',
    title: 'Home',
  },
  {
    url: '/ancillas',
    title: 'Ancillas',
  },
  {
    url: '/ancillas/AD2_2018',
    title: 'Ancilla',
  },
  {
    url: '/songs',
    title: 'Songs',
  },
  {
    url: '/songs/1',
    title: 'Song',
  },
  {
    url: '/prayers',
    title: 'Prayers',
  },
  {
    url: '/prayers/anima-di-cristo',
    title: 'Prayer',
  },
  {
    url: '/settings',
    title: 'Settings',
  },
  {
    url: '/info',
    title: 'Info',
  },
];

const auditPage = async (chrome, url) => {
  const {
    lhr: { categories },
  } = await lighthouse(url, { port: chrome.port });
  return categories;
};

module.exports = async () => {
  process.stdout.write('Starting Chrome...\n');
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless'],
  });

  const results = await configs.reduce(
    async (reportPromise, { url, title }) => {
      const report = await reportPromise;
      process.stdout.write(`Auditing ${title} (${baseUrl}${url})...\n`);
      const result = await auditPage(chrome, `${baseUrl}${url}`);
      return `${report}\n*${title}:*\n${Object.values(result).reduce(
        (currentReport, { title: auditTitle, score }) =>
          `${currentReport}*${auditTitle}:* \`${Math.floor(score * 100)}\`\n`,
        '',
      )}`;
    },
    Promise.resolve(`*🗼 Lighthouse report for ${projectName}:*\n`),
  );

  await chrome.kill();

  return results;
};
