import type { Plugin } from 'vite';

const litCssRegex = /\.styles\.s?[ac]ss$/;
// Prefix marks it as a Rollup virtual module (skipped by other plugins).
// Suffix .js ensures Vite's CSS_LANGS_RE does NOT match it (it looks for
// `.scss(?:\?|$)` — adding .js breaks that pattern).
const VIRTUAL_PREFIX = '\0lit-css:';
const VIRTUAL_SUFFIX = '.js';

export function litCss(): Plugin {
  return {
    name: 'lit-css',
    enforce: 'pre',
    async resolveId(id, importer) {
      // Pass our own virtual modules through unchanged
      if (id.startsWith(VIRTUAL_PREFIX)) {
        return id;
      }

      // Redirect *.styles.scss imports to a virtual JS module
      if (litCssRegex.test(id)) {
        const resolved = await this.resolve(id, importer, { skipSelf: true });
        if (resolved) {
          // The .js suffix prevents Vite from treating this ID as a CSS file
          return VIRTUAL_PREFIX + resolved.id + VIRTUAL_SUFFIX;
        }
      }

      return null;
    },
    load(id) {
      if (!id.startsWith(VIRTUAL_PREFIX)) return null;

      // Recover the real .scss path by stripping prefix and .js suffix
      const realPath = id.slice(VIRTUAL_PREFIX.length, -VIRTUAL_SUFFIX.length);

      // ?inline lets Vite's own Sass + PostCSS pipeline compile the file and
      // return the CSS as a string, which we then wrap in Lit's unsafeCSS().
      return [
        `import { unsafeCSS } from 'lit';`,
        `import cssContent from ${JSON.stringify(realPath + '?inline')};`,
        `export default unsafeCSS(cssContent);`,
      ].join('\n');
    },
  };
}
