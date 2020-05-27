import { customElement, property } from 'lit-element';
import { localize } from '../../helpers/localize';
import { PageViewElement } from '../pages/page-view-element';

import sharedStyles from '../shared.styles';
import styles from './ancilla-viewer.styles';
import template from './ancilla-viewer.template';

import { apiUrl } from '../../config/default.json';

export interface Ancilla {
  code: string;
  name: {
    it: string;
    en: string;
    pt: string;
    de: string;
  };
  link: string;
  thumbnail: string;
}

@customElement('ancilla-viewer')
export class AncillaViewer extends localize(PageViewElement) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String })
  public ancilla?: string;

  @property({ type: Object })
  protected _ancillaPromise: Promise<Ancilla> = new Promise(() => {});

  async attributeChangedCallback(
    name: string,
    old: string | null,
    value: string | null,
  ) {
    super.attributeChangedCallback(name, old, value);

    if (this.active && name === 'ancilla' && value && old !== value) {
      this._ancillaPromise = fetch(`${apiUrl}/ancillas/${value}`).then((res) =>
        res.json(),
      );

      const { code } = await this._ancillaPromise;

      if (value !== code) {
        window.history.replaceState(
          {},
          '',
          this.localizeHref('ancilllas', code),
        );
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ancilla-viewer': AncillaViewer;
  }
}
