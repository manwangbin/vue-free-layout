import { computed, defineComponent, h, PropType } from 'vue'

export default defineComponent({
  name: 'HLayout',
  props: {
    align: {
      type: String as PropType<'left' | 'right' | 'center' | 'around' | 'b'>,
      default: 'left'
    },

    valign: {
      type: String as PropType<'top' | 'bottom' | 'middle'>,
      default: 'top'
    },

    margin: {
      type: String,
      default: '0px'
    },

    padding: {
      type: String,
      default: '0px'
    }
  },

  setup (props) {
    const justContent = computed(() => {
      switch (props.align) {
        case 'left':
          return 'flex-start'

        case 'right':
          return 'flex-end'

        default:
          return 'center'
      }
    })

    const alignItems = computed(() => {
      switch (props.valign) {
        case 'top':
          return 'flex-start'

        case 'bottom':
          return 'flex-end'

        default:
          return 'center'
      }
    })

    return { justContent, alignItems }
  },

  render () {
    const { margin, padding } = this.$props
    return h(
      'div',
      {
        style: {
          margin: margin,
          padding: padding,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: this.justContent,
          alignItems: this.alignItems
        }
      },
      [
        this.$slots.default && this.$slots.default()
      ]
    )
  }
})
