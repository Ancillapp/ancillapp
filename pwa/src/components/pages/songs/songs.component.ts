import { customElement, property, PropertyValues } from 'lit-element';
import { PageViewElement } from '../page-view-element';

import sharedStyles from '../../shared.styles';
import styles from './songs.styles';
import template from './songs.template';

@customElement('songs-page')
export class SongsPage extends PageViewElement {
  public static styles = [sharedStyles, styles];

  protected render = template;

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
    'songs-page': SongsPage;
  }
}
