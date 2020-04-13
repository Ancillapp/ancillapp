import HtmlPlugin from 'html-webpack-plugin';
import path from 'path';
import { Configuration as WebpackConfiguration } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
import { smart as smartMerge } from 'webpack-merge';
import baseConfig from './base.config';

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
  },
  output: {
    pathinfo: false,
  },
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
  plugins: [
    new HtmlPlugin({
      inject: 'head',
      template: path.resolve(__dirname, '../src/index.html'),
      showErrors: true,
    }),
  ],
});

export default config;
