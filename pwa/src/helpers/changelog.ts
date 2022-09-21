import en, { Changelog } from '../../../CHANGELOG.md';
import it from '../../../CHANGELOG.it.md';
import de from '../../../CHANGELOG.de.md';
import pt from '../../../CHANGELOG.pt.md';
import { SupportedLocale } from './localize';

export const changelog: Record<SupportedLocale, Changelog> = {
  en,
  it,
  de,
  pt,
};
