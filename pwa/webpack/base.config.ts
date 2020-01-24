/// <reference types="../typings" />
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ScriptExtHtmlPlugin from 'script-ext-html-webpack-plugin';
import { Configuration } from 'webpack';

const config: Configuration = {
  cache: true,
  context: path.resolve(__dirname, '../src'),
  entry: path.resolve(__dirname, '../src/components/shell/shell.component'),
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, '../src/components/'),
      '@services': path.resolve(__dirname, '../src/services/'),
      '@helpers': path.resolve(__dirname, '../src/helpers/'),
    },
    extensions: ['.ts', '.js', '.json', '.scss', '.sass', '.css', '.html'],
  },
  module: {
    rules: [
      {
        test: /\.[tj]s$/,
        exclude: /node_modules\/(?!(@polymer|lit-html|lit-element|pwa-helpers)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.s?[ac]ss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: path.resolve(__dirname, 'loaders/to-lit-css-loader.ts'),
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                require('postcss-preset-env')(),
                require('autoprefixer')(),
                require('cssnano')({
                  preset: [
                    'advanced',
                    {
                      autoprefixer: false,
                    },
                  ],
                }),
              ],
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: ['node_modules', 'src/styles'],
              },
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
        from: path.resolve(__dirname, '../src/assets'),
        to: 'assets',
      },
    ]),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].css',
      chunkFilename: 'styles/[id].css',
    }),
    new ScriptExtHtmlPlugin({
      defaultAttribute: 'defer',
    }),
  ],
};

export default config;
