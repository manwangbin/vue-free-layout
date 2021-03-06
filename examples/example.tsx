import DesignCanvase from '@/components/design_canvase'
import DesignPanel from '@/components/free_design'
import { Widget } from '@/types'
import { defineComponent, ref, Ref } from 'vue'
import Header from './header'
import './style.less'
import WidgetPanel from './widget_panel'

export default defineComponent({
  name: 'ExamplePanel',

  components: {
    DesignPanel,
    DesignCanvase,
    WidgetPanel
  },

  setup () {
    const children: Ref<Array<Widget>> = ref([
      { id: 'div1', tag: 'div', x: 0, y: 0, width: 300, height: 140, margin: [0] },
      { id: 'div2', tag: 'div', x: 0, y: 0, width: 100, height: 100, margin: [0] },
      { id: 'div3', tag: 'div', x: 0, y: 0, width: 100, height: 100, margin: [0] },
      { id: 'div4', tag: 'div', x: 0, y: 0, width: 100, height: 100, margin: [0] },
      { id: 'div5', tag: 'div', x: 0, y: 0, width: 160, height: 120, margin: [0] },
      { id: 'div6', tag: 'div', x: 0, y: 0, width: 100, height: 100, margin: [0] },
      { id: 'div7', tag: 'div', x: 0, y: 0, width: 100, height: 100, margin: [0] },
      { id: 'div8', tag: 'div', x: 0, y: 0, width: 100, height: 100, margin: [0] },
      { id: 'div9', tag: 'div', x: 0, y: 0, width: 100, height: 100, margin: [0] },
      { id: 'div10', tag: 'div', x: 0, y: 0, width: 100, height: 100, margin: [0] }
    ])

    return () => (
      <DesignPanel
        style="margin:50px 100px;height: 400px;"
        width={595}
        height={842}
        v-slots={{
          header: () => <Header />,
          left: () => <WidgetPanel />,
          right: () => <div style="width:200px; background: #ffffff"/>,
          item: (widget:any) => <input ></input>
        }}
        >
      </DesignPanel>
    )
  }
})
