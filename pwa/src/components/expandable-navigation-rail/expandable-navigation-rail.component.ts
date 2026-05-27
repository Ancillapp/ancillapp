import { customElement, property } from 'lit/decorators.js';
import { watch } from '@mdui/shared/decorators/watch.js';
import { booleanConverter } from '@mdui/shared/helpers/decorator.js';
import { NavigationRail } from 'mdui/components/navigation-rail/navigation-rail.js';
import { $ } from '@mdui/jq/$.js';

import styles from './expandable-navigation-rail.styles.scss';

@customElement('expandable-navigation-rail')
export class ExpandableNavigationRail extends NavigationRail {
  public static styles = [NavigationRail.styles, styles];

  @property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
  })
  public expanded = false;

  @watch('expanded', true)
  private async onExpandedChange() {
    // @ts-expect-error - Accessing private member
    this.updateItems();

    if (this.isParentLayout) {
      return;
    }

    // @ts-expect-error - Accessing private member
    await this.definedController.whenDefined();
    await this.updateComplete;

    // @ts-expect-error - Accessing private member
    $(this.parentTarget).css({
      // @ts-expect-error - Accessing private member
      paddingLeft: this.isRight ? null : this.paddingValue,
      // @ts-expect-error - Accessing private member
      paddingRight: this.isRight ? this.paddingValue : null,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'expandable-navigation-rail': ExpandableNavigationRail;
  }
}
