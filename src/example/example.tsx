import DesignCanvase from '@/components/design_canvase'
import DesignContainer from '@/components/design_container'
import { Widget } from '@/types'
import { defineComponent, h, ref, Ref } from 'vue'
import './style.less'
import WidgetPanel from './widget_panel'

export default defineComponent({
  name: 'ExamplePanel',

  components: {
    DesignContainer,
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
      <DesignContainer class='container'
        v-slots={{
          item: (widget:any) => <input ></input>
        }}
        >
        <WidgetPanel class='widgets' />
        <DesignCanvase
          class="panel"
          width={595}
          height={842}
          v-model:children={children.value}
          padding={[10]}
          v-slots={{
            item: (widget:any) => <input ></input>
          }}
        />
      </DesignContainer>
    )
  }
})
