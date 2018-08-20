import { LocalizedLitElement } from '@dabolus/localized-lit-element';

/**
 * A base class for building elements that act as a page
 * (i.e. that should dynamically appear and disappear)
 */
export class PageViewElement extends LocalizedLitElement {
  static properties = {
    active: Boolean,
  };

  _shouldRender({ active }) {
    return !!active;
  }
}
