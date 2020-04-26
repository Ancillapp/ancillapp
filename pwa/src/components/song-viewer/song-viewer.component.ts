import { customElement, property } from 'lit-element';
import { localize } from '../../helpers/localize';
import { PageViewElement } from '../pages/page-view-element';

import sharedStyles from '../shared.styles';
import styles from './song-viewer.styles';
import template from './song-viewer.template';

import { apiUrl } from '../../config/default.json';

export interface Song {
  number: string;
  title: string;
  content: string;
}

@customElement('song-viewer')
export class SongViewer extends localize(PageViewElement) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String })
  public song?: string;

  @property({ type: Object })
  protected _songPromise: Promise<Song> = new Promise(() => {});

  attributeChangedCallback(
    name: string,
    old: string | null,
    value: string | null,
  ) {
    if (name === 'song' && value && old !== value) {
      this._songPromise = fetch(`${apiUrl}/songs/${value}`).then((res) =>
        res.json(),
      );
    }
    super.attributeChangedCallback(name, old, value);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'song-viewer': SongViewer;
  }
}
