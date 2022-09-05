import { html, nothing } from 'lit';
import { SettingsPage } from './settings.component';
import { menu } from '../../components/icons';
import { t } from '@lingui/macro';

import '@material/mwc-checkbox';
import '@material/mwc-formfield';
import '../../components/top-app-bar/top-app-bar.component';
import '../../components/outlined-select/outlined-select.component';

const SUPPORTS_WAKE_LOCK = 'wakeLock' in navigator;

export default function template(this: SettingsPage) {
  return html`
    <top-app-bar ?drawer-open="${this.drawerOpen}">
      <mwc-icon-button
        slot="leadingIcon"
        ?hidden="${!this.showMenuButton}"
        @click="${() => this.dispatchEvent(new CustomEvent('menutoggle'))}"
        label="${this.localize(t`menu`)}"
      >
        ${menu}
      </mwc-icon-button>
      <div slot="title">${this.localize(t`settings`)}</div>
    </top-app-bar>

    <section>
      <ul class="settings">
        <li>
          <label for="theme">${this.localize(t`theme`)}</label>
          <outlined-select
            select-id="theme"
            @change=${this._handleThemeChange}
            value="${document.body.dataset.theme || 'system'}"
          >
            <option value="system">
              ${this.localize(t`system`) || 'System'}
            </option>
            <option value="light">${this.localize(t`light`) || 'Light'}</option>
            <option value="dark">${this.localize(t`dark`) || 'Dark'}</option>
            <option value="oled">OLED</option>
          </outlined-select>
        </li>
        <li>
          <label for="language">${this.localize(t`language`)}</label>
          <outlined-select
            select-id="language"
            @change=${this._handleLanguageChange}
            value="${this.locale}"
          >
            <option value="it">Italiano</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="pt">Português</option>
          </outlined-select>
        </li>
        ${SUPPORTS_WAKE_LOCK
          ? html`
              <li>
                <mwc-formfield
                  label="${this.localize(t`keepScreenActive`)}"
                  alignEnd
                  spaceBetween
                >
                  <mwc-checkbox
                    @change="${this._handleKeepScreenActiveChange}"
                    ?checked="${this.keepScreenActive}"
                  ></mwc-checkbox>
                </mwc-formfield>
              </li>
            `
          : html`${nothing}`}
        <li>
          <mwc-formfield
            label="${this.localize(t`showChangelog`)}"
            alignEnd
            spaceBetween
          >
            <mwc-checkbox
              @change="${this._handleShowChangelogChange}"
              ?checked="${this.showChangelog}"
            ></mwc-checkbox>
          </mwc-formfield>
        </li>
      </ul>
    </section>
  `;
}
