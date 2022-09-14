import { PropertyValues } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { updateMetadata } from 'pwa-helpers';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { Magazine, MagazineType } from '../../models/magazine';
import { PageViewElement } from '../page-view-element';
import { t } from '@lingui/macro';

import sharedStyles from '../../shared.styles';
import styles from './magazines-index.styles';
import template from './magazines-index.template';

import config from '../../config/default.json';
import { logEvent } from '../../helpers/firebase';

const _latestMagazinesPromisesCache = new Map<
  MagazineType,
  Promise<Magazine>
>();

@customElement('magazines-index')
export class MagazinesIndex extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @state()
  protected _latestAncillaDominiPromise: Promise<Magazine> = new Promise(
    () => undefined,
  );

  @state()
  protected _latestSempreconnessiPromise: Promise<Magazine> = new Promise(
    () => undefined,
  );

  constructor() {
    super();

    this._loadLatestMagazine(
      MagazineType.ANCILLA_DOMINI,
      '_latestAncillaDominiPromise',
    );
    this._loadLatestMagazine(
      MagazineType.SEMPRECONNESSI,
      '_latestSempreconnessiPromise',
    );
  }

  private async _loadLatestMagazine(type: MagazineType, field: string) {
    if (!_latestMagazinesPromisesCache.has(type)) {
      _latestMagazinesPromisesCache.set(
        type,
        fetch(`${config.apiUrl}/magazines/${type}/latest`).then((res) =>
          res.json(),
        ),
      );
    }

    this[field as keyof this] = _latestMagazinesPromisesCache.get(
      type,
    )! as this[keyof this];
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('active') && this.active) {
      const pageTitle = `Ancillapp - ${this.localize(t`magazines`)}`;

      updateMetadata({
        title: pageTitle,
        description: this.localize(t`magazinesDescription`),
      });

      logEvent('page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'magazines-index': MagazinesIndex;
  }
}
