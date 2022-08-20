import { defineComponent, h } from 'vue'
import { nanoid } from 'nanoid'
import { Widget } from '@/types'

export default defineComponent({
  name: 'WidgetPanel',

  emits: ['create-widget'],
  setup (_, { emit }) {
    const renderWidgets = () => {
      return h(
        'div',
        {
          style: { lineHeight: '50px', textAlign: 'center' },
          onmousedown: () => emit('create-widget', { id: nanoid(), tag: 'input', x: 0, y: 0, width: 120, height: 60, margin: [0], enableResize: true } as Widget)
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
