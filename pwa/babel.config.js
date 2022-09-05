module.exports = {
  presets: [
    [
      '@babel/env',
      {
        loose: true,
        bugfixes: true,
        targets: {
          esmodules: true,
        },
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
    '@babel/typescript',
  ],
  plugins: [
    'macros',
    [
      'template-html-minifier',
      {
        modules: {
          'lit-html': ['html', 'svg'], // lit-html
          'lit-element': [
            'html',
            'svg',
            { name: 'css', encapsulation: 'style' },
          ], // lit-element
          lit: ['html', 'svg', { name: 'css', encapsulation: 'style' }], // lit
          '@polymer/polymer/polymer-element': ['html'], // Polymer 3 - exported from Polymer Element
          '@polymer/polymer/lib/utils/html-tag.js': ['html'], // Polymer 3 - exported from utils (used by PolymerElements family)
        },
        htmlMinifier: {
          collapseWhitespace: true,
          removeComments: true,
          minifyCSS: true,
        },
      },
    ],
    [
      '@babel/proposal-decorators',
      {
        decoratorsBeforeExport: true,
      },
    ],
    [
      '@babel/proposal-class-properties',
      {
        loose: true,
      },
    ],
    [
      '@babel/proposal-optional-chaining',
      {
        loose: true,
      },
    ],
    [
      '@babel/proposal-nullish-coalescing-operator',
      {
        loose: true,
      },
    ],
    '@babel/syntax-dynamic-import',
  ],
};
