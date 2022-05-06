import FreeDesign from './components/free_design'
import { App, Plugin } from 'vue'

FreeDesign.install = (app: App) => {
  app.component(FreeDesign.name, FreeDesign)
  return app
}

export default FreeDesign as typeof FreeDesign & Plugin
