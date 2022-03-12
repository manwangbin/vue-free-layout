import DesignPanel from '@/components/design_panel'
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({
  components: {
    DesignPanel
  },

  setup () {
    const children = [{ tag: 'div', x: 0, y: 0, width: 100, height: 100 }, { tag: 'div', x: 101, y: 0, width: 100, height: 100 }]
    return () => (
      <DesignPanel
        width={595}
        height={842}
        children={children}
        v-slots={{
          item: (widget:any) => <div style="background:blue"></div>
        }}
      />
    )
  }
})
