import { LitElement, property, PropertyValues, query } from 'lit-element';

import type { TopAppBar } from '../components/top-app-bar/top-app-bar.component';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T> = new (...args: any[]) => T;

export const withTopAppBar = <E extends Constructor<LitElement>>(
  BaseElement: E,
) => {
  class ElementWithTopAppBar extends BaseElement {
    @property({ type: Boolean, attribute: 'drawer-open' })
    public drawerOpen = false;

    @property({ type: Boolean, attribute: 'show-menu-button' })
    public showMenuButton = false;

    @property({ type: Object })
    public scrollTarget?: HTMLElement;

    @query('top-app-bar')
    private _topAppBar?: TopAppBar;

    protected updated(changedProperties: PropertyValues) {
      super.updated(changedProperties);

      if (this.scrollTarget && this._topAppBar) {
        this._topAppBar.scrollTarget = this.scrollTarget;
      }
    }
  }

  return ElementWithTopAppBar;
};
