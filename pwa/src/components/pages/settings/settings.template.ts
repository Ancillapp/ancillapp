import { html } from 'lit-element';
import { SettingsPage } from './settings.component';

import '../../outlined-select/outlined-select.component';

export default function template(this: SettingsPage) {
  return html`
    <section>
      <ul>
        <li>
          <label for="theme">${this.localeData?.theme}</label>
          <outlined-select
            id="theme"
            @change=${this._handleThemeChange}
            value="${document.body.dataset.theme || 'system'}"
          >
            <option value="system"
              >${this.localeData?.system || 'System'}</option
            >
            <option value="light">${this.localeData?.light || 'Light'}</option>
            <option value="dark">${this.localeData?.dark || 'Dark'}</option>
          </outlined-select>
        </li>
        <li>
          <label for="language">${this.localeData?.language}</label>
          <outlined-select
            id="language"
            @change=${this._handleLanguageChange}
            value="${this.locale}"
          >
            <option value="it">Italiano</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="pt">Português</option>
          </outlined-select>
        </li>
      </ul>
    </section>
  `;
}
