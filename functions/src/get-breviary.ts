import * as functions from 'firebase-functions';
import fetch from 'node-fetch';
import { stringify } from 'querystring';
import * as sanitizeHtml from 'sanitize-html';

const apiUrl = 'http://www.liturgiadelleore.it/ajax/Testo.php';

const formatDate = (date: Date) =>
  `${`${date.getDate()}`.padStart(2, '0')}/${`${date.getMonth() + 1}`.padStart(
    2,
    '0',
  )}/${date.getFullYear()}`;

const transformTag = (className: string, content: string) => {
  if (className === 'Titolo') {
    return `<h2>${content}</h2>`;
  }

  if (className === 'Ora') {
    return `<h3>${content}</h3>`;
  }

  if (className === 'Risalto') {
    return `<strong class="small-caps">${content}</strong>`;
  }

  if (
    className === 'Rosso' ||
    className === 'EvidenzaVersetto' ||
    className === 'Rubrica'
  ) {
    return `<strong>${content}</strong>`;
  }

  if (className === 'Minuscoletto') {
    return content.toLowerCase();
  }

  if (className === 'Spiegazione') {
    return `<h4>${content}</h4>`;
  }

  if (className === 'Citazione') {
    return `<em>${content}</em>`;
  }

  return content;
};

export const getBreviary = functions.https.onRequest(
  async ({ query: { date, prayer } }, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set(
      'Cache-Control',
      'public, s-maxage=86400, stale-while-revalidate=86400',
    );

    const parsedDate = new Date(date as string);

    const prayers = {
      invitatory: 0,
      office: 1,
      lauds: 2,
      terce: 3,
      sext: 4,
      none: 5,
      vespers: 6,
      compline: 7,
    };

    const params = {
      '  Data': formatDate(
        isNaN(parsedDate.valueOf()) ? new Date() : parsedDate,
      ),
      ' Ora': prayers[prayer as keyof typeof prayers] || prayers.invitatory,
      ' MemoriaFacoltativa': 0,
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
        /<font class="Risalto">([^<]+)<\/font>/g,
        (_, content) => `<h3>${content}</h3>`,
      )
      .replace(/<br \/>/g, '<br>')
      .replace(
        /<h3>([^<]+)<\/h3>\s*<h4>([^<]+)<\/h4>/g,
        '<h3>$1 <small>$2</small></h3>',
      )
      .replace(/<div><h3>/g, '<div class="alternative"><h3>')
      .replace(/[*†]/g, '<strong>$&</strong>');

    res.type('html').send(replacedHtml);
  },
);
