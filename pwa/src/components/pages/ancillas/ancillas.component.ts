import { customElement, property, PropertyValues } from 'lit-element';
import { PageViewElement } from '../page-view-element';

import sharedStyles from '../../shared.styles';
import styles from './ancillas.styles';
import template from './ancillas.template';

@customElement('ancillas-page')
export class AncillasPage extends PageViewElement {
  public static styles = [sharedStyles, styles];

  @property({ type: 'String' })
  public subroute?: string;

  protected render = template;
}

declare global {
  interface HTMLElementTagNameMap {
    'ancillas-page': AncillasPage;
  }
}
