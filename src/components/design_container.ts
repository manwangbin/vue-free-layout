import DesignContainerService from '@/services/design_container.service'
import { defineComponent, h, onMounted, ref, Ref } from 'vue'
import DragContainer from './drag_container'
import './style.less'

export default defineComponent({
  name: 'DesignContainer',

  setup () {
    const maxWidth:Ref<number> = ref(0)
    const designContainer: Ref<HTMLElement|undefined> = ref()
    const service = new DesignContainerService()

    onMounted(() => {
      if (designContainer.value) {
        designContainer.value.addEventListener('resize', resizeHandler, true)
      }
    })

    const resizeHandler = () => {
      if (designContainer.value) {
        const elStyle = window.getComputedStyle(designContainer.value)
        if (elStyle) {
          maxWidth.value = parseInt(elStyle.width)
        }
      }
    }

    const renderAddWdiget = () => {
      if (service.modal.addWdiget) {
        return h(
          DragContainer,
          {
            class: 'add-weidget',
            widget: service.modal.addWdiget,
            minx: 0,
            miny: 0,
            maxx: maxWidth.value
          }
        )
      }
    }

    return { designContainer, renderAddWdiget }
  },

  render () {
    return h(
      'div',
      {
        ref: 'designContainer',
        class: 'design-container'
      },
      [this.$slots.default && this.$slots.default(), this.renderAddWdiget()]
    )
  }
})
