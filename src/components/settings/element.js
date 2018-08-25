import { PageViewElement } from '../page-view-element';

import template from './template';

class SettingsPage extends PageViewElement {
  constructor() {
    super();
    this.loadResourceForLocale(`/assets/locales/settings/${this.globalLocale}.ftl`, this.globalLocale)
      .then(() => this.requestRender());
  }

  _render(props) {
    return this::template(props);
  }
}

window.customElements.define('settings-page', SettingsPage);
