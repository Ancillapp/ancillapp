import { customElement } from 'lit-element';
import { localize } from '../../../helpers/localize';
import { PageViewElement } from '../page-view-element';
import { set } from 'idb-keyval';

import sharedStyles from '../../shared.styles';
import styles from './settings.styles';
import template from './settings.template';

import type { Select } from '@material/mwc-select';

@customElement('settings-page')
export class SettingsPage extends localize(PageViewElement) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  protected async _handleThemeChange({ target }: Event) {
    const newTheme = (target as Select).value;
    document.body.dataset.theme = newTheme;
    await set('theme', newTheme);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'settings-page': SettingsPage;
  }
}
