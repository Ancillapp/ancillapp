import { PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { updateMetadata } from 'pwa-helpers';
import { localize } from '../../helpers/localize';
import { localizedPages } from '../../helpers/localization';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';
import { t } from '@lingui/macro';

import sharedStyles from '../../shared.styles';
import styles from './magazine-viewer.styles';
import template from './magazine-viewer.template';

import config from '../../config/default.json';
import { logEvent } from '../../helpers/firebase';
import { Magazine, MagazineType } from '../../models/magazine';

const _magazinesPromisesCache = new Map<string, Promise<Magazine>>();

@customElement('magazine-viewer')
export class MagazineViewer extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String })
  public type?: MagazineType;

  @property({ type: String })
  public code?: string;

  @property({ type: Object })
  protected _magazinePromise: Promise<Magazine> = new Promise(() => undefined);

  protected async updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (
      (changedProperties.has('type') || changedProperties.has('code')) &&
      this.active &&
      this.type &&
      this.code
    ) {
      const magazineCode = Object.values(localizedPages.latest).includes(
        this.code,
      )
        ? 'latest'
        : this.code;

      const magazineId = `${this.type}/${magazineCode}`;

      if (!_magazinesPromisesCache.has(magazineId)) {
        _magazinesPromisesCache.set(
          magazineId,
          fetch(`${config.apiUrl}/magazines/${magazineId}`).then((res) =>
            res.json(),
          ),
        );
      }

      this._magazinePromise = _magazinesPromisesCache.get(magazineId)!;

      if (changedProperties.has('active')) {
        const { code, name } = await this._magazinePromise;

        const magazineType =
          this.type === MagazineType.ANCILLA_DOMINI
            ? 'Ancilla Domini'
            : '#sempreconnessi';

        const pageTitle = `Ancillapp - ${this.localize(
          t`magazines`,
        )} - ${magazineType} - ${name}`;

        updateMetadata({
          title: pageTitle,
          description: this.localize(
            t`magazineDescription ${name} ${magazineType}`,
          ),
        });

        logEvent('page_view', {
          page_title: pageTitle,
          page_location: window.location.href,
          page_path: window.location.pathname,
        });

        if (magazineCode !== code) {
          window.history.replaceState(
            {},
            '',
            this.localizeHref('magazines', this.type, code),
          );
        }
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'magazine-viewer': MagazineViewer;
  }
}
