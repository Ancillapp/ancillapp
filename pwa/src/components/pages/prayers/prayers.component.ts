import {
  LitElement,
  customElement,
  property,
  PropertyValues,
} from 'lit-element';

import sharedStyles from '../../shared.styles';
import styles from './prayers.styles';
import template from './prayers.template';

@customElement('prayers-page')
export class PrayersPage extends LitElement {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: Boolean, reflect: true })
  public active = false;

  @property({ type: 'String' })
  public subroute?: string;

  @property({ type: Boolean, attribute: 'drawer-open' })
  public drawerOpen = false;

  @property({ type: Object })
  public scrollTarget?: HTMLElement;

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (this.scrollTarget && this.shadowRoot!.firstElementChild) {
      (this.shadowRoot!.firstElementChild as Element & {
        scrollTarget: HTMLElement | undefined;
      }).scrollTarget = this.scrollTarget;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'prayers-page': PrayersPage;
  }
}
