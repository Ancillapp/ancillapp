import { customElement, queryAll } from 'lit-element';
import { localize, SupportedLocale } from '../../../helpers/localize';
import { PageViewElement } from '../page-view-element';
import { set } from '../../../helpers/keyval';

import sharedStyles from '../../shared.styles';
import styles from './settings.styles';
import template from './settings.template';

import type { OutlinedSelect } from '../../outlined-select/outlined-select.component';

@customElement('settings-page')
export class SettingsPage extends localize(PageViewElement) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @queryAll('outlined-select')
  private _selects?: NodeList;

  protected async _handleThemeChange({ target }: Event) {
    const newTheme = (target as OutlinedSelect).value;
    document.body.dataset.theme = newTheme;
    await set('theme', newTheme);
  }

  protected async _handleLanguageChange({ target }: Event) {
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
