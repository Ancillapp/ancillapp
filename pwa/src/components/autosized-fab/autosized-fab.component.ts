import { LitElement, customElement, query, property } from 'lit-element';
import { localize, SupportedLocale } from '../../helpers/localize';

import sharedStyles from '../shared.styles';
import styles from './autosized-fab.styles';
import template from './autosized-fab.template';

import { installMediaQueryWatcher } from 'pwa-helpers';

@customElement('autosized-fab')
export class AutosizedFAB extends localize(LitElement) {
  public static styles = [sharedStyles, styles];

  protected render = template;

  @property({ type: Boolean })
  public disabled = false;

  @property({ type: Boolean })
  public extended = false;

  @property({ type: String })
  public icon = '';

  @property({ type: String })
  public label = '';

  @property({ type: Boolean })
  protected _mini = true;

  constructor() {
    super();

    installMediaQueryWatcher(
      '(min-width: 28.75rem)',
      (matches) => (this._mini = !matches),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'autosized-fab': AutosizedFAB;
  }
}
