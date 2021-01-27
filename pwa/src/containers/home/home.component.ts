import { customElement, PropertyValues, property, query } from 'lit-element';
import { updateMetadata } from 'pwa-helpers';
import { localize } from '../../helpers/localize';
import { withTopAppBar } from '../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';
import { t } from '@lingui/macro';

import sharedStyles from '../../shared.styles';
import styles from './home.styles';
import template from './home.template';

import { logEvent } from '../../helpers/firebase';
import { initDB } from '../../helpers/utils';
import {
  homeIcon,
  breviaryIcon,
  songsIcon,
  prayersIcon,
  ancillasIcon,
  holyMassIcon,
  user,
  settingsIcon,
  infoIcon,
} from '../../components/icons';
import { prayersTranslations } from '../breviary-index/breviary-index.template';

import * as HomeWorker from './home.worker';

// TODO: convert this module back to a worker as soon as workerize-loader gets support for Webpack 5
// See: https://github.com/developit/workerize-loader/issues/77
const { configureSearch, search } = HomeWorker;

// const {
//   configureSearch,
//   search,
// } = new (HomeWorker as any)() as typeof HomeWorker;

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

  constructor() {
    super();

    this._setupSearch();
  }

  private _handleDocumentClick = () => {
    this._stopSearching();
  };

  private async _setupSearch() {
    const db = await initDB();

    const [songs, prayers, ancillas] = await Promise.all([
      db.getAll('songs'),
      db.getAll('prayers'),
      db.getAll('ancillas'),
    ]);

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
          content: `<div class="search-result-preview">${homeIcon.getHTML()}</div>`,
        },
        description: this.localize(t`homeDescription`),
        link: this.localizeHref('home'),
      },
      {
        title: this.localize(t`breviary`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${breviaryIcon.getHTML()}</div>`,
        },
        description: this.localize(t`breviaryDescription`),
        link: this.localizeHref('breviary'),
      },
      {
        title: this.localize(t`songs`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${songsIcon.getHTML()}</div>`,
        },
        description: this.localize(t`songsDescription`),
        link: this.localizeHref('songs'),
      },
      {
        title: this.localize(t`prayers`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${prayersIcon.getHTML()}</div>`,
        },
        description: this.localize(t`prayersDescription`),
        link: this.localizeHref('prayers'),
      },
      {
        title: this.localize(t`ancillas`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${ancillasIcon.getHTML()}</div>`,
        },
        description: this.localize(t`ancillasDescription`),
        link: this.localizeHref('ancillas'),
      },
      {
        title: this.localize(t`holyMass`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${holyMassIcon.getHTML()}</div>`,
        },
        description: this.localize(t`holyMassDescription`),
        link: this.localizeHref('holy-mass'),
      },
      {
        title: this.localize(t`login`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${user.getHTML()}</div>`,
        },
        description: this.localize(t`loginDescription`),
        link: this.localizeHref('login'),
      },
      {
        title: this.localize(t`settings`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${settingsIcon.getHTML()}</div>`,
        },
        description: this.localize(t`settingsDescription`),
        link: this.localizeHref('settings'),
      },
      {
        title: this.localize(t`info`),
        preview: {
          type: 'html',
          content: `<div class="search-result-preview">${infoIcon.getHTML()}</div>`,
        },
        description: this.localize(t`infoDescription`),
        link: this.localizeHref('info'),
      },
      ...[
        'invitatory',
        'matins',
        'lauds',
        'terce',
        'sext',
        'none',
        'vespers',
        'compline',
      ].flatMap<HomeWorker.SearchItem>((prayer) =>
        dates.map(({ date, keywords }) => ({
          title: `${
            prayersTranslations[prayer as keyof typeof prayersTranslations]
          } - ${Intl.DateTimeFormat(this.locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).format(date)}`,
          preview: {
            type: 'text',
            content:
              prayersTranslations[
                prayer as keyof typeof prayersTranslations
              ][0],
          },
          description: this.localize(t`breviaryDescription`),
          link: this.localizeHref(
            'breviary',
            prayer,
            date.toISOString().slice(0, 10),
          ),
          keywords,
        })),
      ),
      ...songs.map<HomeWorker.SearchItem>(({ number, title, content }) => ({
        title,
        preview: {
          type: 'text',
          content: number.endsWith('bis')
            ? `${number.slice(2, -3)}b`
            : number.slice(2),
        },
        description: content,
        link: this.localizeHref('songs', number),
        keywords: number,
      })),
      ...prayers.map<HomeWorker.SearchItem>(
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
      ...ancillas.map<HomeWorker.SearchItem>(({ code, name, thumbnail }) => ({
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
      })),
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
    const { code, target } = (event.detail instanceof KeyboardEvent
      ? event.detail
      : event) as KeyboardEvent;

    if (code === 'Escape' || code === 'Enter') {
      event.preventDefault();

      if (code === 'Escape') {
        (target as HTMLInputElement).value = '';
        this._searchTerm = '';
        this._stopSearching();
        this._updateSearchResults();
      } else {
        const firstSearchResult = this._searchResultsContainer!.querySelector<HTMLAnchorElement>(
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
