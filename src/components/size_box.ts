import DesignService from '@/services/design.service'
import DraggingService from '@/services/dragging.service'
import { computed, defineComponent, h, inject } from 'vue'
const MIN_SPAN = 8

export default defineComponent({
  setup (props, { emit }) {
    let orgMousePosition = { x: 0, y: 0 }
    let direct: Array<string> = []

    const designService = inject(DesignService.token) as DesignService
    const service = new DraggingService(designService)

    const position = computed(() => {
      const bxarray = designService.modal.selecteds.map(item => item.x)
      const byarray = designService.modal.selecteds.map(item => item.y)
      const begin = {
        x: Math.min(...bxarray),
        y: Math.min(...byarray)
      }

      const exarray = designService.modal.selecteds.map(item => item.x + item.width)
      const eyarray = designService.modal.selecteds.map(item => item.y + item.height)
      const end = {
        x: Math.max(...exarray),
        y: Math.max(...eyarray)
      }

      return { x: begin.x, y: begin.y, width: (end.x - begin.x), height: (end.y - begin.y) }
    })

    let orgPosition = { x: 0, y: 0, width: 0, height: 0 }
    const oldWidgetPosition = new Map<string, {x: number, y: number, width: number, height: number}>()
    const onMouseMoveHandler = (event: MouseEvent) => {
      let changed = false
      const newposition = { x: 0, y: 0, width: 0, height: 0 }
      if (direct[0] !== 'n') {
        let widthDirect = 1
        const hspan = (event.clientX - orgMousePosition.x) / designService.modal.scale
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

      if (direct[1] !== 'n') {
        let heightDirect = 1
        const vspan = event.clientY - orgMousePosition.y
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
          const old = oldWidgetPosition.get(widget.id)
          if (widget && old) {
            widget.x = old.x + newposition.x
            widget.y = old.y + newposition.y
            widget.width = old.width + newposition.width
            widget.height = old.height + newposition.height
          }
        }
      }
    }

    const onMouseDown = (directparam: Array<string>, event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()

      direct = directparam
      orgMousePosition = { x: event.clientX, y: event.clientY }

      orgPosition = { ...position.value }
      oldWidgetPosition.clear()
      for (let i = 0; i < designService.modal.selecteds.length; i++) {
        const widget = designService.modal.selecteds[i]
        oldWidgetPosition.set(widget.id, { x: widget.x, y: widget.y, width: widget.width, height: widget.height })
      }

      window.addEventListener('mousemove', onMouseMoveHandler, true)
      window.addEventListener('mouseup', onMouseUp, true)
    }

    const onMouseUp = (event: MouseEvent) => {
      window.removeEventListener('mousemove', onMouseMoveHandler, true)
      window.removeEventListener('mouseup', onMouseUp, true)

      oldWidgetPosition.clear()
    }

    const hx = computed(() => designService.modal.pageRect.x + position.value.x + 4)
    const htop = computed(() => designService.modal.pageRect.y + position.value.y - 4)
    const hbottom = computed(() => designService.modal.pageRect.y + position.value.y + position.value.height - 4)
    const hwidth = computed(() => position.value.width > 8 ? (position.value.width - 8) : 0)

    const vtop = computed(() => designService.modal.pageRect.y + position.value.y + 4)
    const vleft = computed(() => designService.modal.pageRect.x + position.value.x - 4)
    const vright = computed(() => designService.modal.pageRect.x + position.value.x + position.value.width - 4)
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

    const conLTX = computed(() => designService.modal.pageRect.x + position.value.x - 6)
    const conLTY = computed(() => designService.modal.pageRect.y + position.value.y - 6)
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
              left: (designService.modal.pageRect.x + position.value.x) + 'px',
              top: (designService.modal.pageRect.y + position.value.y) + 'px',
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

  render () {
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
