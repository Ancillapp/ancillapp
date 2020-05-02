import { html } from 'lit-element';
import { LoadingButton } from './loading-button.component';

import '@material/mwc-button';
import '../loading-spinner/loading-spinner.component';

export default function template(this: LoadingButton) {
  return html`
    <mwc-button
      ?loading="${this.loading}"
      ?raised="${this.raised}"
      ?unelevated="${this.unelevated}"
      ?outlined="${this.outlined}"
      ?dense="${this.dense}"
      ?disabled="${this.disabled || this.loading}"
      ?trailingIcon="${this.trailingIcon}"
      ?fullwidth="${this.fullwidth}"
      icon="${this.icon}"
      label="${this.label}"
    ></mwc-button>
    <loading-spinner size="1" ?hidden="${!this.loading}"></loading-spinner>
  `;
}
