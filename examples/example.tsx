import DesignPanel from '@/components/design_panel'
import { defineComponent, Ref, ref } from 'vue'
import Header from './header'
import WidgetPanel from './widget_panel'
import { DesignPanelRef, Widget } from '@/types'
import LtLayoutService from './lt_layout.service'
import './style.less'

export default defineComponent({
  name: 'ExamplePanel',

  components: {
    DesignPanel
  },

  setup () {
    const ltLayoutService = new LtLayoutService()
    const designPanel:Ref<DesignPanelRef|null> = ref(null)

    const createWidgetHandler = (widget: Widget) => {
      if (designPanel.value && designPanel.value) {
        designPanel.value.createWidget(widget)
      }
    }

    return { designPanel, createWidgetHandler }
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
          left: () => <WidgetPanel onCreateWidget={(widget: Widget) => this.createWidgetHandler(widget)} />,
          right: () => <div style="width:200px; background: #ffffff"/>,
          item: (widget:any) => <input style="width: 100%;box-sizing: border-box;"></input>
        }}
        >
      </DesignPanel>
    )
  }
})
