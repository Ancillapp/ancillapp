import { html } from 'lit-element';
import {
  ancillasIcon,
  breviaryIcon,
  prayersIcon,
  songsIcon,
  holyMassIcon,
} from '../../icons';
import { HomePage } from './home.component';

export default function template(this: HomePage) {
  return html`
    <section>
      <h2>${this.localeData?.peaceAndGood}</h2>
      <ul>
        <li>
          <a href="/breviary">
            <span>${this.localeData?.prayLiturgy}</span>
            ${breviaryIcon}
          </a>
        </li>
        <li>
          <a href="/songs">
            <span>${this.localeData?.singFraternitySongs}</span>
            ${songsIcon}
          </a>
        </li>
        <li>
          <a href="/prayers">
            <span>${this.localeData?.prayDailyPrayers}</span>
            ${prayersIcon}
          </a>
        </li>
        <li>
          <a href="/ancillas/latest">
            <span>${this.localeData?.readLatestAncilla}</span>
            ${ancillasIcon}
          </a>
        </li>
        <li>
          <a href="/holy-mass">
            <span>${this.localeData?.bookHolyMassSeat}</span>
            ${holyMassIcon}
          </a>
        </li>
      </ul>
    </section>
  `;
}
