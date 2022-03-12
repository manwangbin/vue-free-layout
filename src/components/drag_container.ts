import { defineComponent, h, Ref, ref } from 'vue'

export default defineComponent({
  name: 'DragContainer',

  props: {
    x: {
      type: Number,
      required: true
    },

    y: {
      type: Number,
      required: true
    },

    width: {
      type: Number,
      required: true
    },

    height: {
      type: Number,
      required: true
    }
  },

  setup () {
    const state:Ref<number> = ref(0)
    const renderActions = () => {
      if (state.value > 0) {
        return h(
          'div',
          {
            class: 'controller',
            style: {
              left: '0px',
              top: '0px'
            }
          },
          [
          ]
        )
      }
    }

    return { renderActions }
  },

  render () {
    return h(
      'div',
      {
        class: 'drag_container',
        style: {
          left: this.$props.x + 'px',
          top: this.$props.y + 'px',
          width: this.$props.width + 'px',
          height: this.$props.height + 'px'
        }
      },
      [
        this.$slots.default && this.$slots.default(),
        this.renderActions()
      ]
    )
  }
})
