import { customElement, property } from 'lit-element';
import { localize } from '../../helpers/localize';
import { PageViewElement } from '../pages/page-view-element';

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
  protected _prayerPromise: Promise<Prayer> = new Promise(() => {});

  attributeChangedCallback(
    name: string,
    old: string | null,
    value: string | null,
  ) {
    if (this.active && name === 'prayer' && value && old !== value) {
      this._prayerPromise = fetch(`${apiUrl}/prayers/${value}`).then((res) =>
        res.json(),
      );
    }
    super.attributeChangedCallback(name, old, value);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'prayer-viewer': PrayerViewer;
  }
}
