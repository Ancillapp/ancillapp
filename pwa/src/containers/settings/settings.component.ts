import { PropertyValues } from 'lit';
import { customElement, property, queryAll, state } from 'lit/decorators.js';
import { updateMetadata } from 'pwa-helpers';
import { localize, SupportedLocale } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';
import { get, set } from '../../helpers/keyval';
import { init } from '../../helpers/database';
import { t } from '@lingui/core/macro';
import type { Switch } from 'mdui';

import sharedStyles from '../../shared.styles.scss';
import styles from './settings.styles.scss';
import template from './settings.template';

import { logEvent } from '../../helpers/firebase';

@customElement('settings-page')
export class SettingsPage extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: Boolean, reflect: true, attribute: 'keep-screen-active' })
  public keepScreenActive = false;

  @property({ type: Boolean })
  public showChangelog = true;

  @state()
  public textSize = 100;

  @state()
  public offlineContentSummary = '';

  @state()
  public clearingCache = false;

  @state()
  public currentTheme = 'system';

  @queryAll('mdui-select')
  private _selects?: NodeListOf<Element>;

  constructor() {
    super();
    this.currentTheme = document.body.dataset.theme || 'system';

    get<boolean>('dontShowChangelog').then(
      (dontShowChangelog) => (this.showChangelog = !dontShowChangelog),
    );

    get<number>('textSize').then((storedTextSize) => {
      if (typeof storedTextSize === 'number') {
        this.textSize = this._normalizeTextSize(storedTextSize);
        this._applyTextSize(this.textSize);
      }
    });

    this._refreshOfflineContentSummary();
  }

  protected get _resolvedThemeSegment(): 'system' | 'light' | 'dark' {
    return this.currentTheme.endsWith('-hc')
      ? (this.currentTheme.slice(0, -3) as 'system' | 'light' | 'dark')
      : (this.currentTheme as 'system' | 'light' | 'dark');
  }

  protected get _highContrastEnabled() {
    return this.currentTheme.endsWith('-hc');
  }

  protected _composeTheme(
    baseTheme: 'system' | 'light' | 'dark',
    highContrast: boolean,
  ) {
    return highContrast ? `${baseTheme}-hc` : baseTheme;
  }

  protected async _applyTheme(theme: string) {
    const mduiTheme = {
      system: 'auto',
      light: 'light',
      dark: 'dark',
      'light-hc': 'light',
      'dark-hc': 'dark',
      'system-hc': 'auto',
    }[theme];

    document.body.dataset.theme = theme;
    document.documentElement.className = `mdui-theme-${mduiTheme}`;
    this.currentTheme = theme;
    await set('theme', theme);
  }

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

    logEvent('page_view', {
      page_title: pageTitle,
      page_location: window.location.href,
      page_path: window.location.pathname,
    });
  }

  protected async _handleThemeChange({ target }: Event) {
    const selectedTheme = String(
      (target as { value?: string }).value || this._resolvedThemeSegment,
    ) as 'system' | 'light' | 'dark';

    await this._applyTheme(
      this._composeTheme(selectedTheme, this._highContrastEnabled),
    );
  }

  protected async _handleHighContrastChange({ target }: Event) {
    const highContrast = !!(target as Switch).checked;

    await this._applyTheme(
      this._composeTheme(this._resolvedThemeSegment, highContrast),
    );
  }

  protected async _handleLanguageChange({ target }: Event) {
    const newLanguage = String(
      (target as { value?: string }).value || this.locale,
    ) as SupportedLocale;

    await this.setLocale(newLanguage);

    this._updatePageMetadata();
    this._refreshOfflineContentSummary();

    this._selects!.forEach((select) => {
      if (select !== target) {
        (select as { requestUpdate?: () => void }).requestUpdate?.();
      }
    });
  }

  protected _normalizeTextSize(size: number) {
    return Math.min(125, Math.max(75, Math.round(size / 5) * 5));
  }

  protected _applyTextSize(size: number) {
    document.documentElement.style.fontSize = `${size}%`;
  }

  protected _handleTextSizeInput({ target }: Event) {
    const size = this._normalizeTextSize(
      Number((target as { value?: number }).value || this.textSize),
    );

    this.textSize = size;
    this._applyTextSize(size);
  }

  protected async _handleTextSizeChange() {
    await set('textSize', this.textSize);
  }

  protected async _refreshOfflineContentSummary() {
    if (!('storage' in navigator) || !navigator.storage.estimate) {
      this.offlineContentSummary = this.localize(
        t`settingsStorageUsageUnavailable`,
      );
      return;
    }

    const estimate = await navigator.storage.estimate();
    const usedMb = Math.max(0, Math.round((estimate.usage || 0) / 1024 / 1024));

    this.offlineContentSummary = `${usedMb} ${this.localize(
      t`settingsMbDownloadedSuffix`,
    )}`;
  }

  protected async _handleKeepScreenActiveChange({ target }: Event) {
    const checked = !!(target as Switch).checked;

    this.dispatchEvent(
      new CustomEvent('keepscreenactivechange', {
        detail: checked,
      }),
    );
  }

  protected async _handleShowChangelogChange({ target }: Event) {
    this.showChangelog = !!(target as Switch).checked;

    await set('dontShowChangelog', !this.showChangelog);
  }

  protected async _handleClearCacheClick() {
    if (this.clearingCache) {
      return;
    }

    this.clearingCache = true;

    try {
      const db = await init();
      await Promise.all([
        db.clear('songs'),
        db.clear('prayers'),
        db.clear('magazines'),
      ]);

      if ('caches' in window) {
        const cacheNames = await caches.keys();

        await Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith('ancillapp'))
            .map((cacheName) => caches.delete(cacheName)),
        );
      }
    } finally {
      this.clearingCache = false;
      await this._refreshOfflineContentSummary();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'settings-page': SettingsPage;
  }
}
