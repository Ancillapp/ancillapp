import { customElement, property } from 'lit-element';
import { updateMetadata } from 'pwa-helpers';
import { localize } from '../../helpers/localize';
import { localizedPages } from '../../helpers/localization';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';

import sharedStyles from '../../shared.styles';
import styles from './ancilla-viewer.styles';
import template from './ancilla-viewer.template';

import { apiUrl } from '../../config/default.json';

import firebase from 'firebase/app';

const analytics = firebase.analytics();

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
export class AncillaViewer extends localize(withTopAppBar(PageViewElement)) {
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
      const ancillaCode = Object.values(localizedPages.latest).includes(value)
        ? 'latest'
        : value;

      this._ancillaPromise = fetch(
        `${apiUrl}/ancillas/${ancillaCode}`,
      ).then((res) => res.json());

      const {
        code,
        name: { [this.locale]: localizedName },
      } = await this._ancillaPromise;

      const pageTitle = `Ancillapp - ${this.localeData.ancillas} - ${localizedName}`;

      updateMetadata({
        title: pageTitle,
        description: this.localeData.ancillaDescription(localizedName),
      });

      analytics.logEvent('page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: window.location.pathname,
        offline: false,
      });

      if (ancillaCode !== code) {
        window.history.replaceState(
          {},
          '',
          this.localizeHref('ancillas', code),
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
