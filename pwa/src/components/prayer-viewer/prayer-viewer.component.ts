import { customElement, property } from 'lit-element';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../pages/page-view-element';
import { cacheAndNetwork, APIResponse } from '../../helpers/cache-and-network';

import sharedStyles from '../shared.styles';
import styles from './prayer-viewer.styles';
import template from './prayer-viewer.template';

import { apiUrl } from '../../config/default.json';

export interface Prayer {
  slug: string;
  title: {
    it?: string;
    la?: string;
    de?: string;
    en?: string;
    pt?: string;
  };
  content: {
    it?: string;
    la?: string;
    de?: string;
    en?: string;
    pt?: string;
  };
}

@customElement('prayer-viewer')
export class PrayerViewer extends localize(withTopAppBar(PageViewElement)) {
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
    for await (const status of cacheAndNetwork<Prayer>(
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
