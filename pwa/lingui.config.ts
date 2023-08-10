import { formatter } from '@lingui/format-po';

export default {
  catalogs: [
    {
      path: 'src/locales/{locale}',
      include: ['<rootDir>/src/**'],
      exclude: ['**/node_modules/**'],
    },
  ],
  locales: ['it', 'en', 'de', 'pt'],
  fallbackLocales: {
    default: 'it',
  },
  format: formatter({ explicitIdAsDefault: true }),
};
