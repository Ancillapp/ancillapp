import { ComplexAttributeConverter } from 'lit';
import { toLocalTimeZone } from './utils';

export const dateConverter: ComplexAttributeConverter<Date | null> = {
  fromAttribute: (value) => (value ? new Date(value) : null),
  toAttribute: (value) =>
    value ? toLocalTimeZone(value).toISOString().slice(0, 10) : null,
};

export const requiredDateConverter: ComplexAttributeConverter<Date> = {
  fromAttribute: (value) => (value ? new Date(value) : new Date()),
  toAttribute: (value) => toLocalTimeZone(value).toISOString().slice(0, 10),
};
