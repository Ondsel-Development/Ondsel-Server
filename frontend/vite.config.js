// Plugins
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import vueJsx from '@vitejs/plugin-vue-jsx';

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

const virtualFile = '@virtual-file'
const virtualId = '\0' + virtualFile
const nestedVirtualFile = '@nested-virtual-file'
const nestedVirtualId = '\0' + nestedVirtualFile

const base = '/test/'

globalThis.__vite_test_filename = __filename
globalThis.__vite_test_dirname = __dirname
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    vueJsx(),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    {
      name: 'virtual',
      resolveId(id) {
        if (id === '@foo') {
          return id
        }
      },
      load(id, options) {
        const ssrFromOptions = options?.ssr ?? false
        if (id === '@foo') {
          // Force a mismatch error if ssrBuild is different from ssrFromOptions
          return `export default { msg: '${
            command === 'build' && !!ssrBuild !== ssrFromOptions
              ? `defineConfig ssrBuild !== ssr from load options`
              : 'hi'
          }' }`
        }
      },
    },
    {
      name: 'virtual-module',
      resolveId(id) {
        if (id === virtualFile) {
          return virtualId
        } else if (id === nestedVirtualFile) {
          return nestedVirtualId
        }
      },
      load(id) {
        if (id === virtualId) {
          return `export { msg } from "@nested-virtual-file";`
        } else if (id === nestedVirtualId) {
          return `export const msg = "[success] from conventional virtual file"`
        }
      },
    },
    // Example of a plugin that injects a helper from a virtual module that can
    // be used in renderBuiltUrl
    (function () {
      const queryRE = /\?.*$/s
      const hashRE = /#.*$/s
      const cleanUrl = (url) => url.replace(hashRE, '').replace(queryRE, '')
      let config

      const virtualId = '\0virtual:ssr-vue-built-url'
      return {
        name: 'built-url',
        enforce: 'post',
        configResolved(_config) {
          config = _config
        },
        resolveId(id) {
          if (id === virtualId) {
            return id
          }
        },
        load(id) {
          if (id === virtualId) {
            return {
              code: `export const __ssr_vue_processAssetPath = (url) => '${base}' + url`,
              moduleSideEffects: 'no-treeshake',
            }
          }
        },
        transform(code, id) {
          const cleanId = cleanUrl(id)
          if (
            config.build.ssr &&
            (cleanId.endsWith('.js') || cleanId.endsWith('.vue')) &&
            !code.includes('__ssr_vue_processAssetPath')
          ) {
            return {
              code:
                `import { __ssr_vue_processAssetPath } from '${virtualId}';__ssr_vue_processAssetPath;` +
                code,
              sourcemap: null, // no sourcemap support to speed up CI
            }
          }
        },
      }
    })(),
  ],
  experimental: {
    renderBuiltUrl(filename, { hostType, type, ssr }) {
      if (ssr && type === 'asset' && hostType === 'js') {
        return {
          runtime: `__ssr_vue_processAssetPath(${JSON.stringify(filename)})`,
        }
      }
    },
  },
  build: {
    minify: false,
  },
  ssr: {
    noExternal: [
      // this package has uncompiled .vue files
      '@vitejs/test-example-external-component',
    ],
  },
  optimizeDeps: {
    exclude: ['@vitejs/test-example-external-component'],
  },
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
})
