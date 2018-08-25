import { PageViewElement } from '../page-view-element';

import template from './template';

class PrayersPage extends PageViewElement {
  constructor() {
    super();
    /* this.loadResourceForLocale(`/assets/locales/prayers/${this.globalLocale}.ftl`, this.globalLocale)
      .then(() => this.requestRender()); */
  }

  _render() {
    return this::template();
  }
}

window.customElements.define('prayers-page', PrayersPage);
