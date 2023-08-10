/// <reference types="../typings" />
import path from 'node:path';
import HtmlPlugin from 'html-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { InjectManifest as InjectManifestPlugin } from 'workbox-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer-brotli';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import baseConfig from './base.config';
import type { WebpackPluginInstance } from 'webpack';

const config: webpack.Configuration = merge(baseConfig, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: '[name].[contenthash].js',
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          ecma: 2017,
          safari10: true,
          compress: {
            drop_console: true,
          },
          format: {
            comments: false,
          },
        },
      }),
    ],
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      maxAsyncRequests: Infinity,
      maxSize: 100000,
    },
  },
  plugins: [
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
        minifyJS: true,
      },
      inject: 'head',
      scriptLoading: 'module',
      template: path.resolve(__dirname, '../src/index.html'),
    }),
    new InjectManifestPlugin({
      swSrc: path.resolve(__dirname, '../src/service-worker/index.ts'),
      swDest: './sw.js',
      exclude: [
        /sitemap\.xml$/,
        /images\/icons/,
        /site\.webmanifest$/,
        /localized-files/,
        /\.LICENSE$/,
        /\.map$/,
        /(?:^|\/)\..+$/,
      ],
    }),
    ...(process.env.ANALYZE_BUNDLE
      ? [new BundleAnalyzerPlugin() as unknown as WebpackPluginInstance]
      : []),
  ],
});

export default config;
