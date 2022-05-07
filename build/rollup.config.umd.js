import baseConfig, { file } from './rollup.config'

export default {
  ...baseConfig,
  output: {
    name: 'FreeLayout', // 组件库全局对象
    file: file('umd'),
    format: 'umd', // umd 模式
    globals: {
      vue: 'Vue' // vue 全局对象名称，若有 lodash 则应为 _
    },
    exports: 'named'
  }
}
