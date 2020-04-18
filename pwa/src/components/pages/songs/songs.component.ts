import { customElement, property } from 'lit-element';
import { PageViewElement } from '../page-view-element';

import sharedStyles from '../../shared.styles';
import styles from './songs.styles';
import template from './songs.template';

@customElement('songs-page')
export class SongsPage extends PageViewElement {
  public static styles = [sharedStyles, styles];

  @property({ type: 'String' })
  public subroute?: string;

  protected render = template;
}

declare global {
  interface HTMLElementTagNameMap {
    'songs-page': SongsPage;
  }
}
