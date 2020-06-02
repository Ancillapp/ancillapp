import { customElement, property, PropertyValues } from 'lit-element';
import { updateMetadata } from 'pwa-helpers';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../pages/page-view-element';
import { refresh } from '../icons';

import sharedStyles from '../shared.styles';
import styles from './breviary-viewer.styles';
import template from './breviary-viewer.template';
import '@material/mwc-icon-button';

import { apiUrl } from '../../config/default.json';

import firebase from 'firebase/app';

const analytics = firebase.analytics();

@customElement('breviary-viewer')
export class BreviaryViewer extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String })
  public query?: string;

  @property({ type: Object })
  protected _breviaryPromise: Promise<string> = new Promise(() => {});

  private _alternatives: HTMLDivElement[] = [];

  private _currentAlternative = 0;

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('active') && this.active) {
      const pageTitle = `Ancillapp - ${this.localeData.breviary}`;

      updateMetadata({
        title: pageTitle,
        description: this.localeData.breviaryDescription,
      });

      analytics.logEvent('page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: window.location.pathname,
        offline: false,
      });
    }
  }

  attributeChangedCallback(
    name: string,
    old: string | null,
    value: string | null,
  ) {
    if (this.active && name === 'query' && value && old !== value) {
      const [
        prayer,
        date = new Date().toISOString().slice(0, 10),
      ] = value.split('/');

      this._breviaryPromise = fetch(
        `${apiUrl}/breviary?prayer=${prayer}&date=${date}`,
      ).then((res) => res.text());

      this._breviaryPromise
        .then(() => this.updateComplete)
        .then(() => {
          this._alternatives = [
            ...this.shadowRoot!.querySelectorAll<HTMLDivElement>(
              '.alternative',
            ),
          ];

          if (this._alternatives.length < 2) {
            return;
          }

          this._alternatives.forEach((alternative) => {
            const heading = alternative.querySelector<HTMLHeadingElement>(
              'h3',
            )!;

            const header = document.createElement('div');
            header.className = 'header';
            header.appendChild(heading);

            const button = document.createElement('mwc-icon-button');
            button.innerHTML = refresh.getHTML();
            button.addEventListener('click', () =>
              this._handleAlternativeChange(),
            );
            header.appendChild(button);

            alternative.insertBefore(header, alternative.firstChild);
          });
          this._currentAlternative = 0;
          this._alternatives[this._currentAlternative].classList.add('active');
        });
    }
    super.attributeChangedCallback(name, old, value);
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
