import { PageViewElement } from '../page-view-element';

import template from './template';

class HomePage extends PageViewElement {
  constructor() {
    super();
    this.loadResourceForLocale(`locales/home/${this.globalLocale}.ftl`, this.globalLocale)
      .then(() => this.requestRender());
    this._today = this.yyyymmdd(new Date());
  }

  yyyymmdd(date) {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${date.getFullYear()}-${m > 9 ? m : '0' + m}-${d > 9 ? d : '0' + d}`;
  }

  _render() {
    return this::template();
  }
}

window.customElements.define('home-page', HomePage);
