import { DesignWidget, Point } from '@/types'
import { defineComponent, h, inject, PropType } from 'vue'
import DragContainer from './drag_container'
import LayoutService from '../services/layout.service'

export default defineComponent({
  name: 'DesignDrawer',

  props: {
    layout: {
      type: String as PropType<'lt' | 'ct' | 'abslout'>,
      default: 'lt'
    },

    background: {
      type: String,
      required: true
    },

    width: {
      type: Number,
      required: true
    },

    height: {
      type: Number,
      required: true
    },

    padding: {
      type: Array as PropType<Array<number>>,
      default: () => [0]
    }
  },

  emits: ['selected-widget', 'state-changed', 'position-move', 'drag-end'],
  setup (props, { emit, slots }) {
    const layoutSerivce = inject(LayoutService.token) as LayoutService
    const minx = props.padding.length === 4 ? props.padding[3] : props.padding[0]
    const maxx = props.width - (props.padding.length === 4 ? props.padding[1] : props.padding[0])

    const renderChildren = () => {
      if (layoutSerivce.modal.placeWidgets && layoutSerivce.modal.placeWidgets.length > 0) {
        return layoutSerivce.modal.placeWidgets.map(child => {
          if (slots.item) {
            return h(
              DragContainer,
              {
                value: child,
                minx: minx,
                maxx: maxx,
                miny: props.padding[0],
                onSelectedWidget: (data: DesignWidget) => emit('selected-widget', data),
                onStateChanged: (data: DesignWidget) => emit('state-changed', data),
                onPositionMove: (data: Point) => emit('position-move', data),
                onDragEnd: (widget: DesignWidget) => emit('drag-end', widget)
              },
              {
                default: () => slots.item && slots.item(child)
              }
            )
          } else {
            return h(DragContainer,
              {
                value: child,
                minx: minx,
                maxx: maxx,
                miny: props.padding[0]
              }
            )
          }
        })
      } else {
        return []
      }
    }

    return { renderChildren }
  },

  render () {
    return h(
      'div',
      {
        class: 'drawer',
        style: {
          background: this.$props.background,
          width: this.$props.width + 'px',
          height: this.$props.height + 'px'
        }
      },

      this.renderChildren()
    )
  }
})
