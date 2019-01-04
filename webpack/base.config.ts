/* tslint:disable */
/// <reference types="../typings" />

import { resolve } from 'path';
import webpack from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import ScriptExtHtmlPlugin from 'script-ext-html-webpack-plugin';
import { InjectManifest as InjectManifestPlugin } from 'workbox-webpack-plugin';

const config: webpack.Configuration = {
  cache: true,
  context: resolve(__dirname, '..'),
  entry: ['./src/index'],
  output: {
    filename: 'components/[name].js',
    chunkFilename: 'components/[id].js',
    path: resolve(__dirname, '../build', process.env.BUILD_NAME || ''),
    publicPath: '/',
    pathinfo: false,
    crossOriginLoading: 'anonymous',
    globalObject: 'self',
  },
  resolve: {
    extensions: ['.ts', '.js', '.scss', '.css', '.ejs'],
    modules: ['./src', 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.[tj]s$/,
        exclude: /node_modules[\/\\](?!(pwa-helpers|@polymer)[\/\\]).*/,
        use: {
          loader: 'babel-loader',
          options: {
            ...require(resolve(__dirname, '../babel.config.js')),
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.s?[ac]ss$/,
        use: [
          {
            loader: 'to-lit-html-loader',
          },
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
        ],
      },
    ],
  },
  plugins: [
    new CopyPlugin([
      // Assets
      {
        from: resolve(__dirname, '../src/assets'),
        to: '.',
      },
    ]),
    new ScriptExtHtmlPlugin({
      defaultAttribute: 'defer',
    }),
    ...process.env.ENABLE_SW ? [
      new InjectManifestPlugin({
        swSrc: resolve(__dirname, '../src/service-worker.js'),
        swDest: './service-worker.js',
        exclude: [/hot-update/, /images\/icons/, /browserconfig\.xml/, /robots\.txt/, /\.LICENSE$/],
      }),
    ] : [],
  ],
};

export default config;
