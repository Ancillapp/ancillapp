import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { GetLiturgyResult, LiturgyColor } from './models';
import { dropHtml } from './helpers';

const API_URL =
  'https://www.chiesacattolica.it/liturgia-del-giorno/?data-liturgia=';

const stringToLiturgyColorMap: Record<string, LiturgyColor> = {
  verde: LiturgyColor.GREEN,
  viola: LiturgyColor.VIOLET,
  rosa: LiturgyColor.ROSE,
  bianco: LiturgyColor.WHITE,
  rosso: LiturgyColor.RED,
  nero: LiturgyColor.BLACK,
};

export const scrapeLiturgy = async (date: Date): Promise<GetLiturgyResult> => {
  const response = await fetch(
    `${API_URL}${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`,
  );
  const rawHtml = await response.text();

  const { window } = new JSDOM(rawHtml);
  const { document } = window;

  const liturgicalColor = document
    .querySelector('.cci-colore-liturgico > span')
    ?.textContent?.trim()
    .toLowerCase();

  const rawSections = Array.from(
    document.querySelectorAll('.cci-liturgia-giorno-dettagli-content'),
  );

  const sections = rawSections.map((section) => {
    const titleNode = section.querySelector(
      '.cci-liturgia-giorno-section-title',
    );
    const title = titleNode?.innerHTML
      ? dropHtml(titleNode.innerHTML)
      : undefined;
    if (titleNode) {
      section.removeChild(titleNode);
    }

    const rawContent = Array.from(section.querySelectorAll(':scope > *'));
    const subsections = rawContent
      .map((rawParagraph) => dropHtml(rawParagraph.innerHTML))
      .filter(Boolean);

    return {
      title,
      sections: subsections,
    };
  });

  return {
    color: liturgicalColor
      ? stringToLiturgyColorMap[liturgicalColor]
      : undefined,
    sections,
  };
};
