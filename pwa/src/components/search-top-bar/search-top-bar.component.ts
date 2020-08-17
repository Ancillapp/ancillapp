import {
  LitElement,
  customElement,
  property,
  PropertyValues,
  query,
} from 'lit-element';

import styles from './search-top-bar.styles';
import template from './search-top-bar.template';

@customElement('search-top-bar')
export class SearchTopBar extends LitElement {
  public static styles = [styles];

  protected render = template;

  @query('header')
  private _header?: HTMLHeadingElement;

  @property({ type: Number })
  protected _scrollFromTop = 0;

  @property({ type: String, reflect: true })
  public placeholder = '';

  @property({ type: Object })
  get scrollTarget() {
    return (
      this._scrollTarget ||
      document.scrollingElement ||
      document.documentElement
    );
  }

  set scrollTarget(value) {
    this.unregisterScrollListener();
    const old = this.scrollTarget;
    this._scrollTarget = value;
    this._scrollFromTop = 0;
    this._ticking = false;
    this._latestPos = value.scrollTop;
    this.requestUpdate('scrollTarget', old);
    this.registerScrollListener();
  }

  private _scrollTarget!: HTMLElement;

  private _ticking = false;

  private _latestPos = this.scrollTarget.scrollTop;

  protected handleTargetScroll = () => {
    if (!this._header) {
      return;
    }

    if (!this._ticking) {
      window.requestAnimationFrame(() => {
        const { scrollTop } = this.scrollTarget;

        const realScroll = Math.max(0, scrollTop);

        if (
          this._latestPos < realScroll &&
          ((window.innerWidth < 600 && this._scrollFromTop >= -64) ||
            (window.innerWidth > 599 && this._scrollFromTop >= -72))
        ) {
          this._scrollFromTop = Math.max(
            window.innerWidth < 600 ? -64 : -72,
            this._scrollFromTop + (this._latestPos - realScroll),
          );
        } else if (this._scrollFromTop <= 0) {
          this._scrollFromTop = Math.min(
            0,
            this._scrollFromTop - (realScroll - this._latestPos),
          );
        }

        this._latestPos = realScroll;

        this._ticking = false;
      });

      this._ticking = true;
    }
  };

  protected registerListeners() {
    this.registerScrollListener();
  }

  protected unregisterListeners() {
    this.unregisterScrollListener();
  }

  protected registerScrollListener() {
    this._latestPos = this.scrollTarget.scrollTop;
    this.scrollTarget.addEventListener('scroll', this.handleTargetScroll, {
      passive: true,
    });
  }

  protected unregisterScrollListener() {
    this.scrollTarget.removeEventListener('scroll', this.handleTargetScroll);
  }

  protected firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);
    this.registerListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unregisterListeners();
  }

  protected _handleSearch(event: KeyboardEvent) {
    event.stopImmediatePropagation();

    this.dispatchEvent(
      new CustomEvent('search', {
        detail: (event.target as HTMLInputElement).value,
      }),
    );
  }

  protected _handleSearchClick(event: MouseEvent) {
    this.dispatchEvent(new CustomEvent('searchclick', event));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'search-top-bar': SearchTopBar;
  }
}
