import { html } from 'lit-element';
import {
  ancillasIcon,
  breviaryIcon,
  prayersIcon,
  songsIcon,
} from '../../icons';
import { HomePage } from './home.component';

export default function template(this: HomePage) {
  return html`
    <section>
      <h2>${this.localeData?.peaceAndGood}</h2>
      <ul>
        ${undefined /* <li>
          <a href="/breviary/${new Date().toISOString().slice(0, 10)}">
            <span>${this.localeData?.prayLiturgy}</span>
            ${breviaryIcon}
          </a>
        </li>
        */}
        <li>
          <a href="/prayers">
            <span>${this.localeData?.prayDailyPrayers}</span>
            ${prayersIcon}
          </a>
        </li>
        <li>
          <a href="/songs">
            <span>${this.localeData?.singFraternitySongs}</span>
            ${songsIcon}
          </a>
        </li>
        <li>
          <a href="/ancillas/latest">
            <span>${this.localeData?.readLatestAncilla}</span>
            ${ancillasIcon}
          </a>
        </li>
      </ul>
    </section>
  `;
}
