import { customElement, property, PropertyValues } from 'lit-element';
import { updateMetadata } from 'pwa-helpers';
import { localize } from '../../helpers/localize';
import { localizedPages } from '../../helpers/localization';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';
import { t } from '@lingui/macro';

import sharedStyles from '../../shared.styles';
import styles from './ancilla-viewer.styles';
import template from './ancilla-viewer.template';

import config from '../../config/default.json';

import { logEvent } from '../../helpers/firebase';

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

const _ancillasPromisesCache = new Map<string, Promise<Ancilla>>();

@customElement('ancilla-viewer')
export class AncillaViewer extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String })
  public ancilla?: string;

  @property({ type: Object })
  protected _ancillaPromise: Promise<Ancilla> = new Promise(() => {});

  protected async updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (this.active && changedProperties.has('ancilla') && this.ancilla) {
      const ancillaCode = Object.values(localizedPages.latest).includes(
        this.ancilla,
      )
        ? 'latest'
        : this.ancilla;

      if (!_ancillasPromisesCache.has(ancillaCode)) {
        _ancillasPromisesCache.set(
          ancillaCode,
          fetch(`${config.apiUrl}/ancillas/${ancillaCode}`).then((res) =>
            res.json(),
          ),
        );
      }

      this._ancillaPromise = _ancillasPromisesCache.get(ancillaCode)!;

      if (changedProperties.has('active')) {
        const {
          code,
          name: { [this.locale]: name },
        } = await this._ancillaPromise;

        const pageTitle = `Ancillapp - ${this.localize(t`ancillas`)} - ${name}`;

        updateMetadata({
          title: pageTitle,
          description: this.localize(t`ancillaDescription ${name}`),
        });

        logEvent('page_view', {
          page_title: pageTitle,
          page_location: window.location.href,
          page_path: window.location.pathname,
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
}

declare global {
  interface HTMLElementTagNameMap {
    'ancilla-viewer': AncillaViewer;
  }
}
