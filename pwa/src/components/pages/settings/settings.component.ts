import { customElement, queryAll, PropertyValues } from 'lit-element';
import { updateMetadata } from 'pwa-helpers';
import { localize, SupportedLocale } from '../../../helpers/localize';
import { withTopAppBar } from '../../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';
import { set } from '../../../helpers/keyval';

import sharedStyles from '../../shared.styles';
import styles from './settings.styles';
import template from './settings.template';

import type { OutlinedSelect } from '../../outlined-select/outlined-select.component';

import firebase from 'firebase/app';

const analytics = firebase.analytics();

@customElement('settings-page')
export class SettingsPage extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @queryAll('outlined-select')
  private _selects?: NodeList;

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('active') && this.active) {
      const pageTitle = `Ancillapp - ${this.localeData.settings}`;

      updateMetadata({
        title: pageTitle,
        description: this.localeData.settingsDescription,
      });

      analytics.logEvent('page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: window.location.pathname,
        offline: false,
      });
    }
  }

  protected async _handleThemeChange({ target }: CustomEvent<null>) {
    const newTheme = (target as OutlinedSelect).value;
    document.body.dataset.theme = newTheme;
    await set('theme', newTheme);
  }

  protected async _handleLanguageChange({ target }: CustomEvent<null>) {
    const newLanguage = (target as OutlinedSelect).value as SupportedLocale;
    await this.setLocale(newLanguage);
    this._selects!.forEach((select) => {
      if (select !== target) {
        (select as OutlinedSelect).requestUpdate();
      }
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'settings-page': SettingsPage;
  }
}
