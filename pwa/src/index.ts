import { get } from './helpers/keyval';
import {
  SupportedLocale,
  supportedLocales,
  defaultLocale,
} from './helpers/localize';

declare global {
  interface Window {
    ShadyDOM?: {
      force?: boolean;
    };
  }
}

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
    (clone.content.firstChild as HTMLTemplateElement).content.childNodes
      .length === 0
  );
})();

let polyfills = [];

if (
  !(
    'attachShadow' in Element.prototype && 'getRootNode' in Element.prototype
  ) ||
  window.ShadyDOM?.force
) {
  polyfills.push('sd');
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const getPreferredLocale = async () => {
  const pathLocale = window.location.pathname.slice(1, 3) as SupportedLocale;

  if (supportedLocales.includes(pathLocale)) {
    return pathLocale;
  }

  const storedLocale = await get<SupportedLocale>('locale');

  if (supportedLocales.includes(storedLocale)) {
    return storedLocale;
  }

  const userLocale = navigator.language.slice(0, 2) as SupportedLocale;

  if (supportedLocales.includes(userLocale)) {
    return userLocale;
  }

  return defaultLocale;
};

const polyfillsPromise = polyfills.length
  ? Promise.all([
      import(
        `@webcomponents/webcomponentsjs/bundles/${polyfills.join('-')}.js`
      ),
      import(`lit/polyfill-support.js`),
    ])
  : Promise.resolve();

polyfillsPromise.then(() =>
  Promise.all([
    getPreferredLocale().then((locale) => import(`./locales/${locale}.po`)),
    get<string>('theme').then(
      (storedTheme) => (document.body.dataset.theme = storedTheme || 'system'),
    ),
    import('./containers/shell/shell.component'),
  ]),
);
