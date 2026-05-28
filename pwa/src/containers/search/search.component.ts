import { PropertyValues } from 'lit';
import { customElement } from 'lit/decorators.js';
import { updateMetadata } from 'pwa-helpers';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';
import { t } from '@lingui/core/macro';

import sharedStyles from '../../shared.styles.scss';
import styles from './search.styles.scss';
import template from './search.template';

import { logEvent } from '../../helpers/firebase';

@customElement('search-page')
export class SearchPage extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('active') && this.active) {
      const pageTitle = `Ancillapp - ${this.localize(t`search`)}`;

      updateMetadata({
        title: pageTitle,
        description: this.localize(t`searchDescription`),
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
    'search-page': SearchPage;
  }
}
