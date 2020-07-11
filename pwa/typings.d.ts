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
      ecma?:
        | 5
        | 2015
        | 2016
        | 2017
        | 2018
        | 2019
        | 2020
        | 6
        | 7
        | 8
        | 9
        | 10
        | 11;
      safari10?: boolean;
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

declare module 'copy-webpack-plugin';

declare module '*.styles' {
  import { CSSResult } from 'lit-element';

  const content: CSSResult;
  export default content;
}

declare module 'hyperlist' {
  export interface HyperListConfig {
    itemHeight: number;
    total: number;
    generate(index: number): Node;
    reverse?: boolean;
    horizontal?: boolean;
    width?: string | number;
    height?: string | number;
    scrollerTagName?: keyof HTMLElementTagNameMap;
    rowClassName?: string;
    overrideScrollPosition?: boolean;
    applyPatch?(node: Node, fragment: DocumentFragment): void;
    afterRender?(): void;
    scroller?: Node;
    useFragment?: boolean;
  }

  export default class HyperList {
    constructor(node: Node, config: HyperListConfig);
    static create(node: Node, config: HyperListConfig): HyperList;
    refresh(node: Node, config: HyperListConfig): void;
  }
}

declare module 'remark-html';
declare module 'remark-breaks';

declare module '*.po' {
  import type { CompiledMessage } from '@lingui/core/cjs/i18n';

  const content: { messages: Record<string, CompiledMessage> };
  export default content;
}
