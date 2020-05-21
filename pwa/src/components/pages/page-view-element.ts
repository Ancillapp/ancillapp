import { LitElement, property, PropertyValues } from 'lit-element';

/**
 * A base class for building elements that act as a page
 * (i.e. that should dynamically appear and disappear)
 */
export class PageViewElement extends LitElement {
  @property({ type: Boolean, reflect: true })
  public active = false;

  protected shouldUpdate(changedProperties: PropertyValues) {
    return super.shouldUpdate(changedProperties) && this.active;
  }
}
