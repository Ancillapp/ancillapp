import { customElement, property, PropertyValues } from 'lit-element';
import { PageViewElement } from '../page-view-element';

import sharedStyles from '../../shared.styles';
import styles from './ancillas.styles';
import template from './ancillas.template';

@customElement('ancillas-page')
export class AncillasPage extends PageViewElement {
  public static styles = [sharedStyles, styles];

  @property({ type: 'String' })
  public subroute?: string;

  protected render = template;

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
