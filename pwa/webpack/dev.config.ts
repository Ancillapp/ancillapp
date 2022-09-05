import HtmlPlugin from 'html-webpack-plugin';
import path from 'path';
import { Configuration as WebpackConfiguration } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
import { merge } from 'webpack-merge';
import baseConfig from './base.config';
import { InjectManifest as InjectManifestPlugin } from 'workbox-webpack-plugin';

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const config: Configuration = merge(baseConfig, {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    hot: true,
    compress: true,
    port: parseInt(`${process.env.PORT}`, 10) || 8080,
    historyApiFallback: true,
    host: '0.0.0.0',
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
  plugins: [
    new HtmlPlugin({
      inject: 'head',
      scriptLoading: 'defer',
      template: path.resolve(__dirname, '../src/index.html'),
      showErrors: true,
    }),
    new InjectManifestPlugin({
      swSrc: path.resolve(__dirname, '../src/service-worker/index.ts'),
      swDest: './sw.js',
      exclude: [/images\/icons/, /\.LICENSE$/, /\.map$/, /(?:^|\/)\..+$/],
    }),
  ],
});

export default config;
