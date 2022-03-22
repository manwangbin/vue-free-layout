import { DesignWidget } from '@/types'
import { computed, defineComponent, h, PropType, watch } from 'vue'
const MIN_SPAN = 2

export default defineComponent({
  props: {
    widget: {
      type: Object as PropType<DesignWidget>,
      required: true
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
    },

    xoffset: {
      type: Number,
      required: true
    },

    yoffset: {
      type: Number,
      required: true
    }
  },

  setup (props, { emit }) {
    let orgMousePosition = { x: 0, y: 0 }
    let direct: Array<string> = []
    let orgPosition = { ...props.widget }

    const maxWidth = computed(() => {
      return props.maxx - props.widget.x - (props.widget.margin.length === 4 ? props.widget.margin[1] : props.widget.margin[0])
    })

    const onMouseMoveHandler = (event: MouseEvent) => {
      let changed = false
      const newposition = { ...props.widget }
      if (direct[0] !== 'n') {
        let widthDirect = 1
        let hspan = event.clientX - orgMousePosition.x
        if (direct[0] === 'l') {
          widthDirect = -1
          let nx = orgPosition.x + hspan
          if (nx < props.minx) {
            nx = props.minx
            hspan = props.minx - orgPosition.x
          }
          newposition.x = nx
        }
        let nwith = orgPosition.width + hspan * widthDirect
        if (nwith < MIN_SPAN) {
          nwith = MIN_SPAN
          if (direct[0] === 'l') {
            newposition.x = orgPosition.x + orgPosition.width - MIN_SPAN
          }
        } else if (nwith > maxWidth.value) {
          nwith = maxWidth.value
        }
        newposition.width = nwith
        changed = true
      }

      if (direct[1] !== 'n') {
        let heightDirect = 1
        let vspan = event.clientY - orgMousePosition.y
        if (direct[1] === 't') {
          heightDirect = -1
          let ny = orgPosition.y + vspan
          if (ny < props.miny) {
            ny = props.miny
            vspan = props.miny - orgPosition.y
          }
          newposition.y = ny
        }
        let nheight = orgPosition.height + vspan * heightDirect
        if (nheight < MIN_SPAN) {
          nheight = MIN_SPAN
          if (direct[1] === 't') {
            newposition.y = orgPosition.y + orgPosition.height - MIN_SPAN
          }
        }
        newposition.height = nheight
        changed = true
      }

      if (changed) {
        emit('size-changed', newposition)
      }
    }

    const onMouseDown = (directparam: Array<string>, event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()

      direct = directparam
      orgMousePosition = { x: event.clientX, y: event.clientY }
      orgPosition = { ...props.widget }

      window.addEventListener('mousemove', onMouseMoveHandler, true)
      window.addEventListener('mouseup', onMouseUp, true)
    }

    const onMouseUp = (event: MouseEvent) => {
      window.removeEventListener('mousemove', onMouseMoveHandler, true)
      window.removeEventListener('mouseup', onMouseUp, true)
    }

    const marginT = computed(() => props.widget.margin[0])
    const marginR = computed(() => props.widget.margin.length === 4 ? props.widget.margin[1] : props.widget.margin[0])
    const marginB = computed(() => props.widget.margin.length === 4 ? props.widget.margin[2] : props.widget.margin[0])
    const marginL = computed(() => props.widget.margin.length === 4 ? props.widget.margin[3] : props.widget.margin[0])

    const hx = computed(() => props.xoffset + props.widget.x + 4 - marginL.value)
    const htop = computed(() => props.yoffset + props.widget.y - 4 - marginT.value)
    const hbottom = computed(() => props.yoffset + props.widget.y + props.widget.height + marginB.value - 4)
    const hwidth = computed(() => props.widget.width > 8 ? (props.widget.width + marginL.value + marginR.value - 8) : 0)

    const vtop = computed(() => props.yoffset + props.widget.y + 4 - marginT.value)
    const vleft = computed(() => props.xoffset + props.widget.x - 4 - marginL.value)
    const vright = computed(() => props.xoffset + props.widget.x + props.widget.width - 4 + marginR.value)
    const vheight = computed(() => props.widget.height > 8 ? props.widget.height + marginT.value + marginB.value - 8 : 0)

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

    const conLTX = computed(() => props.xoffset + props.widget.x - marginL.value - 6)
    const conLTY = computed(() => props.yoffset + props.widget.y - marginT.value - 6)
    const conRTX = computed(() => conLTX.value + props.widget.width + marginR.value)
    const conRBX = computed(() => conLTY.value + props.widget.height + marginB.value)
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

    return { renderBorders, drawConerBox }
  },

  render () {
    return h(
      'div',
      {},
      [
        ...this.renderBorders(),
        ...this.drawConerBox()
      ])
  }
})
