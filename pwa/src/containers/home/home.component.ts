
import { customElement, PropertyValues } from 'lit-element';
import { updateMetadata } from 'pwa-helpers';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';

import sharedStyles from '../../shared.styles';
import styles from './home.styles';
import template from './home.template';

import firebase from 'firebase/app';

const analytics = firebase.analytics();

@customElement('home-page')
export class HomePage extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('active') && this.active) {
      const pageTitle = `Ancillapp - ${this.localeData.home}`;

      updateMetadata({
        title: pageTitle,
        description: this.localeData.homeDescription,
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
    'home-page': HomePage;
  }
}
