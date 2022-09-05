import { svg } from 'lit';
import { LoadingSpinner } from './loading-spinner.component';

export default function template(this: LoadingSpinner) {
  return svg`
    <svg
      width="${this.size}rem"
      height="${this.size}rem"
      viewBox="0 0 66 66"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        class="path"
        fill="none"
        stroke-width="6"
        stroke-linecap="round"
        cx="33"
        cy="33"
        r="30"
      ></circle>
    </svg>
  `;
}
