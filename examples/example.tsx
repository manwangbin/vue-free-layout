import DesignPanel from '@/components/design_panel'
import { defineComponent, provide } from 'vue'
import Header from './header'
import WidgetPanel from './widget_panel'
import './style.less'
import LtLayoutService from './lt_layout.service'

export default defineComponent({
  name: 'ExamplePanel',

  components: {
    DesignPanel
  },

  setup () {
    const ltLayoutService = new LtLayoutService()
    provide('ltlayout', ltLayoutService)

    return () => (
      <DesignPanel
        style="margin:10px 100px;height: 880px;"
        width={595}
        height={842}
        v-slots={{
          header: () => <Header />,
          left: () => <WidgetPanel />,
          right: () => <div style="width:200px; background: #ffffff"/>,
          item: (widget:any) => <input ></input>
        }}
        layout="ltlayout"
        >
      </DesignPanel>
    )
  }
})
