declare module 'terser-webpack-plugin';

declare module 'html-webpack-plugin';

declare module 'copy-webpack-plugin';

declare module 'webpack-bundle-analyzer-brotli' {
  export * from 'webpack-bundle-analyzer';
}

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

declare module '*.md' {
  export interface Changelog {
    version: string;
    date: string;
    news: string[];
  }

  export const version: Changelog['version'];
  export const date: Changelog['date'];
  export const news: Changelog['news'];
}

interface WakeLockSentinel extends EventTarget {
  release(): Promise<void>;
  readonly type: 'screen';
  readonly onrelease: EventHandlerNonNull;
}

interface WakeLock {
  request(type: 'screen'): Promise<WakeLockSentinel>;
}

interface Navigator {
  readonly wakeLock: WakeLock;
}
