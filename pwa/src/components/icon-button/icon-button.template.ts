import { html, SVGTemplateResult } from 'lit-element';
import { ripple } from '@material/mwc-ripple/ripple-directive';
import { IconButton } from './icon-button.component';
import * as icons from '../icons';

export default function template(this: IconButton) {
  return html`
    <button
      .ripple="${ripple()}"
      class="mdc-icon-button"
      aria-label="${this.label || this.icon}"
      ?disabled="${this.disabled}"
    >
      <i>${(icons as { [key: string]: SVGTemplateResult })[this.icon]}</i>
      <slot></slot>
    </button>
  `;
}
