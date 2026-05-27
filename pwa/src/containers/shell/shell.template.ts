import { html } from 'lit';
import { Shell } from './shell.component';
import { t, msg } from '@lingui/core/macro';
import { tau } from '../../components/icons.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { toCamelCase } from '../../helpers/utils';

import 'mdui/components/navigation-bar.js';
import 'mdui/components/navigation-bar-item.js';
import 'mdui/components/navigation-drawer.js';
import 'mdui/components/list.js';
import 'mdui/components/list-item.js';
import 'mdui/components/fab.js';
import 'mdui/components/button-icon.js';
import '../../components/ancillapp-icon.component.js';
import '../../components/expandable-navigation-rail/expandable-navigation-rail.component.js';
import '../../components/expandable-navigation-rail/expandable-navigation-rail-item.component.js';
import '../../components/top-app-bar/top-app-bar.component.js';

// Asynchronous imports
import('../update-checker/update-checker.component');

const pagesTranslations = {
  home: msg`home`,
  search: msg`search`,
  breviary: msg`breviary`,
  songs: msg`songs`,
  prayers: msg`prayers`,
  magazines: msg`magazines`,
  holyMass: msg`holyMass`,
  settings: msg`settings`,
  info: msg`info`,
};

const topNavPages: string[] = [
  'home',
  'breviary',
  'songs',
  'prayers',
  'holy-mass',
  'magazines',
];
const bottomNavPages: string[] = ['settings', 'info'];

const navbarPages: string[] = ['home', 'search', 'songs', 'prayers'];

export default function template(this: Shell) {
  return html`
    ${this._wide
      ? html`
          <expandable-navigation-rail
            value="${this._page}"
            ?expanded="${this._drawerOpened}"
            contained
          >
            <div class="navigation-rail-top" slot="top">
              <mdui-button-icon
                aria-label="${this.localize(t`menu`)}"
                @click="${() =>
                  this._updateDrawerOpenState(!this._drawerOpened)}"
              >
                <ancillapp-icon
                  name="${this._drawerOpened ? 'menuOpen' : 'menu'}"
                ></ancillapp-icon>
              </mdui-button-icon>
              <mdui-fab lowered ?extended="${this._drawerOpened}">
                <ancillapp-icon name="search" slot="icon"></ancillapp-icon>
                ${this.localize(t`search`)}
              </mdui-fab>
            </div>
            ${[...topNavPages, ...bottomNavPages].map(
              (page) => html`
                <expandable-navigation-rail-item
                  href="${this.localizeHref(page)}"
                  value="${page}"
                  ?active="${this._page === page}"
                  slot="${ifDefined(
                    topNavPages.includes(page) ? undefined : 'bottom',
                  )}"
                  ?expanded="${this._drawerOpened}"
                >
                  <ancillapp-icon
                    name="${toCamelCase(page)}"
                    slot="icon"
                  ></ancillapp-icon>
                  <ancillapp-icon
                    name="${toCamelCase(page)}Active"
                    slot="active-icon"
                  ></ancillapp-icon>
                  ${this.localize(
                    pagesTranslations[
                      toCamelCase(page) as keyof typeof pagesTranslations
                    ],
                  )}
                </expandable-navigation-rail-item>
              `,
            )}
          </expandable-navigation-rail>
        `
      : html`
          <mdui-navigation-drawer
            modal
            close-on-esc
            close-on-overlay-click
            contained
            ?open="${this._drawerOpened}"
            @open="${() => this._updateDrawerOpenState(true)}"
            @close="${() => this._updateDrawerOpenState(false)}"
          >
            <div class="navigation-drawer-header">
              <span class="navigation-drawer-title">
                ${tau}
                <span>Ancillapp</span>
              </span>
              <mdui-button-icon
                aria-label="${this.localize(t`close`)}"
                @click="${() => this._updateDrawerOpenState(false)}"
              >
                <ancillapp-icon name="close"></ancillapp-icon>
              </mdui-button-icon>
            </div>
            <div class="navigation-drawer-content">
              <mdui-list>
                ${topNavPages.map(
                  (page) => html`
                    <mdui-list-item
                      rounded
                      href="${this.localizeHref(page)}"
                      ?active="${this._page === page}"
                      @click="${() => this._updateDrawerOpenState(false)}"
                    >
                      <ancillapp-icon
                        name="${this._page === page
                          ? `${toCamelCase(page)}Active`
                          : toCamelCase(page)}"
                        slot="icon"
                      ></ancillapp-icon>
                      ${this.localize(
                        pagesTranslations[
                          toCamelCase(page) as keyof typeof pagesTranslations
                        ],
                      )}
                    </mdui-list-item>
                  `,
                )}
              </mdui-list>
              <mdui-list>
                ${bottomNavPages.map(
                  (page) => html`
                    <mdui-list-item
                      rounded
                      href="${this.localizeHref(page)}"
                      ?active="${this._page === page}"
                      @click="${() => this._updateDrawerOpenState(false)}"
                    >
                      <ancillapp-icon
                        name="${this._page === page
                          ? `${toCamelCase(page)}Active`
                          : toCamelCase(page)}"
                        slot="icon"
                      ></ancillapp-icon>
                      ${this.localize(
                        pagesTranslations[
                          toCamelCase(page) as keyof typeof pagesTranslations
                        ],
                      )}
                    </mdui-list-item>
                  `,
                )}
              </mdui-list>
            </div>
          </mdui-navigation-drawer>

          <mdui-navigation-bar
            scroll-behavior="hide"
            scroll-threshold="30"
            .scrollTarget="${this._navbarScrollTarget || this._appContent}"
            value="${this._page}"
            @show="${() => this._updateNavbarOffset(true)}"
            @hide="${() => this._updateNavbarOffset(false)}"
          >
            ${navbarPages.map(
              (page) => html`
                <mdui-navigation-bar-item
                  href="${this.localizeHref(page)}"
                  value="${page}"
                  ?active="${this._page === page}"
                >
                  <ancillapp-icon
                    name="${toCamelCase(page)}"
                    slot="icon"
                  ></ancillapp-icon>
                  <ancillapp-icon
                    name="${toCamelCase(page)}Active"
                    slot="active-icon"
                  ></ancillapp-icon>
                  ${this.localize(
                    pagesTranslations[
                      toCamelCase(page) as keyof typeof pagesTranslations
                    ],
                  )}
                </mdui-navigation-bar-item>
              `,
            )}
          </mdui-navigation-bar>
        `}

    <main id="app-content">
      <home-page
        class="page padded"
        ?active="${this._page === 'home'}"
        ?drawer-open="${this._wide}"
        ?show-menu-button="${!this._wide}"
        @menutoggle="${() => this._updateDrawerOpenState(!this._drawerOpened)}"
      ></home-page>
      <breviary-placeholder
        class="page padded"
        ?active="${this._page === 'breviary' && this._subroute.length < 1}"
        ?drawer-open="${this._wide}"
        ?show-menu-button="${!this._wide}"
        @menutoggle="${() => this._updateDrawerOpenState(!this._drawerOpened)}"
      ></breviary-placeholder>
      <songs-list
        class="page"
        ?active="${this._page === 'songs' && this._subroute.length < 1}"
        ?drawer-open="${this._wide}"
        ?show-menu-button="${!this._wide}"
        @menutoggle="${() => this._updateDrawerOpenState(!this._drawerOpened)}"
      ></songs-list>
      <song-viewer
        class="page"
        ?active="${this._page === 'songs' && this._subroute.length === 3}"
        ?drawer-open="${this._wide}"
        ?show-menu-button="${!this._wide}"
        language="${this._subroute?.[0]}"
        category="${this._subroute?.[1]}"
        number="${this._subroute?.[2]}"
      ></song-viewer>
      <prayers-list
        class="page"
        ?active="${this._page === 'prayers' && this._subroute.length < 1}"
        ?drawer-open="${this._wide}"
        ?show-menu-button="${!this._wide}"
        @menutoggle="${() => this._updateDrawerOpenState(!this._drawerOpened)}"
      ></prayers-list>
      <prayer-viewer
        class="page"
        ?active="${this._page === 'prayers' && this._subroute.length > 0}"
        ?drawer-open="${this._wide}"
        ?show-menu-button="${!this._wide}"
        prayer="${this._subroute?.[0]}"
      ></prayer-viewer>
      <magazines-index
        class="page"
        ?active="${this._page === 'magazines' && this._subroute.length < 1}"
        ?drawer-open="${this._wide}"
        ?show-menu-button="${!this._wide}"
        @menutoggle="${() => this._updateDrawerOpenState(!this._drawerOpened)}"
      ></magazines-index>
      <magazines-list
        class="page"
        ?active="${this._page === 'magazines' && this._subroute.length === 1}"
        ?drawer-open="${this._wide}"
        ?show-menu-button="${!this._wide}"
        type="${this._subroute?.[0]}"
      ></magazines-list>
      <magazine-viewer
        class="page"
        ?active="${this._page === 'magazines' && this._subroute.length > 1}"
        ?drawer-open="${this._wide}"
        ?show-menu-button="${!this._wide}"
        type="${this._subroute?.[0]}"
        code="${this._subroute?.[1]}"
      ></magazine-viewer>
      <liturgy-viewer
        class="page padded"
        ?active="${this._page === 'holy-mass'}"
        ?drawer-open="${this._wide}"
        ?show-menu-button="${!this._wide}"
        day="${this._subroute?.join('-')}"
        @menutoggle="${() => this._updateDrawerOpenState(!this._drawerOpened)}"
      ></liturgy-viewer>
      <settings-page
        class="page"
        ?active="${this._page === 'settings'}"
        ?drawer-open="${this._wide}"
        ?show-menu-button="${!this._wide}"
        @menutoggle="${() => this._updateDrawerOpenState(!this._drawerOpened)}"
        ?keep-screen-active="${!!this._wakeLockSentinel}"
        @keepscreenactivechange="${this._handleKeepScreenActiveChange}"
      ></settings-page>
      <info-page
        class="page"
        ?active="${this._page === 'info'}"
        ?drawer-open="${this._wide}"
        ?show-menu-button="${!this._wide}"
        @menutoggle="${() => this._updateDrawerOpenState(!this._drawerOpened)}"
      ></info-page>
    </main>

    <update-checker></update-checker>
  `;
}
