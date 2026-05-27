import { LitElement, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import sharedStyles from '../../shared.styles.scss';
import styles from './autosized-fab.styles.scss';
import template from './autosized-fab.template';

@customElement('autosized-fab')
export class AutosizedFAB extends LitElement {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: Boolean })
  public disabled = false;

  @property({ attribute: false })
  public scrollTarget: Element | null = null;

  @property({ type: String })
  public icon = '';

  @property({ type: String })
  public label = '';

  @property({ type: String })
  protected _size: 'small' | 'normal' | 'large' = 'normal';

  @state()
  protected _scrolling = false;

  private _scrollTimeout: ReturnType<typeof setTimeout> | null = null;

  private readonly _onScroll = () => {
    this._scrolling = true;
    if (this._scrollTimeout !== null) {
      clearTimeout(this._scrollTimeout);
    }
    this._scrollTimeout = setTimeout(() => {
      this._scrolling = false;
      this._scrollTimeout = null;
    }, 750);
  };

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('scrollTarget')) {
      const prev = changedProperties.get('scrollTarget') as Element | null;
      prev?.removeEventListener('scroll', this._onScroll);
      this.scrollTarget?.addEventListener('scroll', this._onScroll, {
        passive: true,
      });
    }
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this.scrollTarget?.removeEventListener('scroll', this._onScroll);
    if (this._scrollTimeout !== null) {
      clearTimeout(this._scrollTimeout);
      this._scrollTimeout = null;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'autosized-fab': AutosizedFAB;
  }
}
