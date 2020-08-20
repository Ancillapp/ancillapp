import en, { Changelog } from '../../../CHANGELOG.md';
import it from '../../../CHANGELOG.it.md';
import { SupportedLocale } from './localize';

export const changelog: Record<SupportedLocale, Changelog> = {
  en,
  it,
  // TODO: decide whether to maintain a changelog in this languages too
  de: it,
  pt: it,
};
