import { JSDOM } from 'jsdom';
import type { GetLiturgyResult } from '../liturgy';
import { dropHtml } from './helpers';

const API_URL = 'https://sagradaliturgia.com.br/liturgia_diaria.php?date=';

export const scrapeLiturgy = async (date: Date): Promise<GetLiturgyResult> => {
  const response = await fetch(
    `${API_URL}${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
  );
  const rawHtml = await response.text();

  const { window } = new JSDOM(rawHtml);
  const { document } = window;

  const main = document.querySelector('div[role="main"]');
  const body = main?.querySelector('.ui-body:nth-of-type(2)');
  const liturgicalColorLink = body
    ?.querySelector('center:first-child img')
    ?.getAttribute('src');
  const liturgicalColor = liturgicalColorLink?.slice(
    liturgicalColorLink.lastIndexOf('/') + 1,
    liturgicalColorLink.lastIndexOf('.'),
  );
  const [, , ...sections] = body?.innerHTML?.split('<b>') || [];

  return {
    color: liturgicalColor,
    sections: sections.map((section) => {
      const [title, content] = section.split('</b>');
      return {
        title: dropHtml(title),
        sections: [dropHtml(content)],
      };
    }),
  };
};
