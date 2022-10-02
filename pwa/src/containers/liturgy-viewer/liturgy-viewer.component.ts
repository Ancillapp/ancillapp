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
import '../../components/date-input/date-input.component';

import config from '../../config/default.json';
import { logEvent } from '../../helpers/firebase';
import { GetLiturgyResult } from '../../models/holy-mass';
import { requiredDateConverter } from '../../helpers/converters';
import { debounce, toLocalTimeZone } from '../../helpers/utils';
import { navigateTo } from '../../helpers/router';

const _prayersPromisesCache = new Map<string, Promise<GetLiturgyResult>>();

@customElement('liturgy-viewer')
export class LiturgyViewer extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ converter: requiredDateConverter })
  public day!: Date;

  @state()
  protected _breviaryPromise: Promise<GetLiturgyResult> = new Promise(
    () => undefined,
  );

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (
      (changedProperties.has('active') || changedProperties.has('day')) &&
      this.active &&
      this.day
    ) {
      const stringDay = toLocalTimeZone(this.day).toISOString().slice(0, 10);
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

      const day = toLocalTimeZone(this.day).toLocaleDateString(this.locale, {
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

  protected _handleDayChange = debounce(({ detail }: CustomEvent<Date>) => {
    const newYear = detail.getFullYear();
    const newMonth = detail.getMonth();
    const newDay = detail.getDate();
    const now = new Date();

    navigateTo(
      now.getFullYear() === newYear &&
        now.getMonth() === newMonth &&
        now.getDate() === newDay
        ? this.localizeHref('holy-mass')
        : [
            this.localizeHref('holy-mass'),
            newYear,
            (newMonth + 1).toString().padStart(2, '0'),
            newDay.toString().padStart(2, '0'),
          ].join('/'),
    );

    this.day = detail;
  }, 1000);
}

declare global {
  interface HTMLElementTagNameMap {
    'liturgy-viewer': LiturgyViewer;
  }
}
