const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: {
      // page 的入口
      entry: 'examples/main.ts',
      // 模板来源
      template: 'examples/index.html',
      // 在 dist/index.html 的输出
      filename: 'index.html'
    }
  },
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
          },
          javascriptEnabled: true
        }
      }
    }
  },
  // 扩展 webpack 配置
  chainWebpack: (config) => {
    config.resolve.alias.set('~', path.resolve('components'))
    // 没有任何具名导出并直接暴露默认导出
    config.output.libraryExport('default')
  }
})
