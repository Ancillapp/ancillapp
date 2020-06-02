import { customElement, PropertyValues } from 'lit-element';
import { updateMetadata } from 'pwa-helpers';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';

import sharedStyles from '../../shared.styles';
import styles from './info.styles';
import template from './info.template';

import firebase from 'firebase/app';

const analytics = firebase.analytics();

@customElement('info-page')
export class InfoPage extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('active') && this.active) {
      const pageTitle = `Ancillapp - ${this.localeData.info}`;

      updateMetadata({
        title: pageTitle,
        description: this.localeData.infoDescription,
      });

      analytics.logEvent('page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: window.location.pathname,
        offline: false,
      });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'info-page': InfoPage;
  }
}
