import { html, nothing } from 'lit';
import { UpdateChecker } from './update-checker.component';
import { external } from '../../components/icons';
import { t } from '@lingui/macro';

import '@material/mwc-drawer';
import '@material/mwc-icon-button';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-snackbar';
import '../../components/top-app-bar/top-app-bar.component';

import { changelog } from '../../helpers/changelog';

export default function template(this: UpdateChecker) {
  return html`
    <snack-bar ?active="${this._updateNotificationShown}">
      ${this._updateNotificationShown
        ? html`
            ${this.localize(t`updateAvailable`)}
            <mwc-button
              slot="actions"
              @click="${this._cancelUpdate}"
              label="${this.localize(t`ignore`)}"
            ></mwc-button>
            <loading-button
              slot="actions"
              @click="${this._updateApp}"
              ?loading="${this._updatingApp}"
              label="${this.localize(t`updateNow`)}"
            ></loading-button>
          `
        : html`${nothing}`}
    </snack-bar>

    <mwc-dialog
      heading="v${changelog[this.locale].version} — ${Intl.DateTimeFormat(
        this.locale,
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        },
      ).format(new Date(changelog.en.date))}"
      hideActions
      ?open="${this._changelogAvailable}"
    >
      ${this._changelogAvailable
        ? html`
            <ul class="changelog-news">
              ${changelog[this.locale].news.map(
                (newsItem) => html`<li>${newsItem}</li>`,
              )}
            </ul>
            <a
              id="full-changelog-link"
              href="https://github.com/Ancillapp/ancillapp/blob/main/CHANGELOG${this
                .locale === 'en'
                ? ''
                : '.it'}.md"
              rel="external nofollow"
              target="ancillapp-changelog"
            >
              ${this.localize(t`viewFullChangelog`)} ${external}
            </a>
            <footer class="changelog-footer">
              <mwc-formfield label="${this.localize(t`dontShowAnymore`)}">
                <mwc-checkbox
                  ?checked="${this._dontShowChangelog}"
                  @change="${this._handledontShowChangelogChange}"
                ></mwc-checkbox>
              </mwc-formfield>
              <mwc-button
                dialogAction="close"
                label="${this.localize(t`close`)}"
              ></mwc-button>
            </footer>
          `
        : html`${nothing}`}
    </mwc-dialog>
  `;
}
