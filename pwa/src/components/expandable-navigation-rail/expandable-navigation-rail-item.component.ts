import { customElement, property } from 'lit/decorators.js';
import { NavigationRailItem } from 'mdui/components/navigation-rail/navigation-rail-item.js';
import { booleanConverter } from '@mdui/shared/helpers/decorator.js';

import styles from './expandable-navigation-rail-item.styles.scss';

@customElement('expandable-navigation-rail-item')
export class ExpandableNavigationRailItem extends NavigationRailItem {
  public static styles = [NavigationRailItem.styles, styles];

  @property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
  })
  protected expanded = false;
}

declare global {
  interface HTMLElementTagNameMap {
    'expandable-navigation-rail-item': ExpandableNavigationRailItem;
  }
}
