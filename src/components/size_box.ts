import DesignService from '../services/design.service'
import DraggingService from '../services/dragging.service'
import { computed, defineComponent, h, inject } from 'vue'
const MIN_SPAN = 8

export default defineComponent({
  emits: ['drag-start', 'drag-moving', 'drag-end', 'reszie-start', 'resize-end', 'resizeing'],
  setup (props, { emit }) {
    let orgMousePosition = { x: 0, y: 0 }
    let direct: Array<string> = []

    const designService = inject(DesignService.token) as DesignService
    const service = new DraggingService(designService, emit)

    const position = designService.selectedPosition

    let orgPosition = { x: 0, y: 0, width: 0, height: 0 }
    const oldWidgetPosition = new Map<string, {x: number, y: number, width: number, height: number}>()

    const onMouseDown = (directparam: Array<string>, event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()

      window.addEventListener('mousemove', onMouseMoveHandler, true)
      window.addEventListener('mouseup', onMouseUp, true)

      direct = directparam
      orgMousePosition = { x: event.clientX, y: event.clientY }

      orgPosition = { ...position.value }
      oldWidgetPosition.clear()
      for (let i = 0; i < designService.modal.selecteds.length; i++) {
        const widget = designService.modal.selecteds[i]
        oldWidgetPosition.set(<string>widget.get('id'),
          { x: <number>widget.get('x'), y: <number>widget.get('y'),
            width: <number>widget.get('width'), height: <number>widget.get('height') })
        emit('reszie-start', widget.toJSON())
      }
    }

    const onMouseMoveHandler = (event: MouseEvent) => {
      let changed = false
      const newposition = { x: 0, y: 0, width: 0, height: 0 }
      // 左右
      if (direct[0] !== 'n') {
        let widthDirect = 1
        const hspan = (event.clientX - orgMousePosition.x) / designService.modal.scale
        // 左
        if (direct[0] === 'l') {
          widthDirect = -1
          newposition.x = hspan
        }

        let widthSpan = hspan * widthDirect
        if ((orgPosition.width + widthSpan) < MIN_SPAN) {
          widthSpan = MIN_SPAN - orgPosition.width
          if (direct[0] === 'l') {
            newposition.x = orgPosition.width - MIN_SPAN
          }
        }
        newposition.width = widthSpan
        changed = true
      }

      // 上下
      if (direct[1] !== 'n') {
        let heightDirect = 1
        const vspan = event.clientY - orgMousePosition.y
        // 上
        if (direct[1] === 't') {
          heightDirect = -1
          newposition.y = vspan
        }
        let heightSpan = vspan * heightDirect
        if ((orgPosition.height + heightSpan) < MIN_SPAN) {
          heightSpan = MIN_SPAN - orgPosition.width
          if (direct[1] === 't') {
            newposition.y = orgPosition.height - MIN_SPAN
          }
        }
        newposition.height = heightSpan
        changed = true
      }

      if (changed) {
        for (let i = 0; i < designService.modal.selecteds.length; i++) {
          const widget = designService.modal.selecteds[i]
          if(widget.get('parent')!=='root') continue
          const old = oldWidgetPosition.get(widget.get('id') as string)
          if (widget && old) {
            widget.set('x', old.x + newposition.x)
            widget.set('y', old.y + newposition.y)
            widget.set('width', old.width + newposition.width)
            widget.set('height', old.height + newposition.height)
            widget.set('baseX', old.x + newposition.x)
            widget.set('baseY', old.y + newposition.y)
            widget.set('resizing', true)

            emit('resizeing', widget.toJSON())
          }
        }
        // 吸附
        designService.alignLineService?.onBoundaryMove(designService.modal.selecteds, direct)
      }
    }

    const onMouseUp = (event: MouseEvent) => {
      window.removeEventListener('mousemove', onMouseMoveHandler, true)
      window.removeEventListener('mouseup', onMouseUp, true)
      for (let i = 0; i < designService.modal.selecteds.length; i++) {
        const widget = designService.modal.selecteds[i]
        widget.set('resizing', false)
        emit('reszie-start', widget.toJSON())
      }
      oldWidgetPosition.clear()
    }

    const hx = computed(() => position.value.x + 4)
    const htop = computed(() => position.value.y - 4)
    const hbottom = computed(() => position.value.y + position.value.height - 4)
    const hwidth = computed(() => position.value.width > 8 ? (position.value.width - 8) : 0)

    const vtop = computed(() => position.value.y + 4)
    const vleft = computed(() => position.value.x - 4)
    const vright = computed(() => position.value.x + position.value.width - 4)
    const vheight = computed(() => position.value.height > 8 ? position.value.height - 8 : 0)

    const renderBorders = () => {
      return [
        // top
        h(
          'div',
          {
            class: 'size-border-container size-border-h',
            style: {
              left: hx.value + 'px',
              top: htop.value + 'px',
              width: hwidth.value + 'px'
            },
            onmousedown: (event:MouseEvent) => onMouseDown(['n', 't'], event)
          },
          [
            h(
              'div',
              {
                class: 'size-border-h border'
              }
            )
          ]
        ),
        // right
        h(
          'div',
          {
            class: 'size-border-container size-border-v',
            style: {
              left: vright.value + 'px',
              top: vtop.value + 'px',
              height: vheight.value + 'px'
            },
            onmousedown: (event:MouseEvent) => onMouseDown(['r', 'n'], event)
          },
          [
            h(
              'div',
              {
                class: 'size-border-v border'
              }
            )
          ]
        ),
        // bottom
        h(
          'div',
          {
            class: 'size-border-container size-border-h',
            style: {
              left: hx.value + 'px',
              top: hbottom.value + 'px',
              width: hwidth.value + 'px'
            },
            onmousedown: (event:MouseEvent) => onMouseDown(['n', 'b'], event)
          },
          [
            h(
              'div',
              {
                class: 'size-border-h border'
              }
            )
          ]
        ),
        // left
        h(
          'div',
          {
            class: 'size-border-container size-border-v',
            style: {
              left: vleft.value + 'px',
              top: vtop.value + 'px',
              height: vheight.value + 'px'
            },
            onmousedown: (event:MouseEvent) => onMouseDown(['l', 'n'], event)
          },
          [
            [
              h(
                'div',
                {
                  class: 'size-border-v border'
                }
              )
            ]
          ]
        )
      ]
    }

    const conLTX = computed(() => position.value.x - 6)
    const conLTY = computed(() => position.value.y - 6)
    const conRTX = computed(() => conLTX.value + position.value.width)
    const conRBX = computed(() => conLTY.value + position.value.height)
    const drawConerBox = () => {
      return [
        // left top
        h(
          'div',
          {
            class: 'size-border-corn nwse-resize',
            style: {
              left: conLTX.value + 'px',
              top: conLTY.value + 'px'
            },
            onmousedown: (event:MouseEvent) => onMouseDown(['l', 't'], event)
          },
          [
            h(
              'div',
              {
                class: 'quart'
              }
            )
          ]
        ),

        // right top
        h(
          'div',
          {
            class: 'size-border-corn nesw-resize',
            style: {
              left: conRTX.value + 'px',
              top: conLTY.value + 'px'
            },
            onmousedown: (event:MouseEvent) => onMouseDown(['r', 't'], event)
          },
          [
            h(
              'div',
              {
                class: 'quart'
              }
            )
          ]
        ),

        // right bottom
        h(
          'div',
          {
            class: 'size-border-corn nwse-resize',
            style: {
              left: conRTX.value + 'px',
              top: conRBX.value + 'px'
            },
            onmousedown: (event:MouseEvent) => onMouseDown(['r', 'b'], event)
          },
          [
            h(
              'div',
              {
                class: 'quart'
              }
            )
          ]
        ),

        // left bottom
        h(
          'div',
          {
            class: 'size-border-corn nesw-resize',
            style: {
              left: conLTX.value + 'px',
              top: conRBX.value + 'px'
            },
            onmousedown: (event:MouseEvent) => onMouseDown(['l', 'b'], event)
          },
          [
            h(
              'div',
              {
                class: 'quart'
              }
            )
          ]
        )
      ]
    }

    const renderCover = () => {
      if (designService.modal.selecteds.length > 1) {
        return h(
          'div',
          {
            class: 'size-cover',
            style: {
              left: (position.value.x) + 'px',
              top: (position.value.y) + 'px',
              width: position.value.width + 'px',
              height: position.value.height + 'px'
            },
            onmousedown: (event:MouseEvent) => service.mousedownHandler(event, undefined)
          }
        )
      }
    }

    return { renderBorders, drawConerBox, renderCover }
  },

  render() {
    return h(
      'div',
      {},
      [
        ...this.renderBorders(),
        ...this.drawConerBox(),
        this.renderCover()
      ])
  }
})
