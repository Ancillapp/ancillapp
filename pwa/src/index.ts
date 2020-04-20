import { get } from 'idb-keyval';
import {
  SupportedLocale,
  supportedLocales,
  defaultLocale,
} from './helpers/localize';

// Feature detect which polyfill needs to be imported.
const needsTemplate = (() => {
  // no real <template> because no `content` property (IE and older browsers)
  const template = document.createElement('template');
  if (!('content' in template)) {
    return true;
  }
  // broken doc fragment (older Edge)
  if (!(template.content.cloneNode() instanceof DocumentFragment)) {
    return true;
  }
  // broken <template> cloning (Edge up to at least version 17)
  const templateClone = document.createElement('template');
  templateClone.content.appendChild(document.createElement('div'));
  template.content.appendChild(templateClone);
  const clone = template.cloneNode(true) as HTMLTemplateElement;
  return (
    clone.content.childNodes.length === 0 ||
    (clone.content.firstChild as any).content.childNodes.length === 0
  );
})();

let polyfills = [];

if (
  !(
    'attachShadow' in Element.prototype && 'getRootNode' in Element.prototype
  ) ||
  (window as any).ShadyDOM?.force
) {
  polyfills.push('sd');
}
if (!window.customElements || (window.customElements as any).forcePolyfill) {
  polyfills.push('ce');
}

// NOTE: any browser that does not have template or ES6 features
// must load the full suite of polyfills.
if (
  !window.Promise ||
  !Array.from ||
  !window.URL ||
  !window.Symbol ||
  needsTemplate
) {
  polyfills = ['sd-ce-pf'];
}

// Note that in this case we need to append the .js extension, otherwise
// Webpack will try to load the .js.map files into the bundle too.
(polyfills.length
  ? import(`@webcomponents/webcomponentsjs/bundles/${polyfills.join('-')}.js`)
  : Promise.resolve()
)
  .then(() =>
    Promise.all([
      get<SupportedLocale>('locale').then((storedLocale) => {
        const userLocale = navigator.language.slice(0, 2);

        const locale =
          storedLocale ||
          (supportedLocales.includes(userLocale as SupportedLocale)
            ? userLocale
            : defaultLocale);

        // Prefetch the needed locale file
        return fetch(`/locales/${locale}.json`);
      }),
      import('./components/shell/shell.component'),
    ]),
  )
  .then(() => document.querySelector('#loading')!.remove());
