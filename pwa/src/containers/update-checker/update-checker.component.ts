import { customElement, LitElement, property } from 'lit-element';
import { localize } from '../../helpers/localize';
import { get, set } from '../../helpers/keyval';
import { version as currentAppVersion } from '../../../../CHANGELOG.md';

import sharedStyles from '../../shared.styles';
import styles from './update-checker.styles';
import template from './update-checker.template';

import type { Checkbox } from '@material/mwc-checkbox';

import { logEvent } from '../../helpers/firebase';

@customElement('update-checker')
export class UpdateChecker extends localize(LitElement) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: Boolean })
  protected _updateNotificationShown = false;

  @property({ type: Boolean })
  protected _updatingApp = false;

  @property({ type: Boolean })
  protected _changelogAvailable = false;

  @property({ type: Boolean })
  protected _dontShowChangelog = false;

  private _newSw?: ServiceWorker = undefined;

  constructor() {
    super();
    console.log('test');

    this._checkForUpdates();

    Promise.all([
      get<boolean>('changelogAvailable'),
      get<boolean>('dontShowChangelog'),
    ]).then(async ([changelogAvailable, dontShowChangelog]) => {
      this._dontShowChangelog = dontShowChangelog;

      if (changelogAvailable && !dontShowChangelog) {
        await Promise.all([
          import('@material/mwc-dialog'),
          import('@material/mwc-formfield'),
          import('@material/mwc-checkbox'),
          import('@material/mwc-button'),
        ]);

        this._changelogAvailable = true;
      }

      await set('changelogAvailable', false);
    });
  }

  protected async _handledontShowChangelogChange({ target }: MouseEvent) {
    this._dontShowChangelog = (target as Checkbox).checked;

    await set('dontShowChangelog', this._dontShowChangelog);
  }

  protected async _checkForUpdates() {
    if (!navigator.serviceWorker.controller) {
      return;
    }
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration) {
      return;
    }
    if (registration.waiting) {
      this._newSw = registration.waiting;

      const newAppVersion = await get('appVersion');

      if (newAppVersion !== currentAppVersion) {
        await Promise.all([
          import('@material/mwc-button'),
          import('../../components/snackbar/snackbar.component'),
          import('../../components/loading-button/loading-button.component'),
        ]);

        this._updateNotificationShown = true;
      }

      return;
    }
    if (registration.installing) {
      this._trackInstallation(registration.installing);
      return;
    }
    registration.addEventListener('updatefound', () =>
      this._trackInstallation(registration.installing!),
    );
    navigator.serviceWorker.addEventListener('controllerchange', () =>
      window.location.reload(),
    );
  }

  protected _trackInstallation(sw: ServiceWorker) {
    sw.addEventListener('statechange', async () => {
      if (sw.state === 'installed') {
        this._newSw = sw;

        const newAppVersion = await get('appVersion');

        if (newAppVersion !== currentAppVersion) {
          await Promise.all([
            import('@material/mwc-button'),
            import('../../components/snackbar/snackbar.component'),
            import('../../components/loading-button/loading-button.component'),
          ]);

          this._updateNotificationShown = true;
        }
      }
    });
  }

  protected _cancelUpdate() {
    this._updateNotificationShown = false;

    logEvent('cancel_update');
  }

  protected async _updateApp() {
    if (!this._newSw) {
      return;
    }
    this._updatingApp = true;

    await Promise.all([
      logEvent('perform_update'),
      set('changelogAvailable', true),
    ]);

    this._newSw.postMessage({ action: 'update' });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'update-checker': UpdateChecker;
  }
}
