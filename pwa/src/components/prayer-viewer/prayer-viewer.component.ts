import { customElement, property } from 'lit-element';
import { localize } from '../../helpers/localize';
import { PageViewElement } from '../pages/page-view-element';
import {
  staleWhileRevalidate,
  APIResponse,
} from '../../helpers/stale-while-revalidate';

import sharedStyles from '../shared.styles';
import styles from './prayer-viewer.styles';
import template from './prayer-viewer.template';

import { apiUrl } from '../../config/default.json';

export interface Prayer {
  slug: string;
  title: string;
  content: string;
}

@customElement('prayer-viewer')
export class PrayerViewer extends localize(PageViewElement) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String })
  public prayer?: string;

  @property({ type: Object })
  protected _prayerStatus: APIResponse<Prayer> = {
    loading: true,
    refreshing: false,
  };

  private async _fetchPrayer(slug: string) {
    for await (const status of staleWhileRevalidate<Prayer>(
      `${apiUrl}/prayers/${slug}`,
    )) {
      this._prayerStatus = status;
    }
  }

  attributeChangedCallback(
    name: string,
    old: string | null,
    value: string | null,
  ) {
    if (this.active && name === 'prayer' && value && old !== value) {
      this._fetchPrayer(value);
    }
    super.attributeChangedCallback(name, old, value);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'prayer-viewer': PrayerViewer;
  }
}
