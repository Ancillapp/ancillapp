import {
  LitElement,
  customElement,
  property,
  PropertyValues,
} from 'lit-element';

import sharedStyles from '../../shared.styles';
import styles from './ancillas.styles';
import template from './ancillas.template';

@customElement('ancillas-page')
export class AncillasPage extends LitElement {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: Boolean, reflect: true })
  public active = false;

  @property({ type: 'String' })
  public subroute?: string;

  @property({ type: Boolean, attribute: 'drawer-open' })
  public drawerOpen = false;

  @property({ type: Object })
  public scrollTarget?: HTMLElement;

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (this.scrollTarget && this.shadowRoot!.firstElementChild) {
      (this.shadowRoot!.firstElementChild as Element & {
        scrollTarget: HTMLElement | undefined;
      }).scrollTarget = this.scrollTarget;
    }
  }

  constructor() {
    super();

    const pdfRendererLink = 'https://mozilla.github.io/pdf.js/web/viewer.html';

    if (
      !document.querySelector(`link[rel='preload'][href='${pdfRendererLink}']`)
    ) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'document';
      link.href = pdfRendererLink;
      document.head.appendChild(link);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ancillas-page': AncillasPage;
  }
}
