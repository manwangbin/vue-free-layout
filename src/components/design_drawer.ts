import { defineComponent, h, PropType } from 'vue'
import DragContainer from './drag_container'
import ActionDelete from '@/assets/delete.svg'

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

    children: {
      type: Array,
      required: true
    },

    dragProperty: {
      type: Object as PropType<{ x: string, y: string, width: string, height: string }>,
      required: true
    }
  },

  setup (props, { emit, slots }) {
    const renderChildren = () => {
      if (props.children) {
        return props.children.map((child: any) => {
          if (slots.item) {
            return h(
              DragContainer,
              {
                x: child[props.dragProperty.x],
                y: child[props.dragProperty.y],
                width: child[props.dragProperty.width],
                height: child[props.dragProperty.height]
              },
              [
                slots.item(child)
              ]
            )
          } else {
            return h(DragContainer,
              {
                x: child[props.dragProperty.x],
                y: child[props.dragProperty.y],
                width: child[props.dragProperty.width],
                height: child[props.dragProperty.height]
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

      [
        this.renderChildren()
      ]
    )
  }
})
