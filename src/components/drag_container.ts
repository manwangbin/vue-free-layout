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
    widgetIdx: {
      type: Number,
      default: 0
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
                const yWidget = service.syncService.yWidget.get(props.widgetIdx)
                draggingService.mousedownHandler(event, yWidget)
                emit('drag-start', props.value)
              }
            }
          }
        )
      }
    }

    // 操作栏
    const renderOperationBar = () => {
      if(props.value.state !== 1 || service.modal.selecteds.length!==1) return
      return h(
        'div',
        {
          class: 'operation-bar',
          onmousedown: (event: MouseEvent)=>{
            event.preventDefault()
            event.stopPropagation()
          }
        },
        [
          h(
            'div',
            {
              class: 'del-icon',
              innerHTML: `<svg t="1683510918742" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2402" width="16" height="16" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M214.6048 298.666667v598.613333a41.429333 41.429333 0 0 0 41.386667 41.386667h513.28c22.869333 0 41.386667-18.56 41.386666-41.386667V298.666667h-596.053333z m554.666667 725.333333h-513.28c-69.845333 0-126.72-56.832-126.72-126.72V213.333333h766.72v683.946667c0 69.888-56.832 126.72-126.72 126.72z" fill="#f44d50" p-id="2403"></path><path d="M981.333333 298.666667H42.666667c-23.466667 0-42.666667-19.2-42.666667-42.666667s19.2-42.666667 42.666667-42.666667h938.666666c23.466667 0 42.666667 19.2 42.666667 42.666667s-19.2 42.666667-42.666667 42.666667M768 213.333333H682.666667V128c0-23.509333-19.114667-42.666667-42.666667-42.666667H384c-23.509333 0-42.666667 19.157333-42.666667 42.666667v85.333333H256V128c0-70.570667 57.429333-128 128-128h256c70.570667 0 128 57.429333 128 128v85.333333zM384 810.666667c-23.466667 0-42.666667-19.2-42.666667-42.666667V469.333333c0-23.466667 19.2-42.666667 42.666667-42.666666s42.666667 19.2 42.666667 42.666666v298.666667c0 23.466667-19.2 42.666667-42.666667 42.666667M640 810.666667c-23.466667 0-42.666667-19.2-42.666667-42.666667V469.333333c0-23.466667 19.2-42.666667 42.666667-42.666666s42.666667 19.2 42.666667 42.666666v298.666667c0 23.466667-19.2 42.666667-42.666667 42.666667" fill="#f44d50" p-id="2404"></path></svg>`,
              onClick: (event: MouseEvent) => {
                service.deleteWidget(props.value)
              }
            }
          )
        ]
      )
    }

    const cssTransform = () => {
      let panelPoint = { x: props.value.x, y: props.value.y }
      // if (props.value.state !== -1) {
        // panelPoint = service.pageP2CavnaseP({ x: props.value.x, y: props.value.y })
      // }

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

    return { container, containerClass, renderCover, renderOperationBar, cssTransform, service, state: props.value.state }
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
          zIndex: this.state===-1 ? 2000:0
        }
      },
      [
        this.$slots.default && this.$slots.default(),
        this.renderCover(),
        // this.$props.value.parent,
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
