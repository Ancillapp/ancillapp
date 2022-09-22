/// <reference types="../typings" />
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ForkTsCheckerPlugin from 'fork-ts-checker-webpack-plugin';
import {
  Configuration,
  EnvironmentPlugin,
  NormalModuleReplacementPlugin,
} from 'webpack';
import { defaultLocale, localesData } from './helpers';
import { localizeHref } from '../src/helpers/localization';

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
    libraryTarget: 'module',
    module: true,
    library: {
      type: 'module',
    },
  },
  experiments: {
    outputModule: true,
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
      {
        test: /\.worker\.[tj]s$/,
        exclude: /node_modules/,
        use: 'workerize-loader',
      },
      {
        test: /\.[tj]s$/,
        exclude:
          /node_modules\/(?!(@polymer|@material|lit|lit-html|lit-element|pwa-helpers)\/).*/,
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
      (resource) => {
        resource.request = resource.request.replace(
          'config/default',
          `config/${browserEnv}`,
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
        // Localized Web App manifests
        ...localesData.map(([locale, localeData]) => ({
          from: path.resolve(__dirname, '../src/site.webmanifest'),
          // Default locale should still go in the root of the dist folder
          to:
            locale === defaultLocale
              ? 'images/icons/site.webmanifest'
              : `localized-files/${locale}/images/icons/site.webmanifest`,
          // Support a light subset of Handlebars template language
          transform: (content: Buffer) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const helpers: Record<string, (...params: any[]) => string> = {
              t: (key: string) => localeData[key] || '',
              localizeHref: (page: string, ...subroutes: string[]) =>
                localizeHref(locale, page, ...subroutes),
            };
            const vars: Record<string, string> = {
              locale,
            };
            const contentStr = content.toString('utf8');
            return contentStr.replace(
              /{{(.+?)}}/g,
              (_, templateContent: string) => {
                const [helperOrVar, ...rawParams] =
                  templateContent.split(/\s+/);
                const parsedParams = rawParams.map((param) =>
                  param.replace(/(^['"]|["']$)/g, ''),
                );
                return parsedParams.length > 0
                  ? helpers[helperOrVar](...parsedParams)
                  : vars[helperOrVar];
              },
            );
          },
        })),
      ],
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash].css',
      chunkFilename: 'styles/[id].[contenthash].css',
    }),
    new ForkTsCheckerPlugin({
      typescript: {
        configFile: path.resolve(__dirname, '../tsconfig.json'),
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
      },
    }),
  ],
};

export default config;
