import DesignContainerService from '@/services/design.service'
import { defineComponent, h, inject } from 'vue'
import { nanoid } from 'nanoid'

export default defineComponent({
  name: 'WidgetPanel',

  setup () {
    const containerService = inject(DesignContainerService.token) as DesignContainerService
    const renderWidgets = () => {
      return h(
        'div',
        {
          style: { lineHeight: '50px', textAlign: 'center' },
          onmousedown: (event: MouseEvent) => containerService.createWidgetHandler({ id: nanoid(), tag: 'input', x: 0, y: 0, width: 120, height: 60, margin: [0] }, event)
        },
        ['测试控件']
      )
    }
    return { renderWidgets }
  },

  render () {
    return h(
      'div',
      {
        style: { width: '200px', background: '#FFFFFF' }
      },
      [
        this.renderWidgets()
      ]
    )
  }
})
