import { PageViewElement } from '../page-view-element';

import template from './template';

class BreviaryPage extends PageViewElement {
  constructor() {
    super();
    /* this.loadResourceForLocale(`/assets/locales/breviary/${this.globalLocale}.ftl`, this.globalLocale)
      .then(() => this.requestRender()); */
  }

  _render() {
    return this::template();
  }
}

window.customElements.define('breviary-page', BreviaryPage);
