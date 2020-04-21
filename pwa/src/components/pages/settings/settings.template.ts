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
              >${this.localeData?.system}</mwc-list-item
            >
            <mwc-list-item value="light"
              >${this.localeData?.light}</mwc-list-item
            >
            <mwc-list-item value="dark">${this.localeData?.dark}</mwc-list-item>
          </mwc-select>
        </li>
      </ul>
    </section>
  `;
}
