module.exports = {
  presets: [
    [
      '@babel/modules',
      {
        loose: true,
      },
    ],
    '@babel/typescript',
  ],
  plugins: [
    [
      'template-html-minifier',
      {
        modules: {
          'lit-html': ['html', 'svg'], // lit-html
          'lit-element': ['html', 'svg'], // lit-element
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
    '@babel/syntax-dynamic-import',
  ],
};
