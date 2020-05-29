import { customElement } from 'lit-element';
import { localize } from '../../../helpers/localize';
import { withTopAppBar } from '../../../helpers/with-top-app-bar';
import { PageViewElement } from '../page-view-element';

import sharedStyles from '../../shared.styles';
import styles from './info.styles';
import template from './info.template';

@customElement('info-page')
export class InfoPage extends localize(withTopAppBar(PageViewElement)) {
  public static styles = [sharedStyles, styles];

  protected render = template;
}

declare global {
  interface HTMLElementTagNameMap {
    'info-page': InfoPage;
  }
}
