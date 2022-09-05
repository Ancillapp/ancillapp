import { PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { updateMetadata } from 'pwa-helpers';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';
import { t } from '@lingui/macro';

import sharedStyles from '../../shared.styles';
import styles from './breviary-index.styles';
import template from './breviary-index.template';

import config from '../../config/default.json';

import { logEvent } from '../../helpers/firebase';

const _titlesPromisesCache = new Map<
  string,
  Promise<ReturnType<typeof unsafeHTML>>
>();

@customElement('breviary-index')
export class BreviaryIndex extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String })
  protected _date = new Date().toISOString().slice(0, 10);

  @property({ type: Object })
  protected _titlePromise?: Promise<ReturnType<typeof unsafeHTML>>;

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('_date')) {
      if (!_titlesPromisesCache.has(this._date)) {
        _titlesPromisesCache.set(
          this._date,
          fetch(`${config.apiUrl}/breviary?prayer=title&date=${this._date}`)
            .then((res) => res.text())
            .then((title) => unsafeHTML(title)),
        );
      }

      this._titlePromise = _titlesPromisesCache.get(this._date)!;
    }

    if (changedProperties.has('active') && this.active) {
      const pageTitle = `Ancillapp - ${this.localize(t`breviary`)}`;

      updateMetadata({
        title: pageTitle,
        description: this.localize(t`breviaryDescription`),
      });

      logEvent('page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }
  }

  protected _handleDateChange({ detail: newDate }: CustomEvent<string>) {
    if (!newDate || newDate === this._date) {
      return;
    }

    this._date = newDate;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'breviary-index': BreviaryIndex;
  }
}
