import DesignService from '../services/design.service'
import DraggingService from '../services/dragging.service'
import { DesignWidget } from '../types'
import { computed, defineComponent, h, inject, onMounted, PropType, Ref, ref } from 'vue'

export default defineComponent({
  name: 'DragContainer',

  props: {
    value: {
      type: Object as PropType<DesignWidget>,
      required: true
    },

    radius: {
      type: Number,
      default: 0
    },

    rotate: {
      type: Number,
      default: 0
    }
  },

  emits: ['drag-start', 'drag-moving', 'drag-end', 'state-changed'],
  setup (props, { emit }) {
    const container: Ref<HTMLElement | undefined> = ref()
    onMounted(() => {
      if (container.value) {
        container.value.addEventListener('transitionend', () => {
          setTimeout(() => {
            emit('state-changed', { id: props.value.id, state: 0 })
          }, 200)
        }, true)
      }
    })

    const service = inject(DesignService.token) as DesignService
    const draggingService = new DraggingService(service, emit)

    const containerClass = computed(() => {
      if (props.value.state === 1) {
        return 'drag_container selected'
      } else if (props.value.state === 3 || props.value.state === -1) {
        return 'drag_container dragging'
      } else if (props.value.state === 4) {
        return 'drag_container moving'
      } else {
        return 'drag_container'
      }
    })

    const renderCover = () => {
      if (props.value.state !== 2) {
        return h(
          'div',
          {
            id: props.value.id + '_cover',
            class: props.value.state === 4 ? 'cover moving' : 'cover',
            style: {
              borderRadius: props.radius + 'px'
            },
            onmousedown: (event: MouseEvent) => {
              if (props.value.enableDragable) {
                draggingService.mousedownHandler(event, props.value)
                emit('drag-start', props.value)
              }
            }
          }
        )
      }
    }

    const cssTransform = () => {
      let panelPoint = { x: props.value.x, y: props.value.y }
      if (props.value.state !== -1) {
        panelPoint = service.pageP2CavnaseP({ x: props.value.x, y: props.value.y })
      }

      let transform = 'translate(' + panelPoint.x + 'px,' + panelPoint.y + 'px)'
      if (props.value.state === 3 || props.value.state === 4) {
        transform += ' scale(1)'
      }
      if (props.rotate !== 0) {
        transform += ' rotate(' + props.rotate + 'deg)'
      }
      return transform
    }

    return { container, containerClass, renderCover, cssTransform }
  },

  render() {
    console.log("render drag container ", this.$props.value.id);
    return h(
      'div',
      {
        ref: 'container',
        class: this.containerClass,
        style: {
          transform: this.cssTransform(),
          width: this.$props.value.width + 'px',
          height: this.$props.value.height + 'px',
          borderRadius: this.$props.radius + 'px'
        }
      },
      [
        this.$slots.default && this.$slots.default(),
        this.renderCover()
      ]
    )
  }
})
