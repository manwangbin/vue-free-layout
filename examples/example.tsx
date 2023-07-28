import { DesignPanel, useDesignPanel} from "../src";
import { defineComponent, Ref, ref, h, computed, reactive } from "vue";
import Header from './header'
import WidgetPanel from './widget_panel'
import { Package } from "./package/index";
import OperationPanel from "./operation_panel.vue";
import { DesignPanelRef, Widget } from '@/types'
import './style.less'

export default defineComponent({
  name: 'ExamplePanel',
  components: {
    DesignPanel
  },

  setup () {
    const designPanel:Ref<DesignPanelRef|null> = ref(null)

    const {
      createWidget,
    } = useDesignPanel(designPanel)

    const service = reactive({
      model: {
        template: null
      }
    })

    const widgets = computed(()=> service.model.template?.components)

    const height = ref(1189)

    const position = ref([841, 1189])

    const padding = ref([10, 10, 10, 10])


    const onAddNewWidget = () => {
    }

    return {
      height,
      designPanel,
      createWidget,
      widgets,
      position,
      padding,
      onAddNewWidget
    }
  },

  render () {
    return (
      <DesignPanel
        ref="designPanel"
        style="height: 100vh;"
        value={this.widgets}
        width={this.position[0]}
        height={this.height}
        showRuler={true}
        pagePadding={this.padding}
        showDelBut={true}
        autoHeight
        v-slots={{
          header: () => <Header />,
          left: () => <WidgetPanel onCreateWidget={(widget: Widget) => this.createWidget(widget)} />,
          right: () => <div style="width:200px; background: #ffffff"><OperationPanel></OperationPanel></div>,
          item: (widget:any) => h(Package[widget.tag], widget)
        }}
        >
      </DesignPanel>
    )
  }
})
