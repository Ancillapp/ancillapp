import { customElement, queryAll, PropertyValues, property } from 'lit-element';
import { updateMetadata } from 'pwa-helpers';
import { localize, SupportedLocale } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';
import { set } from '../../helpers/keyval';
import { t } from '@lingui/macro';

import sharedStyles from '../../shared.styles';
import styles from './settings.styles';
import template from './settings.template';

import type { OutlinedSelect } from '../../components/outlined-select/outlined-select.component';

import firebase from 'firebase/app';

const analytics = firebase.analytics();

@customElement('settings-page')
export class SettingsPage extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: Boolean, reflect: true, attribute: 'keep-screen-active' })
  public keepScreenActive = false;

  @queryAll('outlined-select')
  private _selects?: NodeList;

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('active') && this.active) {
      this._updatePageMetadata();
    }
  }

  protected _updatePageMetadata() {
    const pageTitle = `Ancillapp - ${this.localize(t`settings`)}`;

    updateMetadata({
      title: pageTitle,
      description: this.localize(t`settingsDescription`),
    });

    analytics.logEvent('page_view', {
      page_title: pageTitle,
      page_location: window.location.href,
      page_path: window.location.pathname,
      offline: false,
    });
  }

  protected async _handleThemeChange({ target }: CustomEvent<null>) {
    const newTheme = (target as OutlinedSelect).value;
    document.body.dataset.theme = newTheme;
    await set('theme', newTheme);
  }

  protected async _handleLanguageChange({ target }: CustomEvent<null>) {
    const newLanguage = (target as OutlinedSelect).value as SupportedLocale;

    await this.setLocale(newLanguage);

    this._updatePageMetadata();

    this._selects!.forEach((select) => {
      if (select !== target) {
        (select as OutlinedSelect).requestUpdate();
      }
    });
  }

  protected async _handleKeepScreenActiveChange({ target }: MouseEvent) {
    this.dispatchEvent(
      new CustomEvent('keepscreenactivechange', {
        detail: (target as HTMLInputElement).checked,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'settings-page': SettingsPage;
  }
}
