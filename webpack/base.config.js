const { resolve } = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ScriptExtHtmlPlugin = require('script-ext-html-webpack-plugin');
const { InjectManifest: InjectManifestPlugin } = require('workbox-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  cache: true,
  context: resolve(__dirname, '..'),
  entry: {
    'app': './src/index',
  },
  output: {
    filename: 'components/[name].js',
    chunkFilename: 'components/[id].js',
    path: resolve(__dirname, '../build'),
    pathinfo: !!process.env.DEBUG,
    crossOriginLoading: 'anonymous',
    globalObject: 'self',
  },
  resolve: {
    extensions: ['.js', '.scss', '.css'],
    alias: {
      '~': './src',
    },
    modules: ['./src', 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /workers\/.*\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'worker-loader',
          options: {
            name: 'workers/[name].js',
          },
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              '@babel/plugin-transform-runtime',
              '@babel/plugin-syntax-dynamic-import',
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-function-bind',
            ],
          },
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin([
      // Assets
      {
        from: resolve(__dirname, '../src/assets'),
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
    new InjectManifestPlugin({
      swSrc: resolve(__dirname, '../src/sw.js'),
      swDest: './sw.js',
      exclude: [/images\/icons/, /\.LICENSE$/],
      // TODO: import Workbox from local. See https://github.com/GoogleChrome/workbox/issues/1596
      // importWorkboxFrom: 'local',
    }),
    ...process.env.DEBUG ? [
      new BundleAnalyzerPlugin({
        analyzerHost: 'localhost',
        analyzerPort: 8081,
      })] : [],
  ],
};
