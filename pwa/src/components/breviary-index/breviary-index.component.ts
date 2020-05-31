import { customElement, property, PropertyValues } from 'lit-element';
import type { Part } from 'lit-html';
import { updateMetadata } from 'pwa-helpers';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../pages/page-view-element';

import sharedStyles from '../shared.styles';
import styles from './breviary-index.styles';
import template from './breviary-index.template';

import { apiUrl } from '../../config/default.json';

import firebase from 'firebase/app';

const analytics = firebase.analytics();

const _titlesPromisesCache = new Map<string, Promise<(part: Part) => void>>();

@customElement('breviary-index')
export class BreviaryIndex extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String })
  protected _date = new Date().toISOString().slice(0, 10);

  @property({ type: Object })
  protected _titlePromise?: Promise<(part: Part) => void>;

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('_date')) {
      if (!_titlesPromisesCache.has(this._date)) {
        _titlesPromisesCache.set(
          this._date,
          fetch(`${apiUrl}/breviary?prayer=title&date=${this._date}`)
            .then((res) => res.text())
            .then((title) => unsafeHTML(title)),
        );
      }

      this._titlePromise = _titlesPromisesCache.get(this._date)!;
    }

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
