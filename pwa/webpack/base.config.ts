/// <reference types="../typings" />
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ScriptExtHtmlPlugin from 'script-ext-html-webpack-plugin';
import {
  Configuration,
  EnvironmentPlugin,
  NormalModuleReplacementPlugin,
} from 'webpack';

const config: Configuration = {
  cache: true,
  context: path.resolve(__dirname, '../src'),
  entry: path.resolve(__dirname, '../src/index'),
  output: {
    path: path.resolve(__dirname, '../dist'),
  },
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
                      zindex: false,
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
    new EnvironmentPlugin(['NODE_ENV']),
    new NormalModuleReplacementPlugin(
      /config\/default(?:\.json)?$/,
      (resource: any) => {
        resource.request = resource.request.replace(
          'config/default',
          `config/${process.env.NODE_ENV}`,
        );
      },
    ),
    new CopyPlugin({
      patterns: [
        // Assets
        {
          from: path.resolve(__dirname, '../src/assets'),
          to: '.',
          globOptions: {
            ignore: ['**/.DS_Store'],
          },
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash].css',
      chunkFilename: 'styles/[id].[contenthash].css',
    }),
    new ScriptExtHtmlPlugin({
      defaultAttribute: 'defer',
    }),
  ],
};

export default config;
