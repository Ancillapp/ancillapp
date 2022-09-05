import { LitElement, PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import styles from './top-app-bar.styles';
import template from './top-app-bar.template';

@customElement('top-app-bar')
export class TopAppBar extends LitElement {
  public static styles = [styles];

  protected render = template;

  @query('header')
  private _header?: HTMLHeadingElement;

  @property({ type: Number })
  protected _scrollFromTop = 0;

  @property({ type: Boolean })
  protected _scrolled = false;

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
    this._scrolled = false;
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

        this._scrolled = realScroll > 16;

        if (
          this._latestPos < realScroll &&
          ((window.innerWidth < 600 && this._scrollFromTop >= -56) ||
            (window.innerWidth > 599 && this._scrollFromTop >= -64))
        ) {
          this._scrollFromTop = Math.max(
            window.innerWidth < 600 ? -56 : -64,
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
}

declare global {
  interface HTMLElementTagNameMap {
    'top-app-bar': TopAppBar;
  }
}
