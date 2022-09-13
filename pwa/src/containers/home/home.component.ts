import { PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { updateMetadata } from 'pwa-helpers';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';
import { t } from '@lingui/macro';
import { Song } from '../../models/song';
import { Prayer } from '../../models/prayer';
import { Ancilla } from '../../models/ancilla';

import sharedStyles from '../../shared.styles';
import styles from './home.styles';
import template from './home.template';

import config from '../../config/default.json';
import { logEvent } from '../../helpers/firebase';
import {
  homeIcon,
  breviaryIcon,
  songsIcon,
  prayersIcon,
  ancillasIcon,
  user,
  settingsIcon,
  infoIcon,
} from '../../components/icons';
import { renderToString } from '../../helpers/utils';
import { prayersTranslations } from '../breviary-index/breviary-index.template';

import * as HomeWorker from './home.worker';
import { cacheAndNetwork } from '../../helpers/cache-and-network';

const { configureSearch, search } =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (HomeWorker as any)() as typeof HomeWorker;

@customElement('home-page')
export class HomePage extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: Array })
  protected _searchResults: HomeWorker.SearchItem[] = [];

  @property({ type: Boolean })
  protected _searching = false;

  @property({ type: String })
  protected _searchTerm = '';

  @query('.search-results')
  private _searchResultsContainer?: HTMLDivElement;

  @query('#search-input')
  private _searchInput?: HTMLInputElement;

  @state()
  private _songs: Song[] = [];

  @state()
  private _prayers: Prayer[] = [];

  @state()
  private _ancillas: Ancilla[] = [];

  constructor() {
    super();

    this._loadSearchData('songs', '_songs');
    this._loadSearchData('prayers', '_prayers');
    this._loadSearchData('ancillas', '_ancillas');
    this._setupSearch();
  }

  private async _loadSearchData(path: string, field: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for await (const status of cacheAndNetwork<any>(
      `${config.apiUrl}/${path}`,
    )) {
      if (status.data) {
        this[field as keyof this] = status.data;
      }
    }
  }

  private _handleDocumentClick = () => {
    this._stopSearching();
  };

  private async _setupSearch() {
    const today = new Date();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const dates = [
      {
        date: today,
        keywords: this.localize(t`today`),
      },
      {
        date: tomorrow,
        keywords: this.localize(t`tomorrow`),
      },
      {
        date: dayAfterTomorrow,
        keywords: this.localize(t`dayAfterTomorrow`),
      },
      {
        date: yesterday,
        keywords: this.localize(t`yesterday`),
      },
    ];

    await configureSearch([
      {
        title: this.localize(t`home`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${renderToString(
            homeIcon,
          )}</div>`,
        },
        description: this.localize(t`homeDescription`),
        link: this.localizeHref('home'),
      },
      {
        title: this.localize(t`breviary`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${renderToString(
            breviaryIcon,
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
            songsIcon,
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
            prayersIcon,
          )}</div>`,
        },
        description: this.localize(t`prayersDescription`),
        link: this.localizeHref('prayers'),
      },
      {
        title: this.localize(t`ancillas`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${renderToString(
            ancillasIcon,
          )}</div>`,
        },
        description: this.localize(t`ancillasDescription`),
        link: this.localizeHref('ancillas'),
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
            settingsIcon,
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
            infoIcon,
          )}</div>`,
        },
        description: this.localize(t`infoDescription`),
        link: this.localizeHref('info'),
      },
      ...this._songs.map<HomeWorker.SearchItem>(
        ({ language, category, number, title, content }) => ({
          title,
          preview: {
            type: 'text',
            content: number.endsWith('bis')
              ? `${number.slice(0, -3)}b`
              : number,
          },
          description: content,
          link: this.localizeHref('songs', language, category, number),
          keywords: number,
        }),
      ),
      ...this._prayers
        .filter(
          ({ title: { [this.locale]: localizedTitle, la: latinTitle } }) =>
            Boolean(localizedTitle || latinTitle),
        )
        .map<HomeWorker.SearchItem>(
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
      ...this._ancillas.map<HomeWorker.SearchItem>(
        ({ code, name, thumbnail }) => ({
          title: 'Ancilla Domini',
          description: name[this.locale],
          preview: {
            type: 'html',
            content: `<img class="search-result-preview" src="${thumbnail}" alt="Ancilla Domini - ${
              name[this.locale]
            }">`,
          },
          link: this.localizeHref('ancillas', code),
          keywords: code,
        }),
      ),
    ]);
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    const searchParam = new URLSearchParams(window.location.search).get(
      'search',
    );

    this._searching = searchParam !== null;
    this._searchTerm = searchParam || '';

    if (changedProperties.has('showMenuButton')) {
      if (this.showMenuButton) {
        document.removeEventListener('click', this._handleDocumentClick);
      } else {
        document.addEventListener('click', this._handleDocumentClick);
      }
    }

    if (
      this.showMenuButton &&
      changedProperties.has('_searching') &&
      this._searching &&
      this._searchInput
    ) {
      this._searchInput.focus();
      this._searchInput.setSelectionRange(-1, -1);
    }

    if (
      changedProperties.has('_songs') ||
      changedProperties.has('_prayers') ||
      changedProperties.has('_ancillas')
    ) {
      this._setupSearch().then(() => this._updateSearchResults());
    }

    if (changedProperties.has('active') && this.active) {
      const pageTitle = `Ancillapp - ${this.localize(t`home`)}`;

      updateMetadata({
        title: pageTitle,
        description: this.localize(t`homeDescription`),
      });

      logEvent('page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }
  }

  protected async _updateSearchResults() {
    if (!this._searchTerm) {
      this._searchResults = [];
      return;
    }

    this._searchResults = await search(this._searchTerm);
  }

  protected _handleSearchKeyDown(
    event: KeyboardEvent | CustomEvent<KeyboardEvent>,
  ) {
    const { code, target } = (
      event.detail instanceof KeyboardEvent ? event.detail : event
    ) as KeyboardEvent;

    if (code === 'Escape' || code === 'Enter') {
      event.preventDefault();

      if (code === 'Escape') {
        (target as HTMLInputElement).value = '';
        this._searchTerm = '';
        this._stopSearching();
        this._updateSearchResults();
      } else {
        const firstSearchResult =
          this._searchResultsContainer!.querySelector<HTMLAnchorElement>(
            '.search-results > a',
          );

        if (!firstSearchResult) {
          return;
        }

        firstSearchResult.focus();
      }
    }
  }

  protected _handleMobileSearch({ target }: InputEvent) {
    this._handleSearch((target as HTMLInputElement).value);
  }

  protected _handleDesktopSearch({ detail }: CustomEvent<string>) {
    this._handleSearch(detail);
  }

  protected _handleSearch(value: string) {
    this._searchTerm = value;
    history.replaceState(
      {},
      '',
      `${window.location.pathname}?search${
        this._searchTerm ? `=${this._searchTerm}` : ''
      }`,
    );

    this._searchResultsContainer!.scrollTo(0, 0);
    this._updateSearchResults();
  }

  protected _startSearching() {
    this._searching = true;

    if (this.showMenuButton) {
      history.replaceState({}, '', `${window.location.pathname}?search`);
    }

    if (this._searchTerm) {
      this._updateSearchResults();
    }
  }

  protected _stopSearching() {
    this._searching = false;
    history.replaceState({}, '', window.location.pathname);
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

    this._searchInput!.value = '';
    this._searchTerm = '';
    this._stopSearching();
    this._updateSearchResults();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'home-page': HomePage;
  }
}
