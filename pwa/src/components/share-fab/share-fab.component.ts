import { LitElement, customElement, query, property } from 'lit-element';
import { localize } from '../../helpers/localize';

import sharedStyles from '../shared.styles';
import styles from './share-fab.styles';
import template from './share-fab.template';
import { importIIFE } from '../../helpers/utils';

import type { ShareMenu } from 'share-menu';

declare global {
  interface Window {
    fbAsyncInit: Function;
  }

  interface Navigator {
    share: (options: {
      url?: string;
      text?: string;
      title?: string;
    }) => Promise<void>;
  }
}

const shareReadyPromise =
  typeof navigator.share === 'function'
    ? Promise.resolve()
    : Promise.all([
        import('share-menu'),
        import('share-menu/targets/whatsapp'),
        import('share-menu/targets/telegram'),
        import('share-menu/targets/facebook'),
        import('share-menu/targets/sms'),
        import('share-menu/targets/email'),
        import('share-menu/targets/twitter'),
        import('share-menu/targets/pinterest'),
        import('share-menu/targets/tumblr'),
        new Promise((resolve, reject) => {
          window.fbAsyncInit = () => {
            FB.init({
              appId: '479712196089264',
              version: 'v7.0',
            });
            resolve();
          };
          importIIFE('https://connect.facebook.net/en_US/sdk.js').catch(reject);
        }),
      ]);

@customElement('share-fab')
export class ShareFAB extends localize(LitElement) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: String, reflect: true })
  public title = '';

  @property({ type: String, reflect: true })
  public text = '';

  @property({ type: String, reflect: true })
  public url = '';

  @query('share-menu')
  private _shareMenu?: ShareMenu;

  protected async _handleShare() {
    await shareReadyPromise;

    const shareParams = {
      title: this.title,
      text: this.text,
      url: this.url,
    };

    await (typeof this._shareMenu?.share === 'function'
      ? this._shareMenu.share(shareParams)
      : navigator.share(shareParams));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'share-fab': ShareFAB;
  }
}
