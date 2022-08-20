import basicConfig, { name, file } from './rollup.config'              
export default {
  ...basicConfig,
  output: {
    name: 'well-bricks',
    file: file('umd'),
    format: 'umd',
    globals: {
      'vue': 'Vue',
    },
    exports: 'named'
  }
}