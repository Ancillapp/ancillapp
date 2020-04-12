import {
  customElement,
  LitElement,
  property,
  PropertyValues,
} from 'lit-element';
import { installMediaQueryWatcher } from 'pwa-helpers';
import { localize } from '../../helpers/localize';

import styles from './shell.styles';
import template from './shell.template';

@customElement('ancillapp-shell')
export class Shell extends localize(LitElement) {
  public static styles = styles;

  protected render = template;

  @property({ type: String, attribute: true })
  public theme = 'system';

  @property({ type: String })
  protected _page = 'home';

  @property({ type: Boolean })
  protected _drawerOpened = false;

  @property({ type: Boolean })
  protected _narrow = false;

  protected readonly _topNavPages = [
    'home',
    'ancillas',
    'songs',
    'breviary',
    'prayers',
  ];
  protected readonly _bottomNavPages = ['settings', 'info'];

  constructor() {
    super();
    this._updateDrawerState(
      window.matchMedia('(min-width: 768px)').matches
        ? localStorage.getItem('drawerOpened') === 'true'
        : false,
    );
    installMediaQueryWatcher(
      '(min-width: 768px)',
      (matches) => (this._narrow = matches),
    );
  }

  protected update(changedProperties: PropertyValues) {
    console.log(changedProperties);
    super.update(changedProperties);
  }

  protected _updateDrawerState(opened: boolean) {
    if (opened !== this._drawerOpened) {
      this._drawerOpened = opened;
      localStorage.setItem('drawerOpened', `${opened}`);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gad-shell': Shell;
  }
}
