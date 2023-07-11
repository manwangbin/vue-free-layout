import { DesignPanel, useDesignPanel} from "../src";
// import {DesignPanel, useDesignPanel} from "../dist/vue3-free-layout.esm";
// import "../dist/vue3-free-layout.esm.css"
import { defineComponent, Ref, ref, h, onMounted, computed, reactive } from "vue";
import Header from './header'
import WidgetPanel from './widget_panel'
import { Package } from "./package/index";
import { stateMap } from "./package/hooks";
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


    setTimeout(()=>{
      service.model.template = {
        components: [
          {
            "id": "34o0epSH-e-SZyDFKHk6w",
            "x": 10,
            "y": 60.5,
            "enableResize": true,
            "enableDragable": true,
            "tag": "TextField",
            "name": "文本",
            "width": 821,
            "height": 75,
            "margin": [
              0
            ],
            "padding": [
              0
            ],
            "state": 0,
            "moveing": false,
            "resizing": false,
            "baseX": 10,
            "baseY": 60.5,
            "isOverlapping": false,
            basicContentCrocessing: {
              "title": {
                "fontType": "黑体",
                "fontSize": 14,
                "rotation": 0,
                "bolded": false,
                "slanting": false,
                "underline": false
              },
              "content": {
                "fontType": "黑体",
                "fontSize": 18,
                "rotation": 0,
                "bolded": false,
                "slanting": false,
                "underline": false
              }
            }
          },
          {
            "id": "njLCpAAMgGWjb9WdCDsEu",
            "x": 10,
            "y": 225.5,
            "enableResize": true,
            "enableDragable": true,
            "tag": "TextField",
            "name": "文本",
            "width": 821,
            "height": 75,
            "margin": [
              0
            ],
            "padding": [
              0
            ],
            "state": 1,
            "moveing": false,
            "resizing": false,
            "baseX": 17,
            "baseY": 225.5,
            "isOverlapping": false
          }
        ]
      }
    }, 1000)


    setTimeout(()=>{
      service.model.template = null
    },3000)

    function onDragEnd(widget){
      // console.log('onDragEnd', widget);
      // widget.x = 10
      // updateWidget(widget)
    }

    return { onDragEnd, designPanel, stateMap, createWidget, widgets }
  },

  render () {
    return (
      <DesignPanel
        ref="designPanel"
        style="height: 100vh;"
        stateMap={stateMap}
        value={this.widgets}
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
        showDelBut={true}
        v-slots={{
          header: () => <Header />,
          left: () => <WidgetPanel onCreateWidget={(widget: Widget) => this.createWidget(widget)} />,
          right: () => <div style="width:200px; background: #ffffff"><OperationPanel></OperationPanel></div>,
          item: (widget:any) => h(Package[widget.tag], widget)
            // <input style="width: 100%;box-sizing: border-box;"></input>
        }}
        onDrag-end={(widget) => this.onDragEnd(widget)}
        onDelWidgets={(w)=>console.log('onDelWidgets',w)}
        onSelectedChange={(ws)=>console.log('onSelectedChange',ws)}
        >
      </DesignPanel>
    )
  }
})
