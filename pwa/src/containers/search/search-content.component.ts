import { LitElement, PropertyValues } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { setupWorkerClient } from '@easy-worker/core';
import { localize, SupportedLocale } from '../../helpers/localize';
import { t } from '@lingui/core/macro';
import { Song } from '../../models/song';
import { Prayer } from '../../models/prayer';
import { Magazine, MagazineType } from '../../models/magazine';
import {
  home,
  breviary,
  songs,
  prayers,
  magazines,
  user,
  settings,
  info,
  holyMass,
} from '../../components/icons.js';
import { formatDateToUrl, renderToString } from '../../helpers/utils';
import { cacheAndNetwork } from '../../helpers/cache-and-network';
import config from '../../config/default.json';

import sharedStyles from '../../shared.styles.scss';
import styles from './search-content.styles.scss';
import template from './search-content.template';

import type { SearchWorker, SearchItem } from './search.worker';

const worker = new Worker(new URL('./search.worker.ts', import.meta.url), {
  type: 'module',
});
const workerClient = setupWorkerClient<SearchWorker>(worker);

const getLocalizedHolyMassDescriptor = (
  locale: SupportedLocale,
  date: Date,
) => {
  const day = date.toLocaleDateString(locale, {
    day: 'numeric',
    month: '2-digit',
    year: 'numeric',
  });
  return t`readLiturgyOfTheDay ${day}`;
};

@customElement('search-content')
export class SearchContent extends localize(LitElement) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @state()
  protected _searchResults: SearchItem[] = [];

  @state()
  protected _searching = false;

  @state()
  protected _searchTerm = '';

  @state()
  private _songs: Song[] = [];

  @state()
  private _prayers: Prayer[] = [];

  @state()
  private _magazines: Magazine[] = [];

  @query('.search-field')
  private _searchFieldEl?: HTMLElement;

  @query('.search-results')
  protected _searchResultsEl?: HTMLDivElement;

  constructor() {
    super();

    this._loadSearchData('songs');
    this._loadSearchData('prayers');
    this._loadSearchData('magazines');
    this._setupSearch();
  }

  override connectedCallback() {
    super.connectedCallback();
    const searchParam = new URLSearchParams(window.location.search).get('q');
    if (searchParam !== null) {
      this._searchTerm = searchParam;
      this._searching = true;
    }
  }

  private async _loadSearchData(entity: 'songs' | 'prayers' | 'magazines') {
    for await (const status of cacheAndNetwork<
      SearchContent[`_${typeof entity}`]
    >(`${config.apiUrl}/${entity}`)) {
      if (status.data) {
        // TODO: fix types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this as any)[`_${entity}`] = status.data;
      }
    }
  }

  private async _setupSearch() {
    const today = new Date();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await workerClient.configureSearch([
      {
        title: this.localize(t`home`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${renderToString(
            home,
          )}</div>`,
        },
        description: this.localize(t`appDescription`),
        link: this.localizeHref('home'),
      },
      {
        title: this.localize(t`search`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${renderToString(
            home,
          )}</div>`,
        },
        description: this.localize(t`searchDescription`),
        link: this.localizeHref('search'),
      },
      {
        title: this.localize(t`breviary`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${renderToString(
            breviary,
          )}</div>`,
        },
        description: this.localize(t`breviaryDescription`),
        link: this.localizeHref('breviary'),
      },
      {
        title: this.localize(t`songs`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${renderToString(
            songs,
          )}</div>`,
        },
        description: this.localize(t`songsDescription`),
        link: this.localizeHref('songs'),
      },
      {
        title: this.localize(t`prayers`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${renderToString(
            prayers,
          )}</div>`,
        },
        description: this.localize(t`prayersDescription`),
        link: this.localizeHref('prayers'),
      },
      {
        title: this.localize(t`holyMassToday`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${renderToString(
            holyMass,
          )}</div>`,
        },
        description: this.localize(
          getLocalizedHolyMassDescriptor(this.locale, today),
        ),
        link: `${this.localizeHref('holy-mass')}/${formatDateToUrl(today)}`,
      },
      {
        title: this.localize(t`holyMassTomorrow`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${renderToString(
            holyMass,
          )}</div>`,
        },
        description: this.localize(
          getLocalizedHolyMassDescriptor(this.locale, tomorrow),
        ),
        link: `${this.localizeHref('holy-mass')}/${formatDateToUrl(tomorrow)}`,
      },
      {
        title: this.localize(t`holyMassYesterday`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${renderToString(
            holyMass,
          )}</div>`,
        },
        description: this.localize(
          getLocalizedHolyMassDescriptor(this.locale, yesterday),
        ),
        link: `${this.localizeHref('holy-mass')}/${formatDateToUrl(yesterday)}`,
      },
      {
        title: this.localize(t`magazines`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${renderToString(
            magazines,
          )}</div>`,
        },
        description: this.localize(t`magazinesDescription`),
        link: this.localizeHref('magazines'),
      },
      {
        title: this.localize(t`login`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${renderToString(
            user,
          )}</div>`,
        },
        description: this.localize(t`loginDescription`),
        link: this.localizeHref('login'),
      },
      {
        title: this.localize(t`settings`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${renderToString(
            settings,
          )}</div>`,
        },
        description: this.localize(t`settingsDescription`),
        link: this.localizeHref('settings'),
      },
      {
        title: this.localize(t`info`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${renderToString(
            info,
          )}</div>`,
        },
        description: this.localize(t`infoDescription`),
        link: this.localizeHref('info'),
      },
      ...this._songs.map<SearchItem>(
        ({ language, category, number, title, content }) => ({
          title,
          preview: {
            type: 'text',
            content: number.toString(),
          },
          description: content,
          link: this.localizeHref('songs', language, category, number),
          keywords: number.toString(),
        }),
      ),
      ...this._prayers
        .filter(
          ({ title: { [this.locale]: localizedTitle, la: latinTitle } }) =>
            Boolean(localizedTitle || latinTitle),
        )
        .map<SearchItem>(
          ({
            slug,
            title: { [this.locale]: localizedTitle, la: latinTitle },
            content,
          }) => ({
            title: localizedTitle || latinTitle!,
            preview: {
              type: 'text',
              content: (localizedTitle || latinTitle)![0]!,
            },
            description: content?.it || content?.la,
            link: this.localizeHref('prayers', slug),
            keywords: slug,
          }),
        ),
      ...this._magazines.map<SearchItem>(({ type, code, name, thumbnail }) => {
        const magazineName =
          type === MagazineType.ANCILLA_DOMINI
            ? 'Ancilla Domini'
            : '#sempreconnessi';
        return {
          title: magazineName,
          description: name,
          preview: {
            type: 'html',
            content: `<img class="search-result-preview" src="${thumbnail}" alt="${magazineName} - ${name}">`,
          },
          link: this.localizeHref('magazines', type, code),
          keywords: code,
        };
      }),
    ]);
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (
      changedProperties.has('_songs') ||
      changedProperties.has('_prayers') ||
      changedProperties.has('_magazines')
    ) {
      this._setupSearch().then(() => this._updateSearchResults());
    }
  }

  public focusSearchField() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this._searchFieldEl as any)?.focus();
  }

  protected async _updateSearchResults() {
    if (!this._searchTerm) {
      this._searchResults = [];
      return;
    }

    this._searchResults = await workerClient.search(this._searchTerm);
  }

  protected _handleSearch({ target }: InputEvent) {
    const value = (target as HTMLInputElement).value;
    this._searchTerm = value;
    this._searching = Boolean(value);
    history.replaceState(
      {},
      '',
      value
        ? `${window.location.pathname}?q=${encodeURIComponent(value)}`
        : window.location.pathname,
    );
    this._searchResultsEl?.scrollTo(0, 0);
    this._updateSearchResults();
  }

  protected _handleSearchKeyDown(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this._searchTerm = '';
      this._searching = false;
      this._searchResults = [];
      (event.target as HTMLInputElement).value = '';
      history.replaceState({}, '', window.location.pathname);
    } else if (event.code === 'Enter') {
      event.preventDefault();
      this._searchResultsEl?.querySelector<HTMLAnchorElement>('a')?.focus();
    }
  }

  protected _handleSearchResultClick({
    altKey,
    ctrlKey,
    metaKey,
    shiftKey,
  }: MouseEvent) {
    if (altKey || ctrlKey || metaKey || shiftKey) {
      return;
    }

    history.replaceState({}, '', window.location.pathname);

    this.dispatchEvent(
      new CustomEvent('resultclick', { bubbles: true, composed: true }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'search-content': SearchContent;
  }
}
