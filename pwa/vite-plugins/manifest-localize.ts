import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import type { Connect } from 'vite';
import type { ServerResponse } from 'node:http';
import { localizeHref } from '../src/helpers/localization';

// ---------------------------------------------------------------------------
// Locale helpers (ported from webpack/helpers.ts)
// ---------------------------------------------------------------------------

type SupportedLocale = 'it' | 'en' | 'de' | 'pt';

const supportedLocales: readonly SupportedLocale[] = ['it', 'en', 'de', 'pt'];
const defaultLocale: SupportedLocale = 'it';

const parseLocaleFile = (content: string): Record<string, string> => {
  const [, ...matches] = Array.from(
    content.matchAll(/msgid (.+?)\nmsgstr (.+?)\n(?:\n|$)/gs),
  );

  return Object.fromEntries(
    matches.map(([, msgid, msgstr]) => {
      const id = msgid.slice(1, -1);
      const str = msgstr
        .split('\n')
        .map((part) => JSON.parse(part))
        .join('');
      return [id, str];
    }),
  );
};

const loadLocalesData = (
  srcDir: string,
): [SupportedLocale, Record<string, string>][] =>
  supportedLocales.map((locale) => [
    locale,
    parseLocaleFile(
      fs.readFileSync(path.join(srcDir, `locales/${locale}.po`), 'utf8'),
    ),
  ]);

// ---------------------------------------------------------------------------
// Template processor (replicates webpack CopyPlugin transform)
// ---------------------------------------------------------------------------

const processTemplate = (
  content: string,
  locale: SupportedLocale,
  localeData: Record<string, string>,
): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const helpers: Record<string, (...params: any[]) => string> = {
    t: (key: string) => localeData[key] ?? '',
    localizeHref: (page: string, ...subroutes: string[]) =>
      localizeHref(locale, page, ...subroutes),
  };
  const vars: Record<string, string> = { locale };

  return content.replace(/{{(.+?)}}/g, (_, templateContent: string) => {
    const [helperOrVar, ...rawParams] = templateContent.split(/\s+/);
    const parsedParams = rawParams.map((param: string) =>
      param.replace(/(^['"]|["']$)/g, ''),
    );
    return parsedParams.length > 0
      ? helpers[helperOrVar](...parsedParams)
      : (vars[helperOrVar] ?? '');
  });
};

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

export function manifestLocalize(): Plugin {
  let srcDir: string;

  return {
    name: 'manifest-localize',

    configResolved(config) {
      srcDir = path.resolve(config.root, 'src');
    },

    generateBundle() {
      const templatePath = path.join(srcDir, 'site.webmanifest');
      const template = fs.readFileSync(templatePath, 'utf8');
      const localesData = loadLocalesData(srcDir);

      for (const [locale, localeData] of localesData) {
        const processed = processTemplate(template, locale, localeData);
        const fileName =
          locale === defaultLocale
            ? 'site.webmanifest'
            : `localized-files/${locale}/site.webmanifest`;

        this.emitFile({ type: 'asset', fileName, source: processed });
      }
    },

    configureServer(server) {
      // Serve localised manifests in dev mode
      server.middlewares.use(
        (
          req: Connect.IncomingMessage,
          res: ServerResponse,
          next: Connect.NextFunction,
        ) => {
          if (!req.url) return next();

          // Match /site.webmanifest or /localized-files/{locale}/site.webmanifest
          const match = req.url.match(
            /^\/(localized-files\/([a-z]{2})\/)?site\.webmanifest$/,
          );
          if (!match) return next();

          const locale =
            (match[2] as SupportedLocale | undefined) ?? defaultLocale;
          const templatePath = path.join(srcDir, 'site.webmanifest');

          try {
            const template = fs.readFileSync(templatePath, 'utf8');
            const localesData = loadLocalesData(srcDir);
            const localeData =
              localesData.find(([l]) => l === locale)?.[1] ?? {};
            const processed = processTemplate(template, locale, localeData);

            res.setHeader('Content-Type', 'application/manifest+json');
            res.end(processed);
          } catch (e) {
            next(e);
          }
        },
      );
    },
  };
}
