import * as functions from 'firebase-functions';
import fetch from 'node-fetch';
import { stringify } from 'querystring';
import * as sanitizeHtml from 'sanitize-html';
import { validateDate } from './helpers/validators';

const apiUrl = 'http://www.liturgiadelleore.it/ajax/Testo.php';

const formatDate = (date: Date) =>
  `${`${date.getDate()}`.padStart(2, '0')}/${`${date.getMonth() + 1}`.padStart(
    2,
    '0',
  )}/${date.getFullYear()}`;

const transformTag = (className: string, content: string) => {
  switch (className) {
    case 'Titolo':
      return `<h2>${content}</h2>`;
    case 'Ora':
      return `<h3>${content}</h3>`;
    case 'Grado':
      return `<small>${content}</small>`;
    case 'Risalto':
      return `<strong class="small-caps">${content}</strong>`;
    case 'Rosso':
    case 'EvidenzaVersetto':
    case 'Rubrica':
      return `<strong>${content}</strong>`;
    case 'Minuscoletto':
      return content.toLowerCase();
    case 'Spiegazione':
      return `<h4>${content}</h4>`;
    case 'Citazione':
      return `<em>${content}</em>`;
    default:
      return content;
  }
};

export const getBreviary = functions.https.onRequest(
  async ({ query: { date, prayer } }, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set(
      'Cache-Control',
      'public, max-age=1800, s-maxage=3600, stale-while-revalidate=3600',
    );

    if (!validateDate(date)) {
      res.status(400).send();
      return;
    }

    const prayers = {
      title: 0,
      invitatory: 0,
      matins: 1,
      lauds: 2,
      terce: 3,
      sext: 4,
      none: 5,
      vespers: 6,
      compline: 7,
    };
    const memories = ['05-13', '05-18'];

    const monthDay = date.slice(5);
    const parsedDate = new Date(date);

    const params = {
      '  Data': formatDate(
        isNaN(parsedDate.valueOf()) ? new Date() : parsedDate,
      ),
      ' Ora': prayers[prayer as keyof typeof prayers] || prayers.invitatory,
      ' MemoriaFacoltativa': memories.includes(monthDay) ? 1 : 0,
      ' CorrettoreMemoriaFacoltativa': 0,
      ' parametro': 0,
      ' Abbreviazione': 0,
      ' SenzaInvitatorio': 0,
      ' Celebrazione': 1,
    };

    const response = await fetch(`${apiUrl}?${stringify(params)}`);
    const content = await response.text();

    const sanitizedHtml = sanitizeHtml(content, {
      allowedTags: [...sanitizeHtml.defaults.allowedTags, 'font'],
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        font: ['class'],
      },
      nonTextTags: ['style', 'script', 'textarea', 'noscript', 'button'],
    });

    const replacedHtml = sanitizedHtml
      .replace(
        /<font class="([^"]+)">([^<]+)<\/font>/g,
        (_, className, content) => transformTag(className, content),
      )
      .replace(
        /<font class="(Risalto|Titolo)">(.+?)<\/font>/g,
        (_, className, content) => {
          const tagName = className === 'Risalto' ? 'h3' : 'h2';
          const fixedContent = content
            .replace(/<br \/>/g, '')
            .replace(/</g, '<br><');

          return `<${tagName}>${fixedContent}</${tagName}>`;
        },
      )
      .replace(/<br \/>/g, '<br>')
      .replace(
        /<h3>([^<]+)<\/h3>\s*<h4>([^<]+)<\/h4>/g,
        '<h3>$1 <small>$2</small></h3>',
      )
      .replace(/<div><h3>/g, '<div class="alternative"><h3>')
      .replace(/[*†]/g, '<strong>$&</strong>')
      .replace(/<\/h([234])>\s*(?:<br>)+/g, '</h$1>');

    if (prayer === 'title') {
      res
        .type('html')
        .send(
          replacedHtml.match(/^<h2>.+?<\/h2>/)?.[0] ||
            '<h2>Liturgia delle Ore</h2>',
        );
      return;
    }

    res.type('html').send(replacedHtml);
  },
);
