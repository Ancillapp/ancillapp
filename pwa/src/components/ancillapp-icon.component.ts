import { css, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import * as icons from './icons.js';

@customElement('ancillapp-icon')
export class AncillappIcon extends LitElement {
  public static styles = css`
    :host {
      display: inline-block;
      width: 1em;
      height: 1em;
      line-height: 1;
      font-size: 1.5rem;
      color: inherit;
    }

    svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }
  `;

  @property({ type: String })
  name = '';

  render() {
    const icon = icons[this.name as keyof typeof icons];
    return icon ?? nothing;
  }
}
