import DesignPanel from './design_panel'
import { App, Plugin } from 'vue'

DesignPanel.install = (app: App) => {
  app.component(DesignPanel.name, DesignPanel)
  return app
}

export default DesignPanel as typeof DesignPanel & Plugin
