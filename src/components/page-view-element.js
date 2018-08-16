import { LitElement } from '@polymer/lit-element';

/**
 * A base class for building elements that act as a page
 * (i.e. that should dynamically appear and disappear)
 */
export class PageViewElement extends LitElement {
  static properties = {
    active: Boolean,
  };

  _shouldRender({ active }) {
    return !!active;
  }
}
