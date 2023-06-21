import DesignPanel from '@/components/design_panel'
import { defineComponent, Ref, ref, h } from 'vue'
import Header from './header'
import WidgetPanel from './widget_panel'
import { Package } from "./package/index";
import OperationPanel from "./operation_panel.vue";
import { DesignPanelRef, Widget } from '@/types'
import { useDesignPanel } from "../src/hooks/useDesignPanel";
import './style.less'

export default defineComponent({
  name: 'ExamplePanel',

  components: {
    DesignPanel
  },

  setup () {
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
        width={841}
        height={1189}
        showAlign={true}
        enableAdsorb={true}
        alignWeight={1}
        alignColor="#22c6b0"
        showAlignSpan={30}
        adsorbSpan={10}
        showRuler={true}
        pagePadding={[10]}
        v-slots={{
          header: () => <Header />,
          left: () => <WidgetPanel onCreateWidget={(widget: Widget) => this.createWidget(widget)} />,
          right: () => <div style="width:200px; background: #ffffff"><OperationPanel></OperationPanel></div>,
          item: (widget:any) => h(Package[widget.tag], widget)
            // <input style="width: 100%;box-sizing: border-box;"></input>
        }}
        >
      </DesignPanel>
    )
  }
})
