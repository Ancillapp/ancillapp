import { PageViewElement } from '../page-view-element';

import template from './template';

class HomePage extends PageViewElement {
  yyyymmdd(date) {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${date.getFullYear()}-${m > 9 ? m : '0' + m}-${d > 9 ? d : '0' + d}`;
  }

  _render(props) {
    return this::template({
      ...props,
      _today: this.yyyymmdd(new Date()),
    });
  }
}

window.customElements.define('home-page', HomePage);
