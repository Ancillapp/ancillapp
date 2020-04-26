import { html } from 'lit-element';
import { SettingsPage } from './settings.component';

import '@material/mwc-select';

export default function template(this: SettingsPage) {
  return html`
    <section>
      <ul>
        <li>
          <label for="theme">${this.localeData?.theme}</label>
          <mwc-select
            id="theme"
            outlined
            @change=${this._handleThemeChange}
            value="${document.body.dataset.theme || 'system'}"
          >
            <mwc-list-item value="system"
              >${this.localeData?.system || 'System'}</mwc-list-item
            >
            <mwc-list-item value="light"
              >${this.localeData?.light || 'Light'}</mwc-list-item
            >
            <mwc-list-item value="dark"
              >${this.localeData?.dark || 'Dark'}</mwc-list-item
            >
          </mwc-select>
        </li>
        <li>
          <label for="language">${this.localeData?.language}</label>
          <mwc-select
            id="language"
            outlined
            @change=${this._handleLanguageChange}
            value="${this.locale}"
          >
            <mwc-list-item value="it">Italiano</mwc-list-item>
            <mwc-list-item value="en">English</mwc-list-item>
            <mwc-list-item value="de">Deutsch</mwc-list-item>
            <mwc-list-item value="pt">Português</mwc-list-item>
          </mwc-select>
        </li>
      </ul>
    </section>
  `;
}
