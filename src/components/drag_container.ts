import DesignService from '../services/design.service'
import DraggingService from '../services/dragging.service'
import { DesignWidget } from '../types'
import { computed, defineComponent, h, inject, onBeforeUnmount, onMounted, PropType, Ref, ref } from "vue";

export default defineComponent({
  name: 'DragContainer',

  props: {
    value: {
      type: Object as PropType<DesignWidget>,
      required: true
    },
    widgetIdx: {
      type: Number||undefined,
      default: undefined
    },
    radius: {
      type: Number,
      default: 0
    },
    rotate: {
      type: Number,
      default: 0
    },
  },

  emits: ['drag-start', 'drag-moving', 'drag-end', 'state-changed', 'del-widgets'],
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
            class: props.value.state === 3 ? 'cover moving' : 'cover',
            style: {
              borderRadius: props.radius + 'px',
              background: (service.modal.selecteds.length===1||props.value.state === -1)
              &&props.value.isOverlapping?'rgba(255, 100, 100, 0.05)':'',
            },
            onmousedown: (event: MouseEvent) => {
              event.preventDefault()
              event.stopPropagation()
              if (props.value.enableDragable) {
                // 单个页面组件拖拽widgetIdx存在
                if(props.widgetIdx!==undefined){
                  const yWidget = service.syncService.yWidget.get(props.widgetIdx)
                  yWidget && draggingService.mousedownHandler(event, yWidget)
                }
                emit('drag-start', event, props.value)
              }
            }
          }
        )
      }
    }

    const cssTransform = () => {
      let panelPoint = { x: props.value.x, y: props.value.y }

      let transform = 'translate(' + panelPoint.x + 'px,' + panelPoint.y + 'px)'

      if(props.value.state === -1){
        transform += ` scale(${service.modal.scale})`
      }
      if (props.value.state === 3 || props.value.state === 4) {
        transform += ' scale(1)'
      }
      if (props.rotate !== 0) {
        transform += ' rotate(' + props.rotate + 'deg)'
      }
      return transform
    }

    return {
      container, containerClass, renderCover,
      cssTransform, service,
      state: props.value.state,
      tag: props.value.tag
    }
  },

  render() {
    return h(
      'div',
      {
        ref: 'container',
        class: this.containerClass,
        style: {
          transform: this.cssTransform(),
          width: this.$props.value.width + 'px',
          height: this.$props.value.height + 'px',
          borderRadius: this.$props.radius + 'px',
          zIndex: this.state===-1 ? 2000:this.tag==='GridLayout'?0:10
        }
      },
      [
        this.$slots.default && this.$slots.default(),
        this.renderCover(),
        // this.$props.value.id, h('div'),
        // this.$props.value.x, '-', this.$props.value.y, h('div'),
        // 'state    ', this.$props.value.state, h('div'),
        // 'index    ', this.$props.widgetIdx
        // this.$props.value.moveing+'', h('div'),
        // this.$props.value.resizing+'', h('div'),
        // this.$props.value.baseX, '-', this.$props.value.baseY, h('div'),
        // this.$props.value.width, '-', this.$props.value.height
      ]
    )
  }
})
