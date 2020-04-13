import { LitElement, property, PropertyValues } from 'lit-element';

/**
 * A base class for building elements that act as a page
 * (i.e. that should dynamically appear and disappear)
 */
export class PageViewElement extends LitElement {
  @property({ type: Boolean, reflect: true })
  public active?: boolean;

  protected shouldUpdate(changedProperties: PropertyValues) {
    const newActiveState = changedProperties.get('active') as
      | boolean
      | undefined;
    return newActiveState || typeof newActiveState === 'undefined';
  }
}
