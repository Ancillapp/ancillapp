import { html, nothing } from 'lit';
import { SettingsPage } from './settings.component';
import { t } from '@lingui/core/macro';

import 'mdui/components/top-app-bar/top-app-bar.js';
import 'mdui/components/top-app-bar/top-app-bar-title.js';
import 'mdui/components/button-icon.js';
import 'mdui/components/button.js';
import 'mdui/components/card.js';
import 'mdui/components/divider.js';
import 'mdui/components/menu-item.js';
import 'mdui/components/segmented-button-group.js';
import 'mdui/components/segmented-button.js';
import 'mdui/components/select.js';
import 'mdui/components/slider.js';
import 'mdui/components/switch.js';
import '../../components/top-app-bar/top-app-bar.component.js';
import '../../components/ancillapp-icon.component.js';

const SUPPORTS_WAKE_LOCK = 'wakeLock' in navigator;

export default function template(this: SettingsPage) {
  return html`
    <mdui-top-app-bar
      scroll-behavior="hide"
      .scrollTarget="${this.scrollTarget}"
    >
      <mdui-button-icon
        ?hidden="${!this.showMenuButton}"
        @click="${() => this.dispatchEvent(new CustomEvent('menutoggle'))}"
        aria-label="${this.localize(t`menu`)}"
      >
        <ancillapp-icon name="menu"></ancillapp-icon>
      </mdui-button-icon>
      <mdui-top-app-bar-title>
        ${this.localize(t`settings`)}
      </mdui-top-app-bar-title>
    </mdui-top-app-bar>

    <section>
      <h2 class="settings-section-title">
        ${this.localize(t`settingsAppearance`)}
      </h2>
      <mdui-card>
        <div class="settings-row">
          <div class="settings-copy">
            <p class="settings-label">${this.localize(t`theme`)}</p>
            <p class="settings-description">
              ${this.localize(t`settingsThemeDescription`)}
            </p>
          </div>
          <mdui-segmented-button-group
            class="settings-control theme-switch"
            selects="single"
            required
            full-width
            .value="${this._resolvedThemeSegment}"
            @change="${this._handleThemeChange}"
          >
            <mdui-segmented-button value="light">
              ${this.localize(t`light`)}
            </mdui-segmented-button>
            <mdui-segmented-button value="system">
              ${this.localize(t`system`)}
            </mdui-segmented-button>
            <mdui-segmented-button value="dark">
              ${this.localize(t`dark`)}
            </mdui-segmented-button>
          </mdui-segmented-button-group>
        </div>

        <mdui-divider></mdui-divider>

        <div class="settings-row">
          <div class="settings-copy">
            <p class="settings-label">
              ${this.localize(t`settingsEnableHighContrast`)}
            </p>
            <p class="settings-description">
              ${this.localize(t`settingsEnableHighContrastDescription`)}
            </p>
          </div>
          <mdui-switch
            class="settings-control switch-control"
            @change="${this._handleHighContrastChange}"
            ?checked="${this._highContrastEnabled}"
          ></mdui-switch>
        </div>

        <mdui-divider></mdui-divider>

        <div class="settings-row">
          <div class="settings-copy">
            <p class="settings-label">${this.localize(t`language`)}</p>
            <p class="settings-description">
              ${this.localize(t`settingsLanguageDescription`)}
            </p>
          </div>
          <mdui-select
            class="settings-control language-select"
            variant="outlined"
            value="${this.locale}"
            @change="${this._handleLanguageChange}"
          >
            <ancillapp-icon name="dropdown" slot="end-icon"></ancillapp-icon>
            <mdui-menu-item value="it">Italiano</mdui-menu-item>
            <mdui-menu-item value="en">English</mdui-menu-item>
            <mdui-menu-item value="de">Deutsch</mdui-menu-item>
            <mdui-menu-item value="pt">Português</mdui-menu-item>
          </mdui-select>
        </div>

        <mdui-divider></mdui-divider>

        <div class="settings-row">
          <div class="settings-copy">
            <p class="settings-label">${this.localize(t`settingsTextSize`)}</p>
            <p class="settings-description">
              ${this.localize(t`settingsTextSizeDescription`)}
            </p>
          </div>
          <div class="settings-control slider-control">
            <span class="slider-label slider-label-small">A</span>
            <mdui-slider
              min="75"
              max="125"
              step="5"
              nolabel
              .value="${this.textSize}"
              @input="${this._handleTextSizeInput}"
              @change="${this._handleTextSizeChange}"
            ></mdui-slider>
            <span class="slider-label slider-label-large">A</span>
          </div>
        </div>
      </mdui-card>

      <h2 class="settings-section-title">
        ${this.localize(t`settingsReading`)}
      </h2>
      <mdui-card>
        ${SUPPORTS_WAKE_LOCK
          ? html`
              <div class="settings-row">
                <div class="settings-copy">
                  <p class="settings-label">
                    ${this.localize(t`keepScreenActive`)}
                  </p>
                  <p class="settings-description">
                    ${this.localize(t`settingsKeepScreenActiveDescription`)}
                  </p>
                </div>
                <mdui-switch
                  class="settings-control switch-control"
                  @change="${this._handleKeepScreenActiveChange}"
                  ?checked="${this.keepScreenActive}"
                ></mdui-switch>
              </div>

              <mdui-divider></mdui-divider>
            `
          : nothing}

        <div class="settings-row">
          <div class="settings-copy">
            <p class="settings-label">${this.localize(t`showChangelog`)}</p>
            <p class="settings-description">
              ${this.localize(t`settingsShowChangelogDescription`)}
            </p>
          </div>
          <mdui-switch
            class="settings-control switch-control"
            @change="${this._handleShowChangelogChange}"
            ?checked="${this.showChangelog}"
          ></mdui-switch>
        </div>
      </mdui-card>

      <h2 class="settings-section-title">${this.localize(t`settingsData`)}</h2>
      <mdui-card>
        <div class="settings-row">
          <div class="settings-copy">
            <p class="settings-label">
              ${this.localize(t`settingsOfflineContent`)}
            </p>
            <p class="settings-description">${this.offlineContentSummary}</p>
          </div>
          <!-- TODO -->
          <mdui-button
            class="settings-control"
            variant="tonal"
            href="${this.localizeHref('magazines')}"
          >
            ${this.localize(t`settingsManage`)}
          </mdui-button>
        </div>

        <mdui-divider></mdui-divider>

        <div class="settings-row">
          <div class="settings-copy">
            <p class="settings-label">
              ${this.localize(t`settingsClearCache`)}
            </p>
            <p class="settings-description">
              ${this.localize(t`settingsClearCacheDescription`)}
            </p>
          </div>
          <mdui-button
            class="settings-control danger-action"
            variant="text"
            ?loading="${this.clearingCache}"
            @click="${this._handleClearCacheClick}"
          >
            ${this.localize(t`settingsClear`)}
          </mdui-button>
        </div>
      </mdui-card>
    </section>
  `;
}
