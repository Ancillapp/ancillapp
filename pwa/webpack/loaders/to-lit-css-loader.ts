// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function (this: any, source: string) {
  this.cacheable && this.cacheable();

  return `
    const {css} = require('lit');
    module.exports = css\`${source}\`;
  `;
}
