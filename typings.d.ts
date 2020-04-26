declare module 'gulp-htmllint' {
  export interface GulpHtmllintOptions {
    rules?: any;
    config?: string;
    plugins?: string[];
    failOnError?: boolean;
  }

  export interface GulpHtmllintReporter {
    filepath: string;
    issues: string[];
  }

  export default function GulpHtmllint(
    options?: GulpHtmllintOptions,
    customReporter?: GulpHtmllintReporter,
  ): any;
}

declare module 'gulp-stylelint' {
  export type GulpStylelintFormatter = 'string' | 'verbose' | 'json';

  export interface GulpStylelintReporter {
    formatter: GulpStylelintFormatter;
    save?: string;
    console?: boolean;
  }

  export interface GulpStylelintOptions {
    failAfterError?: boolean;
    reportOutputDir?: string;
    reporters?: GulpStylelintReporter[];
    debug?: boolean;
    fix?: boolean;
  }

  export default function GulpStylelint(options?: GulpStylelintOptions): any;
}

declare module 'script-ext-html-webpack-plugin' {
  import webpack from 'webpack';

  export interface ScriptExtHtmlWebpackPluginConfig {
    defaultAttribute?: string;
  }

  export default class ScriptExtHtmlWebpackPlugin extends webpack.Plugin {
    constructor(options: ScriptExtHtmlWebpackPluginConfig);
  }
}

declare module 'terser-webpack-plugin' {
  import webpack from 'webpack';

  export interface TerserPluginConfiguration {
    cache: boolean;
    parallel: boolean;
    extractComments: boolean;
  }

  export default class TerserPlugin extends webpack.Plugin {
    constructor(config: TerserPluginConfiguration);
  }
}

declare module 'terser' {
  export function minify(code: string): {
    code: string,
  };
}

declare module 'workbox-webpack-plugin' {
  import webpack from 'webpack';

  export interface InjectManifestConfig {
    swSrc: string;
    swDest: string;
    exclude?: RegExp[];
  }

  export class InjectManifest extends webpack.Plugin {
    constructor(config: InjectManifestConfig);
  }
}

declare module '*.styles' {
  import { TemplateResult } from 'lit-html';

  const styles: TemplateResult;
  export default styles;
}

