/* eslint-env node, es6 */

const { resolve } = require('path');
const { minify } = require('uglify-es');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { loader: miniCssExtractLoader } = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const { smartStrategy: smartMerge } = require('webpack-merge');
const baseConfig = require('./base.config');

const sassConfig = [
  {
    loader: 'css-loader',
    options: {
      importLoaders: 2,
    },
  },
  {
    loader: 'postcss-loader',
    options: {
      ident: 'postcss',
      plugins: () => [
        require('postcss-preset-env')(),
        require('autoprefixer')(),
      ],
    },
  },
  {
    loader: 'sass-loader',
    options: {
      includePaths: ['./node_modules'],
    },
  },
];

module.exports = smartMerge({
  plugins: 'prepend',
})(baseConfig, {
  mode: 'production',
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        extractComments: true,
      }),
      new OptimizeCssAssetsPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
      name: false,
    },
  },
  module: {
    rules: [
      {
        test: /components\/.*\.s?[ac]ss$/,
        use: [
          {
            loader: 'to-lit-html-loader',
          },
          ...sassConfig,
        ],
      },
      {
        test: /styles\/.*\.s?[ac]ss$/,
        exclude: /components\/.*\.s?[ac]ss$/,
        use: [
          {
            loader: miniCssExtractLoader,
          },
          ...sassConfig,
        ],
      },
    ],
  },
  plugins: [
    new CleanPlugin(['build'], { root: resolve(__dirname, '..') }),
    new HtmlPlugin({
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        sortAttributes: true,
        sortClassName: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: (code) => minify(code).code,
      },
      hash: true,
      inject: 'head',
      template: resolve(__dirname, '../src/index.html'),
    }),
  ],
});
