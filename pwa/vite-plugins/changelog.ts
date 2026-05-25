import type { Plugin } from 'vite';

const changelogRegex = /CHANGELOG(\.(it|de|pt))?\.md$/;

export function changelog(): Plugin {
  return {
    name: 'changelog',
    enforce: 'pre',
    transform(source: string, id: string) {
      if (!changelogRegex.test(id)) return null;

      const match = source.match(/##\s+([^\s]+)\s+\(([^)]+)\)\s+([^#]+)/);

      if (!match) {
        throw new Error(`Cannot parse changelog: ${id}`);
      }

      const [, version, date, rawNews] = match;

      const news = rawNews
        .split('-')
        .map((item) => item.trim())
        .filter(Boolean);

      const data = JSON.stringify({ version, date, news });

      return {
        code: `
const data = ${data};
export const version = data.version;
export const date = data.date;
export const news = data.news;
export default data;
`,
        map: null,
      };
    },
  };
}
