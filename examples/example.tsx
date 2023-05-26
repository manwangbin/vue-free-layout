import DesignPanel from '@/components/design_panel'
import { defineComponent, Ref, ref } from 'vue'
import Header from './header'
import WidgetPanel from './widget_panel'
import OperationPanel from "./operation_panel.vue";

import { DesignPanelRef, Widget } from '@/types'
import LtLayoutService from './lt_layout.service'
import './style.less'
import { useDesignPanel } from "../src/hooks/useDesignPanel";

export default defineComponent({
  name: 'ExamplePanel',

  components: {
    DesignPanel
  },

  setup () {
    const ltLayoutService = new LtLayoutService()
    const designPanel:Ref<DesignPanelRef|null> = ref(null)

    const {
      createWidget
    } = useDesignPanel(designPanel)


    return { designPanel, createWidget }
  },

  render () {
    return (
      <DesignPanel
        ref="designPanel"
        style="margin:10px 100px;height: 880px;"
        width={595}
        height={842}
        showAlign={true}
        enableAdsorb={true}
        alignWeight={2}
        alignColor="#22c6b0"
        showAlignSpan={30}
        adsorbSpan={10}
        v-slots={{
          header: () => <Header />,
          left: () => <WidgetPanel onCreateWidget={(widget: Widget) => this.createWidget(widget)} />,
          right: () => <div style="width:200px; background: #ffffff"><OperationPanel></OperationPanel></div>,
          item: (widget:any) => <input style="width: 100%;box-sizing: border-box;"></input>
        }}
        >
      </DesignPanel>
    )
  }
})
