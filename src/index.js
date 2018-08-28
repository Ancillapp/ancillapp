/* global WebComponents */

// Styles
// import './styles/main';

// Feature detect which polyfill needs to be imported.
const needsTemplate = (() => {
  // no real <template> because no `content` property (IE and older browsers)
  const t = document.createElement('template');
  if (!('content' in t)) {
    return true;
  }
  // broken doc fragment (older Edge)
  if (!(t.content.cloneNode() instanceof DocumentFragment)) {
    return true;
  }
  // broken <template> cloning (Edge up to at least version 17)
  const t2 = document.createElement('template');
  t2.content.appendChild(document.createElement('div'));
  t.content.appendChild(t2);
  const clone = t.cloneNode(true);
  return (clone.content.childNodes.length === 0 ||
    clone.content.firstChild.content.childNodes.length === 0);
})();

let polyfills = [];

if (!('attachShadow' in Element.prototype && 'getRootNode' in Element.prototype) ||
  (window.ShadyDOM && window.ShadyDOM.force)) {
  polyfills.push('sd');
}
if (!window.customElements || window.customElements.forcePolyfill) {
  polyfills.push('ce');
}

// NOTE: any browser that does not have template or ES6 features
// must load the full suite of polyfills.
if (!window.Promise || !Array.from || !window.URL || !window.Symbol || needsTemplate) {
  polyfills = ['sd-ce-pf'];
}

// Note that in this case we need to append the .js extension, otherwise
// Webpack will try to load the .js.map files into the bundle too.
(polyfills.length ? import(`@webcomponents/webcomponentsjs/bundles/${polyfills.join('-')}.js`) : Promise.resolve())
  .then(() => import('./components/shell/element'));
