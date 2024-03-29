import { PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { updateMetadata } from 'pwa-helpers';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';
import { refresh } from '../../components/icons';
import { t } from '@lingui/macro';

import sharedStyles from '../../shared.styles';
import styles from './breviary-viewer.styles';
import template from './breviary-viewer.template';
import '@material/mwc-icon-button';

import config from '../../config/default.json';
import { logEvent } from '../../helpers/firebase';
import { localizedPages } from '../../helpers/localization';

import { prayersTranslations } from '../breviary-index/breviary-index.template';

const _prayersPromisesCache = new Map<string, Promise<string>>();

const descriptions = {
  invitatory: (date: string) => t`invitatoryDescription ${date}`,
  matins: (date: string) => t`matinsDescription ${date}`,
  lauds: (date: string) => t`laudsDescription ${date}`,
  terce: (date: string) => t`terceDescription ${date}`,
  sext: (date: string) => t`sextDescription ${date}`,
  none: (date: string) => t`noneDescription ${date}`,
  vespers: (date: string) => t`vespersDescription ${date}`,
  compline: (date: string) => t`complineDescription ${date}`,
};

const { invitatory, matins, lauds, terce, sext, none, vespers, compline } =
  localizedPages;

export const localizedPrayerToKeyMap: Record<string, string> = Object.entries({
  invitatory,
  matins,
  lauds,
  terce,
  sext,
  none,
  vespers,
  compline,
}).reduce(
  (map, [key, localizedPrayers]) => ({
    ...map,
    ...Object.values(localizedPrayers).reduce(
      (acc, localizedPrayer) => ({
        ...acc,
        [localizedPrayer]: key,
      }),
      {},
    ),
  }),
  {},
);

@customElement('breviary-viewer')
export class BreviaryViewer extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String })
  public query?: string;

  @property({ type: Object })
  protected _breviaryPromise: Promise<string> = new Promise(() => undefined);

  private _alternatives: HTMLDivElement[] = [];

  private _currentAlternative = 0;

  protected firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);

    const observer = new MutationObserver(() => {
      this._alternatives = [
        ...this.shadowRoot!.querySelectorAll<HTMLDivElement>('.alternative'),
      ];

      if (this._alternatives.length < 2) {
        return;
      }

      this._alternatives.forEach((alternative) => {
        const heading = alternative.querySelector<HTMLHeadingElement>('h3')!;

        const header = document.createElement('div');
        header.className = 'header';
        header.appendChild(heading);

        const button = document.createElement('mwc-icon-button');
        button.innerHTML = `${refresh}`;
        button.ariaLabel = this.localize(t`switchAlternative`);
        button.addEventListener('click', () => this._handleAlternativeChange());
        header.appendChild(button);

        alternative.insertBefore(header, alternative.firstChild);
      });
      this._currentAlternative = 0;
      this._alternatives[this._currentAlternative].classList.add('active');
    });
    observer.observe(this.shadowRoot!, { childList: true });
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('query') && this.query) {
      if (!_prayersPromisesCache.has(this.query)) {
        const [prayer, date = new Date().toISOString().slice(0, 10)] =
          this.query.split('/');

        _prayersPromisesCache.set(
          this.query,
          fetch(
            `${config.apiUrl}/breviary?prayer=${localizedPrayerToKeyMap[prayer]}&date=${date}`,
          ).then((res) => res.text()),
        );
      }

      this._breviaryPromise = _prayersPromisesCache.get(this.query)!;
    }

    if (changedProperties.has('active') && this.active && this.query) {
      const [rawPrayer, rawDate = new Date().toISOString().slice(0, 10)] =
        this.query.split('/');

      const prayer = localizedPrayerToKeyMap[rawPrayer];
      const date = Intl.DateTimeFormat(this.locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(rawDate));

      const pageTitle = `Ancillapp - ${this.localize(t`breviary`)} - ${
        prayersTranslations[prayer as keyof typeof prayersTranslations]
      } - ${date}`;

      updateMetadata({
        title: pageTitle,
        description: descriptions[prayer as keyof typeof descriptions](date),
      });

      logEvent('page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }
  }

  _handleAlternativeChange() {
    if (this._alternatives.length < 1) {
      return;
    }

    this._alternatives[this._currentAlternative].classList.remove('active');

    this._currentAlternative =
      (this._currentAlternative + 1) % this._alternatives.length;

    this._alternatives[this._currentAlternative].classList.add('active');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'breviary-viewer': BreviaryViewer;
  }
}
