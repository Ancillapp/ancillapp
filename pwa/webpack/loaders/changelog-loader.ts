// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function (this: any, source: string) {
  this.cacheable && this.cacheable();

  const match = source.match(/##\s+([^\s]+)\s+\(([^)]+)\)\s+([^#]+)/);

  if (!match) {
    throw new Error('Cannot parse changelog');
  }

  const [, version, date, rawNews] = match;

  const news = rawNews
    .split('-')
    .map((newsItem) => newsItem.trim())
    .filter(Boolean);

  return `module.exports = ${JSON.stringify({ version, date, news })};`;
}
