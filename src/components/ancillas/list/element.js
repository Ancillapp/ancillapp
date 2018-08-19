import { PageViewElement } from '../../page-view-element';
import template from './template';

class AncillasList extends PageViewElement {
  static properties = {
    _needUserNotificationsPermission: Boolean,
  };

  constructor() {
    super();
    if (Notification.permission === 'default') {
      this._needUserNotificationsPermission = true;
    }
  }

  _render(props) {
    if (!this._ancillas) {
      this._ancillas =
        fetch('/api/ancillas')
          .then((res) => res.json())
          .then(({ data }) => data);
    }
    return this::template({
      ...props,
      _ancillas: this._ancillas,
    });
  }

  async _updateNotificationsPermission(grant) {
    this._needUserNotificationsPermission = false;
    if (!grant) {
      return;
    }
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration) {
      return;
    }
    const pushSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: new Uint8Array([
        4, 12, 223, 82, 207, 103, 63, 216, 215, 188, 194, 38, 255, 91, 171, 245,
        132, 190, 242, 133, 124, 56, 160, 3, 91, 122, 176, 229, 117, 129, 100, 200,
        165, 144, 136, 51, 112, 200, 230, 16, 53, 59, 140, 206, 141, 47, 164, 86, 219,
        154, 154, 105, 252, 231, 23, 206, 158, 134, 42, 2, 243, 131, 34, 157, 22,
      ]),
    });
    if (Notification.permission !== 'granted') {
      return;
    }
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pushSubscription),
    });
  }
}

window.customElements.define('ancillas-list', AncillasList);
