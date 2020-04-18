import { TemplateResult, html } from 'lit-element';
import { nothing } from 'lit-html';
import { until } from 'lit-html/directives/until';

export const load = <T>(
  promise: Promise<T>,
  onSuccess: (value: T) => TemplateResult,
  onFailure: (error: Error) => TemplateResult = () => html`${nothing}`,
) => until(promise.then(onSuccess).catch(onFailure), html`<p>Loading...</p>`);
