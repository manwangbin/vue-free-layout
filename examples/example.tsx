import { DesignPanel, useDesignPanel} from "../src";
// import {DesignPanel, useDesignPanel} from "../dist/vue3-free-layout.esm";
// import "../dist/vue3-free-layout.esm.css"
import { defineComponent, Ref, ref, h, onMounted, computed, reactive, watch } from "vue";
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
      changePageSize
    } = useDesignPanel(designPanel)

    const service = reactive({
      model: {
        template: null
      }
    })

    const widgets = computed(()=> service.model.template?.components)

    const height = ref(1189)

    watch(height, () => {
      console.log("watch(height", height.value);
    })

    setTimeout(()=>{
      // position.value = [700, 1500]
      // padding.value = [100, 100, 100, 100]
      // changePageSize(700, 1500, [100, 100, 100, 100])
      height.value = 1500
    },1000)

    const position = ref([841, 1189])

    const padding = ref([10, 10, 10, 10])


    function onDragEnd(widget){
      // console.log('onDragEnd', widget);
      // widget.x = 10
      // updateWidget(widget)
    }

    const onAddNewWidget = () => {
    }

    return {
      height,
      onDragEnd,
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
        v-model:height={this.height}
        showAlign={true}
        enableAdsorb={true}
        alignWeight={1}
        alignColor="#22c6b0"
        showAlignSpan={30}
        adsorbSpan={10}
        showRuler={true}
        pagePadding={this.padding}
        showDelBut={true}
        v-slots={{
          header: () => <Header />,
          left: () => <WidgetPanel onCreateWidget={(widget: Widget) => this.createWidget(widget)} />,
          right: () => <div style="width:200px; background: #ffffff"><OperationPanel></OperationPanel></div>,
          item: (widget:any) => h(Package[widget.tag], widget)
        }}
        onDrag-end={(widget) => this.onDragEnd(widget)}
        onAddNewWidget={(w)=>this.onAddNewWidget(w)}
        onDelNewWidget={(w)=>console.log('onDelNewWidget',w)}
        onDeleted={(w)=>console.log('onDeleted',w)}
        onSelectedChange={(ws)=>console.log('onSelectedChange',ws)}
        onAddHeight={(height, span)=>console.log('onAddHeight', height, span)}
        >
      </DesignPanel>
    )
  }
})
