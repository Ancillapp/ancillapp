import { PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { updateMetadata } from 'pwa-helpers';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';
import { t } from '@lingui/macro';

import sharedStyles from '../../shared.styles';
import styles from './breviary-placeholder.styles';
import template from './breviary-placeholder.template';

import { logEvent } from '../../helpers/firebase';

@customElement('breviary-placeholder')
export class BreviaryPlaceholder extends localize(
  withTopAppBar(PageViewElement),
) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String })
  protected _date = new Date().toISOString().slice(0, 10);

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

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
}

declare global {
  interface HTMLElementTagNameMap {
    'breviary-placeholder': BreviaryPlaceholder;
  }
}
