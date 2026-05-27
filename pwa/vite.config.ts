import path from 'node:path';
import { defineConfig } from 'vite';
import { lingui } from '@lingui/vite-plugin';
import swc from 'unplugin-swc';
import { transform as swcTransform } from '@swc/core';
import { VitePWA } from 'vite-plugin-pwa';
import checker from 'vite-plugin-checker';
import { visualizer } from 'rollup-plugin-visualizer';
import autoprefixer from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';
import cssnano from 'cssnano';
import { createHtmlPlugin } from 'vite-plugin-html';
import { changelog } from './vite-plugins/changelog';
import { litCss } from './vite-plugins/lit-css';
import { i18nPostprocess } from './vite-plugins/i18n-postprocess';
import { manifestLocalize } from './vite-plugins/manifest-localize';

export default defineConfig(({ mode }) => ({
  root: path.resolve(__dirname),
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components/'),
      '@helpers': path.resolve(__dirname, 'src/helpers/'),
      '@services': path.resolve(__dirname, 'src/services/'),
    },
    mainFields: ['module', 'browser', 'main'],
  },

  css: {
    postcss: {
      plugins: [
        postcssPresetEnv(),
        autoprefixer(),
        cssnano({
          preset: [
            'advanced',
            {
              autoprefixer: false,
              zindex: false,
            },
          ],
        }),
      ],
    },
  },

  plugins: [
    // --- Pre-plugins: handle custom file types before Vite's own pipeline ---
    changelog(),
    litCss(),

    // unplugin-swc's include filter is /\.m?[jt]sx?$/ which does NOT match
    // URLs with Vite's "?worker_file&type=module" query params.  Since esbuild
    // is globally disabled, those worker files would be served as raw
    // TypeScript.  This plugin compiles them before the rest of the pipeline.
    {
      name: 'swc-worker-ts',
      enforce: 'pre' as const,
      async transform(code: string, id: string) {
        if (!id.includes('?worker_file')) return null;
        const baseId = id.split('?')[0];
        if (!/\.[mc]?tsx?$/.test(baseId)) return null;
        const result = await swcTransform(code, {
          filename: baseId,
          sourceMaps: true,
          jsc: {
            parser: { syntax: 'typescript', decorators: true },
            transform: {
              legacyDecorator: true,
              useDefineForClassFields: false,
            },
          },
        });
        return {
          code: result.code,
          map: result.map ? JSON.parse(result.map) : null,
        };
      },
    },

    // Redirect config/default.json to the environment-specific config file,
    // replicating webpack's NormalModuleReplacementPlugin behaviour.
    {
      name: 'config-env-replace',
      enforce: 'pre' as const,
      async resolveId(id, importer) {
        const resolved = await this.resolve(id, importer, { skipSelf: true });
        if (resolved && /\/config\/default\.json$/.test(resolved.id)) {
          return resolved.id.replace(
            /\/config\/default\.json$/,
            `/config/${mode}.json`,
          );
        }
        return null;
      },
    },

    // --- TypeScript + Lingui macro transforms via SWC ---
    swc.vite({
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          legacyDecorator: true,
          useDefineForClassFields: false,
        },
        experimental: {
          plugins: [['@lingui/swc-plugin', {}]],
        },
      },
    }),

    // --- i18n: .po file compilation then markdown post-processing ---
    lingui(),
    i18nPostprocess(),

    // --- Web App Manifest localisation ---
    manifestLocalize(),

    // --- HTML templating: EJS variables injected into index.html ---
    // In dev mode vite-plugin-pwa compiles the SW as an ES module and serves
    // it at '/dev-sw'; production keeps the standard 'sw.js' classic path.
    createHtmlPlugin({
      inject: {
        data: {
          swPath: mode === 'development' ? '/dev-sw.js?dev-sw' : 'sw.js',
          swType: mode === 'development' ? 'module' : 'classic',
        },
      },
    }),

    // --- Service Worker via Workbox injectManifest ---
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src/service-worker',
      filename: 'sw.ts',
      injectRegister: null,
      manifest: false,
      devOptions: {
        enabled: true,
        type: 'module',
      },
      injectManifest: {
        globIgnores: [
          'sitemap.xml',
          'images/icons/**',
          '**/*.webmanifest',
          'localized-files/**',
          '**/*.LICENSE',
          '**/*.map',
          '**/.*',
        ],
        // The SW sub-build runs independently and doesn't inherit the parent
        // plugins, so the changelog() plugin must be registered separately.
        buildPlugins: {
          vite: [changelog()],
        },
      },
    }),

    // --- Development: TypeScript type checking ---
    // checker({ typescript: true }),

    // --- Optional bundle visualizer (ANALYZE_BUNDLE=1 bun run build) ---
    ...(process.env.ANALYZE_BUNDLE
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [visualizer({ open: true, gzipSize: true, brotliSize: true }) as any]
      : []),
  ],

  worker: {
    format: 'es',
    // worker.plugins is a separate pipeline from the main build (defaults to
    // []). Since esbuild is globally disabled, worker TypeScript files need
    // their own SWC plugin for production builds. Lingui macros are not used
    // in workers, so the @lingui/swc-plugin is omitted here.
    plugins: () => [
      swc.vite({
        jsc: {
          parser: { syntax: 'typescript', decorators: true },
          transform: {
            legacyDecorator: true,
            useDefineForClassFields: false,
          },
        },
      }),
    ],
  },

  server: {
    host: '0.0.0.0',
    port: parseInt(`${process.env.PORT}`, 10) || 8080,
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },
}));
