/// <reference types="../typings" />
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import {
  Configuration,
  EnvironmentPlugin,
  NormalModuleReplacementPlugin,
} from 'webpack';

const index = process.argv.indexOf('--env');

const fallbackBrowserEnv = process.env.BROWSER_ENV || 'production';

const browserEnv =
  index < 0
    ? fallbackBrowserEnv
    : process.argv[index + 1] || fallbackBrowserEnv;

const config: Configuration = {
  cache: true,
  context: path.resolve(__dirname, '../src'),
  entry: path.resolve(__dirname, '../src/index'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    globalObject: 'self',
  },
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, '../src/components/'),
      '@services': path.resolve(__dirname, '../src/services/'),
      '@helpers': path.resolve(__dirname, '../src/helpers/'),
    },
    extensions: ['.ts', '.js', '.json', '.scss', '.sass', '.css', '.html'],
    mainFields: ['module', 'browser', 'main'],
  },
  module: {
    rules: [
      {
        test: /CHANGELOG/,
        exclude: /node_modules/,
        use: path.resolve(__dirname, 'loaders/changelog-loader.ts'),
      },
      {
        test: /\.po$/,
        exclude: /node_modules/,
        use: [
          path.resolve(__dirname, 'loaders/i18n-postprocess-loader.ts'),
          '@lingui/loader',
        ],
      },
      // TODO: re-add workerize-loader as soon as it gets support for Webpack 5
      // See: https://github.com/developit/workerize-loader/issues/77
      // {
      //   test: /\.worker\.[tj]s$/,
      //   exclude: /node_modules/,
      //   use: 'workerize-loader',
      // },
      {
        test: /\.[tj]s$/,
        exclude: /node_modules\/(?!(@polymer|@material|lit-html|lit-element|pwa-helpers)\/).*/,
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
              postcssOptions: {
                plugins: [
                  'postcss-preset-env',
                  'autoprefixer',
                  [
                    'cssnano',
                    {
                      preset: [
                        'advanced',
                        {
                          autoprefixer: false,
                          zindex: false,
                        },
                      ],
                    },
                  ],
                ],
              },
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
    new EnvironmentPlugin({
      NODE_ENV: 'production',
      BROWSER_ENV: browserEnv,
    }),
    new NormalModuleReplacementPlugin(
      /config\/default(?:\.json)?$/,
      (resource: any) => {
        resource.request = resource.request.replace(
          'config/default',
          `config/${browserEnv}`,
        );
      },
    ),
    new NormalModuleReplacementPlugin(
      /^firebase\/analytics$/,
      (resource: any) => {
        if (browserEnv !== 'production') {
          resource.request = path.resolve(__dirname, '../src/mocks/analytics');
        }
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
  ],
};

export default config;
