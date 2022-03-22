import { DesignWidget, Point } from '@/types'
import { computed, defineComponent, h, onMounted, PropType, Ref, ref } from 'vue'
import InlineSvg from 'vue-inline-svg'

export default defineComponent({
  name: 'DragContainer',

  props: {
    widget: {
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
    },

    minx: {
      type: Number,
      required: true
    },

    maxx: {
      type: Number,
      required: true
    },

    miny: {
      type: Number,
      required: true
    }
  },

  emits: ['state-changed', 'selected-widget', 'position-move'],
  setup (props, { emit }) {
    const container: Ref<HTMLElement | undefined> = ref()
    onMounted(() => {
      if (container.value) {
        container.value.addEventListener('transitionend', () => {
          setTimeout(() => {
            emit('state-changed', { id: props.widget.id, state: 0 })
          }, 200)
        }, true)
      }
    })

    const dragStartPosition = { x: 0, y: 0 }
    const orgPosition = { x: props.widget.x, y: props.widget.y }
    const onMouseDown = (event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (props.widget.state === 0) {
        emit('selected-widget', { id: props.widget.id })
      }

      dragStartPosition.x = event.clientX
      dragStartPosition.y = event.clientY
      orgPosition.x = props.widget.x
      orgPosition.y = props.widget.y

      window.addEventListener('mousemove', dragHandler, true)
      window.addEventListener('mouseup', dragEndHandler, true)
    }

    const lnx = computed(() => {
      return props.minx + (props.widget.margin.length === 4 ? props.widget.margin[3] : props.widget.margin[0])
    })

    const lmx = computed(() => {
      return props.maxx - props.widget.width - (props.widget.margin.length === 4 ? props.widget.margin[1] : props.widget.margin[0])
    })

    const lnt = computed(() => {
      return props.miny + props.widget.margin[0]
    })
    const dragHandler = (event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (props.widget.state !== 3) {
        emit('state-changed', 3)
      }
      const hspan = event.clientX - dragStartPosition.x
      const vspan = event.clientY - dragStartPosition.y

      let nx = orgPosition.x + hspan
      if (nx < lnx.value) {
        nx = lnx.value
      } else if (nx > lmx.value) {
        nx = lmx.value
      }
      let ny = orgPosition.y + vspan
      if (ny < lnt.value) {
        ny = lnt.value
      }

      emit('position-move', { x: nx, y: ny } as Point)
    }

    const dragEndHandler = (event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      window.removeEventListener('mousemove', dragHandler, true)
      window.removeEventListener('mouseup', dragEndHandler, true)
      emit('state-changed', { id: props.widget.id, state: 1 })
    }

    const containerClass = computed(() => {
      if (props.widget.state === 1) {
        return 'drag_container selected'
      } else if (props.widget.state === 3) {
        return 'drag_container dragging'
      } else if (props.widget.state === 4) {
        return 'drag_container moving'
      } else {
        return 'drag_container'
      }
    })

    const renderActions = () => {
      if (props.widget.state === 0) {
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
            h(InlineSvg, {
              src: require('@/assets/delete.svg'),
              style: {
                width: '20px',
                height: '20px'
              }
            })
          ]
        )
      }
    }

    const renderCover = () => {
      if (props.widget.state !== 2) {
        return h(
          'div',
          {
            id: props.widget.id + '_cover',
            class: props.widget.state === 4 ? 'cover moving' : 'cover',
            style: {
              borderRadius: props.radius + 'px'
            },
            onmousedown: (event: MouseEvent) => onMouseDown(event)
          }
        )
      }
    }

    const cssTransform = () => {
      let transform = 'translate(' + props.widget.x + 'px,' + props.widget.y + 'px)'
      if (props.widget.state === 3 || props.widget.state === 4) {
        transform += ' scale(1.02)'
      }
      if (props.rotate !== 0) {
        transform += ' rotate(' + props.rotate + 'deg)'
      }
      return transform
    }

    return { container, containerClass, renderActions, renderCover, cssTransform, dragHandler, dragEndHandler }
  },

  render () {
    return h(
      'div',
      {
        ref: 'container',
        class: this.containerClass,
        style: {
          transform: this.cssTransform(),
          width: this.$props.widget.width + 'px',
          height: this.$props.widget.height + 'px',
          borderRadius: this.$props.radius + 'px'
        }
      },
      {
        default: () => [this.$slots.default && this.$slots.default(), this.renderCover()]
      }
    )
  }
})
