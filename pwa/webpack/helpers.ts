import fs from 'fs';
import path from 'path';

export type SupportedLocale = 'it' | 'en' | 'de' | 'pt';

export const supportedLocales: readonly SupportedLocale[] = [
  'it',
  'en',
  'de',
  'pt',
];
export const defaultLocale: SupportedLocale = 'it';

export const parseLocaleFile = (content: string): Record<string, string> => {
  // There is always an empty msgid/msgstr at the beginning of a .po file, so we ignore the first match
  const [, ...matches] = Array.from(
    content.matchAll(/msgid (.+?)\nmsgstr (.+?)\n(?:\n|$)/gs),
  );

  return Object.fromEntries(
    matches.map(([, msgid, msgstr]) => {
      // Remove the quotes from the msgid
      const id = msgid.slice(1, -1);

      const str = msgstr
        // Split the msgstr into lines
        .split('\n')
        // Parse each line as JSON to remove the quotes and unescape special characters
        .map((msgPart) => JSON.parse(msgPart))
        // Join the original lines back into a single line
        .join('');

      return [id, str];
    }),
  );
};

export const localesData: [SupportedLocale, Record<string, string>][] =
  supportedLocales.map((locale) => [
    locale,
    parseLocaleFile(
      fs.readFileSync(
        path.resolve(__dirname, `../src/locales/${locale}.po`),
        'utf8',
      ),
    ),
  ]);
