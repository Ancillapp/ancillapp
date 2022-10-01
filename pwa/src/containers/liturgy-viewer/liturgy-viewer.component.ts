import { PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { updateMetadata } from 'pwa-helpers';
import { t } from '@lingui/macro';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';

import sharedStyles from '../../shared.styles';
import styles from './liturgy-viewer.styles';
import template from './liturgy-viewer.template';
import '@material/mwc-icon-button';

import config from '../../config/default.json';
import { logEvent } from '../../helpers/firebase';
import { GetLiturgyResult } from '../../models/holy-mass';

const _prayersPromisesCache = new Map<string, Promise<GetLiturgyResult>>();

@customElement('liturgy-viewer')
export class LiturgyViewer extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({
    converter: {
      fromAttribute: (value) => (value ? new Date(value) : new Date()),
      toAttribute: (value: Date | null) =>
        value ? value.toISOString().slice(0, 10) : value,
    },
  })
  public day!: Date;

  @state()
  protected _breviaryPromise: Promise<GetLiturgyResult> = new Promise(
    () => undefined,
  );

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('active') && this.active && this.day) {
      const stringDay = this.day.toISOString().slice(0, 10);
      const cacheId = `${stringDay}-${this.locale}`;
      if (!_prayersPromisesCache.has(cacheId)) {
        _prayersPromisesCache.set(
          cacheId,
          fetch(
            `${config.apiUrl}/holy-masses/liturgy?date=${stringDay}&language=${this.locale}`,
          ).then((res) => res.json()),
        );
      }

      this._breviaryPromise = _prayersPromisesCache.get(cacheId)!;

      const day = this.day.toLocaleDateString(this.locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      const pageTitle = `Ancillapp - ${this.localize(
        t`liturgyOfTheDay`,
      )} - ${day}`;
      const pageDescription = this.localize(
        t`liturgyOfTheDayDescription ${day}`,
      );

      updateMetadata({
        title: pageTitle,
        description: pageDescription,
      });

      logEvent('page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'liturgy-viewer': LiturgyViewer;
  }
}
