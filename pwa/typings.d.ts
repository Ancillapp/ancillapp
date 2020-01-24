declare module 'script-ext-html-webpack-plugin' {
  import { Plugin } from 'webpack';

  export interface ScriptExtHtmlWebpackPluginConfig {
    defaultAttribute?: string;
  }

  export default class ScriptExtHtmlWebpackPlugin extends Plugin {
    public constructor(options: ScriptExtHtmlWebpackPluginConfig);
  }
}

declare module 'terser-webpack-plugin' {
  import { Plugin, Node } from 'webpack';

  export interface TerserPluginConfiguration {
    cache?: boolean;
    parallel?: boolean;
    extractComments?:
      | boolean
      | 'all'
      | 'some'
      | RegExp
      | ((node: Node, comment: { value: string }) => boolean)
      | {
          condition: RegExp;
          filename(file: string): string;
          banner(licenseFile: string): string;
        };
    terserOptions?: {
      compress?: {
        drop_console?: boolean;
      };
    };
  }

  export default class TerserPlugin extends Plugin {
    public constructor(config?: TerserPluginConfiguration);
  }
}

declare module 'html-webpack-plugin';
