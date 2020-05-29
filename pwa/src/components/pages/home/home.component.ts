import { customElement } from 'lit-element';
import { localize } from '../../../helpers/localize';
import { withTopAppBar } from '../../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';

import sharedStyles from '../../shared.styles';
import styles from './home.styles';
import template from './home.template';

@customElement('home-page')
export class HomePage extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;
}

declare global {
  interface HTMLElementTagNameMap {
    'home-page': HomePage;
  }
}
