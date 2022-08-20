import { Options } from '@vitejs/plugin-vue'
import hljs from 'highlight.js'
import MarkdownItContainer from 'markdown-it-container'
import { VitePWAOptions } from 'vite-plugin-pwa'
import { VitePluginMdOptions, TokenItem } from './interfaces'
import { resolve } from 'path'

// Vue 插件配置
export const vueConfig: Options = {
  include: [/\.vue$/, /\.md$/],
  reactivityTransform: true
}

// PWA 配置
export const vitePwaConfig: Partial<VitePWAOptions> = {
  registerType: 'prompt',
  includeAssets: ['logo.svg', 'favicon.ico', 'loading.gif'],
  manifest: {
    id: '/dist',
    name: 'vue3-free-layout',
    short_name: 'PWA for vue3-free-layout',
    description: '关于 vue3-free-layout 的 PWA',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/dist/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/dist/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: '/dist/pwa-156x156.svg',
        sizes: '156x156',
        type: 'image/svg',
        purpose: 'any'
      }
    ]
  },
  workbox: {
    globDirectory: resolve(__dirname, '../dist'),
    skipWaiting: true,
    clientsClaim: true
  }
}
