// rollup.config.js
import { name } from '../package.json'
import typescript from 'rollup-plugin-typescript2'
import vuePlugin from 'rollup-plugin-vue'
// 如果依赖模块中存在 es 模块，需要使用 @rollup/plugin-node-resolve 插件进行转换
import nodeResolve from '@rollup/plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'
import css from 'rollup-plugin-css-only'

const file = (type) => `dist/${name}.${type}.js`

export { // 这里将 file 方法 和 name 导出
  file,
  name
}

const overrides = {
  compilerOptions: { declaration: true }, // 是否创建 typescript 声明文件
  exclude: [ // 排除项
    'node_modules',
    'examples'
  ]
}

export default {
  input: './src/index.ts',
  output: {
    name,
    file: file('esm'),
    format: 'es' // 编译模式
  },
  plugins: [
    nodeResolve(),
    typescript({ tsconfigOverride: overrides }),
    vuePlugin(),
    postcss({
      extensions: ['.pcss', '.less', '.css'],
      extract: false
    }),
    css({ output: 'index.css' })
  ],
  external: ['vue'] // 依赖模块
}
