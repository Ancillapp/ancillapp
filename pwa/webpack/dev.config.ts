import HtmlPlugin from 'html-webpack-plugin';
import path from 'path';
import { Configuration as WebpackConfiguration } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
import { smart as smartMerge } from 'webpack-merge';
import baseConfig from './base.config';
import { InjectManifest as InjectManifestPlugin } from 'workbox-webpack-plugin';
import { NormalModuleReplacementPlugin } from 'webpack';

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const config: Configuration = smartMerge(baseConfig, {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    hot: true,
    compress: true,
    overlay: true,
    port: parseInt(`${process.env.PORT}`, 10) || 8080,
    historyApiFallback: true,
    host: '0.0.0.0',
  },
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
  plugins: [
    new NormalModuleReplacementPlugin(
      /^firebase\/analytics$/,
      path.resolve(__dirname, '../src/mocks/analytics'),
    ),
    // firebase/analytics
    new HtmlPlugin({
      inject: 'head',
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
