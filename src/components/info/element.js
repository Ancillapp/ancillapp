import { PageViewElement } from '../page-view-element';

import template from './template';

class InfoPage extends PageViewElement {
  constructor() {
    super();
    /* this.loadResourceForLocale(`locales/info/${this.globalLocale}.ftl`, this.globalLocale)
      .then(() => this.requestRender()); */
  }

  _render() {
    return this::template();
  }
}

window.customElements.define('info-page', InfoPage);
