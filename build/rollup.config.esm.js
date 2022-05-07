// rollup.config.esm.js
import baseConfig, { name, file } from './rollup.config'

export default {
  ...baseConfig,
  output: {
    name,
    file: file('esm'),
    format: 'es'
  }
}
