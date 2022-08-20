import { ConfigEnv, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from "@vitejs/plugin-vue-jsx"
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { vueConfig, vitePwaConfig } from './config/plugins'

function pathResolve (dir: string) {
  return resolve(process.cwd(), '.', dir)
}

// https://vitejs.dev/config/
export default ({ command, mode }: ConfigEnv): UserConfig => {
  const isBuild = command === 'build'
  return {
    resolve: {
      alias: [
        { find: /^~/, replacement: resolve(__dirname, '') },
        {
          find: /^@\//,
          replacement: `${pathResolve('src')}/`
        }
      ]
    },

    // server
    server: {
      hmr: { overlay: false }, // 禁用或配置 HMR 连接 设置 server.hmr.overlay 为 false 可以禁用服务器错误遮罩层
      // 服务配置
      open: true, // 类型： boolean | string在服务器启动时自动在浏览器中打开应用程序；
      cors: false, // 类型： boolean | CorsOptions 为开发服务器配置 CORS。默认启用并允许任何源
      host: '0.0.0.0' // IP配置，支持从IP启动
    },

    plugins: [
      vue(vueConfig),
      vueJsx(),
      VitePWA(vitePwaConfig)
    ],

    // build
    build: {
      target: 'es2015',
      minify: 'terser',
      terserOptions: {
        compress: {
          keep_infinity: true,
          drop_console: true,
          drop_debugger: true
        }
      },
      commonjsOptions: {
        ignoreTryCatch: false
      },
      rollupOptions: {
        output: {
        }
      },
      // Turning off brotliSize display can slightly reduce packaging time
      reportCompressedSize: true,
      chunkSizeWarningLimit: 2000
    }
  }
}
