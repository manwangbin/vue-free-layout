import { name } from '../package.json'
import typescript from 'rollup-plugin-typescript2'
import vuePlugin from 'rollup-plugin-vue'
import nodeResolve from '@rollup/plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'
import postcssImport from 'postcss-import'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import esbuild from 'rollup-plugin-esbuild'
import json from '@rollup/plugin-json'
import alias from '@rollup/plugin-alias'

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
    babel({
      exclude: "node_modules/**"
    }),
    nodeResolve({
      jsnext: true,
      main: true,
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.vue']
    }),
    alias(),
    json(),
    typescript({
      tsconfigOverride:overrides
    }),
    vuePlugin(),
    postcss({
      extensions: ['.pcss', '.less', '.css'],
      extract: true,
      plugins: [require('autoprefixer'),postcssImport()]
    }),
    commonjs({
      include: [
          "node_modules/**",
          "node_modules/**/*"
      ]
    }),
    esbuild()
  ],
  external: ['vue'] // 依赖模块
}
